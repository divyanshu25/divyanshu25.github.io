# Going Fast: Every Optimization That Made LLM Training Fly

*Notes from making [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat), my GPT-2 scale training repo, actually use the GPU it runs on.*

---

The first time I got VibeNanoChat training end to end, I was pretty happy. The loss was going down, the samples were slowly getting less garbled, everything looked fine. Then I computed the MFU and it was embarrassing.

MFU stands for Model FLOPs Utilization. It's a simple idea: your GPU has some peak number of floating-point operations it can do per second, and MFU is the fraction of that peak your training run actually turns into useful work. If the GPU can do 1,000 TFLOPS and your forward and backward passes are doing 400 TFLOPS worth of math, you're at 40%. The rest of the time the GPU is sitting there waiting. Waiting on memory, waiting on the CPU, waiting for the next batch to show up. And you're paying for all of it.

This post is the list of things I changed to fix that. There are six of them. Some are literally one line. A couple took real thought. I'll go roughly from easiest to hardest.

## 1. TF32

Here's the first one, and it's a single line you should put at the top of every PyTorch training script you ever write:

```python
torch.set_float32_matmul_precision("high")
```

To see why it helps, you need to know that an NVIDIA GPU has two kinds of compute units. CUDA cores do general-purpose math. Tensor cores do one thing, matrix multiplication, and they're much faster at it. The catch is that tensor cores can't do full-precision FP32. So by default, when PyTorch multiplies two FP32 matrices, it runs on the slower CUDA cores.

A floating-point number has an exponent, which sets how big or small it can be, and a mantissa, which sets how precise it is. FP32 has 8 exponent bits and 23 mantissa bits. TF32 keeps the 8 exponent bits but only 10 mantissa bits:

```
FP32: [sign 1][exponent 8][mantissa 23]  -> CUDA cores
TF32: [sign 1][exponent 8][mantissa 10]  -> tensor cores
```

Same range, less precision, and now the multiply can run on tensor cores. On an A100, FP32 on CUDA cores peaks at 19.5 TFLOPS and TF32 on tensor cores peaks at 156. That's 8x. Setting precision to `"high"` is what turns this on. (`"highest"` is the slow default, and `"medium"` lets FP32 matmuls go even lower, to BF16, which we'll get to next.)

Is throwing away 13 bits of precision okay? Yes. Neural network training doesn't care about the bottom bits of each number. You won't see a difference in the loss curve.

Don't expect your training to get 8x faster though. Only the matrix multiplies speed up. Softmax, layer norms, reading and writing memory, none of that changes. In practice you get something like 10 to 40% depending on the model. For one line, that's a great trade.

## 2. BF16 mixed precision

TF32 makes the multiplies faster, but every number is still stored in 4 bytes. BF16 stores each number in 2. That means half as much data to move around, and tensor cores chew through BF16 about twice as fast as TF32.

The trick is that you don't train the model in BF16. You keep the weights in FP32 and only run the forward pass in BF16, using autocast:

```python
with torch.autocast(device_type=self.device, dtype=torch.bfloat16):
    _, per_token_loss = self.model(x, y, loss_reduction="none")
```

Inside that block, PyTorch decides op by op. Matmuls and attention run in BF16. Things that are sensitive to precision, like softmax, normalization and summing up the loss, stay in FP32. The weights and their gradients are still FP32, so when the optimizer updates them, it does so at full precision. You get most of the speed of low precision without the numerical problems.

Why BF16 and not FP16? Look at the bits:

```
FP16: [sign 1][exponent 5][mantissa 10]
BF16: [sign 1][exponent 8][mantissa 7]
FP32: [sign 1][exponent 8][mantissa 23]
```

FP16 only has 5 exponent bits, so the largest number it can represent is about 65,504. Big activations overflow, and tiny gradients round down to zero. People used to work around this with loss scaling: multiply the loss by some large number before backward, then divide the gradients back down after. It works, but it's fiddly. BF16 has the same 8 exponent bits as FP32, so it covers the same range and none of that is needed. You lose precision, not range, and as we saw with TF32, precision is the thing training can afford to lose.

I went one step further and stored the embedding tables themselves in BF16:

```python
def cast_embeddings_to_bfloat16(self):
    """Cast token and value embeddings to bfloat16 (nanochat-style)."""
    if self.transformer.wte.weight.device.type == "cuda":
        self.transformer.wte.to(dtype=torch.bfloat16)
        for ve in self.value_embeds.values():
            ve.to(dtype=torch.bfloat16)

raw_model = GPT(config, master_process=master_process)
raw_model.to(device)
raw_model.cast_embeddings_to_bfloat16()
```

An embedding table is just a lookup table. A token ID comes in, you grab that row. But it's a big table (vocab size times model width), so halving its size is a real memory win, and the optimizer is fine with the lower precision. Same story for the RoPE tables, the sines and cosines used for rotary position embeddings. They're fixed and never trained, so I just build them in BF16 from the start:

```python
cos, sin = precompute_rotary_embeddings(
    self.rotary_seq_len, head_dim, base=10000,
    device="cpu", dtype=torch.bfloat16,
)
```

Altogether this roughly doubled forward pass throughput, and the memory I saved let me use a bigger batch.

## 3. torch.compile

```python
model = torch.compile(raw_model, dynamic=False)
```

I was a bit skeptical of torch.compile at first, because it's a black box and black boxes have a way of breaking at the worst time. But it works, and the speedup is real.

To understand what it's doing, think about how PyTorch normally runs your model. Every operation is its own GPU kernel. An add is a kernel. A multiply is a kernel. A GELU is a kernel. Each one reads its inputs from GPU memory, does a tiny bit of math, and writes the result back to memory, where the next kernel reads it again. For a chain of small elementwise ops, almost all the time goes into those memory round trips, not the math.

torch.compile looks at your whole forward pass, figures out which ops can be merged, and generates one kernel for the whole chain. Data gets loaded once, all the math happens, and the result is written once. It also drops work that doesn't need to happen and precomputes anything that's constant.

The `dynamic=False` part tells it that input shapes never change. That's true in training, where every batch is `(batch_size, block_size)`. With fixed shapes, the compiler can write code for those exact sizes, instead of general code that has to check shapes every time.

One thing that confused me at first: the `torch.compile()` call returns instantly. It doesn't actually compile anything yet. The real work happens on the first forward pass, when it sees real tensors for the first time. So your first step will be slow, sometimes really slow, and then everything after it is fast. Expect something like 10 to 30% faster training.

Small practical note: I keep a reference to the uncompiled `raw_model` around. That way, when I save a checkpoint, I don't have to deal with unwrapping the compiled one.

## 4. Flash Attention

This is the one that needs a bit of explaining.

In standard attention, you compute a score for every pair of tokens in the sequence. For a sequence of length T, that's a T × T matrix, per head. And it gets written out to HBM, the GPU's main memory. Let's put numbers on it. With 12 heads at 4 bytes per number:

```
T = 1,024:  12 × 1,024 × 1,024 = 12.6M numbers = 50 MB
T = 8,192:  12 × 8,192 × 8,192 = 805M numbers  = 3.2 GB
```

3.2 GB, for the attention scores of a single layer. And it grows with T², so it gets bad quickly.

The key thing to realize about attention is that the GPU isn't slow at the math. It's slow at moving that giant matrix in and out of memory. Flash Attention's idea is to never write the matrix out at all. GPUs have a small amount of very fast on-chip memory called SRAM. Flash Attention splits the computation into tiles that fit in SRAM, does all the work for a tile there, and only writes out the final result. It's still exact attention, not some approximation. You get the same answer up to rounding. But the extra memory now grows with T instead of T², and it runs a lot faster.

My attention code tries the fastest option first and falls back if it's not available. Flash Attention 3 only runs on Hopper GPUs (H100, H200), Flash Attention 2 runs on Ampere (A100, A10 and friends), and if neither loads, PyTorch's built-in `scaled_dot_product_attention` (SDPA) is the fallback. I check which ones load once, when the module is imported:

```python
def _load_flash_attention_3():
    """Try to load Flash Attention 3 (requires Hopper GPU, sm90)."""
    if not torch.cuda.is_available():
        return None
    try:
        major, _ = torch.cuda.get_device_capability()
        if major < 9:  # FA3 is Hopper (sm90) only
            return None
        from kernels import get_kernel
        return get_kernel("varunneal/flash-attention-3").flash_attn_interface
    except Exception:
        return None

def _load_flash_attention_2():
    """Try to load Flash Attention 2 (A100, A10, etc.)."""
    if not torch.cuda.is_available():
        return None
    try:
        from kernels import get_kernel
        return get_kernel("kernels-community/flash-attn2")
    except Exception:
        return None

_fa3 = _load_flash_attention_3()
_fa2 = _load_flash_attention_2()
```

And then at runtime, pick the best one that works for the current inputs:

```python
def attention_forward(q, k, v, is_causal=True, enable_gqa=False, window_size=()):
    supported_dtypes_fa3 = (torch.float16, torch.bfloat16, torch.float8_e4m3fn)
    supported_dtypes_fa2 = (torch.float16, torch.bfloat16)

    use_fa3 = HAS_FA3 and q.is_cuda and q.dtype in supported_dtypes_fa3
    use_fa2 = HAS_FA2 and q.is_cuda and q.dtype in supported_dtypes_fa2

    if use_fa3 or use_fa2:
        # Flash Attention wants (B, T, n_head, head_dim);
        # PyTorch uses (B, n_head, T, head_dim)
        q = q.transpose(1, 2)
        k = k.transpose(1, 2)
        v = v.transpose(1, 2)

        T = q.size(1)
        fa_window_size = (-1, -1) if len(window_size) == 0 or window_size[0] >= T else window_size

        if use_fa3:
            output = _fa3.flash_attn_func(q, k, v, causal=is_causal, window_size=fa_window_size)
        else:
            output = _fa2.flash_attn_func(q, k, v, causal=is_causal, window_size=fa_window_size)

        return output.transpose(1, 2)
    else:
        return F.scaled_dot_product_attention(q, k, v, dropout_p=0.0, is_causal=is_causal)
```

FA3 is the fastest, roughly 2 to 3x over standard attention, because it uses tensor core instructions only Hopper has. FA2 is still very fast and is what most people will be running. SDPA is fine, it's a fused kernel so it's already much better than naive attention, it's just not as tuned.

Notice the dtype checks. Flash Attention only accepts FP16 or BF16, so this whole section depends on the BF16 autocast from section 2. If you run without it, say on a CPU or a Mac, you fall back to SDPA in FP32. Nothing breaks, it's just slower.

A nice bonus is that Flash Attention supports grouped query attention (several query heads sharing one key/value head) and sliding-window attention out of the box, and my model uses both. Passing `window_size=(512, 0)` means each token looks back at the previous 512 tokens and nothing ahead. That gives you local attention with no extra code.

## 5. Don't make the GPU wait for data

Here's the training loop everyone writes first:

```python
for batch in dataset:
    train_step(batch)
```

The problem is that it runs one thing at a time. The GPU does a forward and backward pass, then sits completely idle while the CPU reads the next chunk of files, tokenizes it, and packs it into a batch. Then the GPU goes again. Your most expensive piece of hardware is waiting on your cheapest one.

The fix is to have separate CPU processes building batches in the background while the GPU is busy. PyTorch's DataLoader does this for you if you ask it to:

```python
self.dataloader = DataLoader(
    dataset,
    batch_size=1,           # the dataset already packs full batches
    collate_fn=self.collator,
    num_workers=4,
    prefetch_factor=4,
    pin_memory=use_pin_memory,
    persistent_workers=True,
    drop_last=False,
)
```

`num_workers=4` starts 4 worker processes. Each one reads Parquet files, tokenizes, packs sequences, and drops finished batches into a shared queue. `prefetch_factor=4` means each worker tries to keep 4 batches ready ahead of time, so with 4 workers there are up to 16 batches waiting at any moment. The GPU basically never has to wait.

`persistent_workers=True` is the one people forget. Without it, PyTorch kills all the workers at the end of every epoch and starts fresh ones for the next, which can take several seconds on a large dataset. With it, the workers just stay alive and keep going.

## 6. Pinned memory and non-blocking copies

The last one is about something that happens every time you call `.to("cuda")`, which you probably never think about.

The GPU copies data from CPU memory using a DMA engine, a piece of hardware that moves memory without bothering the CPU. But normal CPU memory is "pageable", meaning the operating system is free to move it around or swap it to disk whenever it wants. The DMA engine can't read from memory that might move out from under it. So when you call `.to("cuda")` on a normal tensor, CUDA quietly copies it into a temporary buffer that the OS isn't allowed to move, then copies that buffer to the GPU, and your Python code waits for both copies to finish.

Two copies, back to back, and the training loop is blocked the whole time.

The fix is two small settings that only work as a pair:

```python
dataloader = DataLoader(
    dataset,
    num_workers=4,
    prefetch_factor=4,
    pin_memory=True,
    persistent_workers=True,
)

x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
```

`pin_memory=True` tells the DataLoader to put batches in pinned (page-locked) memory from the start, so the DMA engine can read them directly. One copy instead of two. `non_blocking=True` tells CUDA to start the copy and return immediately instead of waiting. You don't have to worry about using the data before it arrives, CUDA orders things so the copy finishes before any GPU work that needs it.

Put the two together and the copy of the next batch happens while the GPU is still working on the current one. The transfer time just disappears behind the compute.

Two caveats. This only helps on CUDA, not on a CPU or a Mac, so my dataloader only turns pinning on when it's on CUDA with workers. And pinned memory can't be swapped to disk, so it uses up real RAM. Don't pin more than you need.

## All together

None of these really stand alone. Flash Attention needs BF16. Pinned memory is pointless without `non_blocking=True`. Here's the whole thing in one place:

```python
# 1. TF32
torch.set_float32_matmul_precision("high")

# 2. BF16 embeddings
raw_model = GPT(config)
raw_model.to(device)
raw_model.cast_embeddings_to_bfloat16()

# 3. compile, with fixed shapes
model = torch.compile(raw_model, dynamic=False)

# 4. Flash Attention gets picked when attention.py is imported,
#    and runs inside the model's forward pass

# 5 + 6. workers, prefetching, pinned memory
dataloader = DataLoader(
    dataset,
    num_workers=4,
    prefetch_factor=4,
    pin_memory=True,
    persistent_workers=True,
)

for x, y in dataloader:
    x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
    with torch.autocast(device_type=device, dtype=torch.bfloat16):
        _, loss = model(x, y)
    loss.backward()
    optimizer.step()
```

If you want to dig into the real code, it's all in [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat). TF32 and autocast are in `src/gpt_2/trainer.py`, Flash Attention is in `src/gpt_2/attention.py`, the BF16 embeddings and compile are in `src/gpt_2/training_utilities/model_setup.py`, and the dataloader is in `src/dataloaders/fineweb_edu_parquet_bos_dataloader.py`.
