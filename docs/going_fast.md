# Going Fast: Every Optimization That Made LLM Training Fly

*A from-scratch tour of the six changes that made [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat), a GPT-2 scale training framework, use its GPU properly. Assumes you know what a PyTorch training loop looks like and nothing about GPU internals.*

---

## 1. Where the time goes

Start with a plain training loop: load a batch, run the forward pass, run the backward pass, step the optimizer, repeat. The loss goes down, so everything looks fine.

But "the loss goes down" says nothing about how much of the GPU you're using. For that we need one number: **MFU (Model FLOPs Utilization)**. A GPU has a peak speed, measured in TFLOPS (trillions of floating-point operations per second). MFU is the fraction of that peak that goes into useful work: the math of the forward and backward passes.

$$\text{MFU} = \frac{\text{useful FLOPs per second}}{\text{peak FLOPs per second}}$$

If the GPU can do 1,000 TFLOPS and your training does 400 TFLOPS of useful math, your MFU is 40%. The missing 60% is lost in two ways: the GPU sits idle, or it runs work below its peak speed (slow math units, operations that spend their time moving memory instead of computing).

Where does it go? It turns out there are only a handful of answers:

```
1. The math runs on slow units.              -> TF32           (§2)
2. Every number takes 4 bytes, not 2.        -> BF16           (§3)
3. Every small op is its own trip to memory. -> torch.compile  (§4)
4. Attention moves a huge matrix around.     -> Flash Attention (§5)
5. The CPU is still building the next batch. -> DataLoader workers (§6)
6. The batch is still being copied over.     -> Pinned memory  (§7)
```

Each section below takes one of these, explains why it happens, and fixes it. They go roughly from easiest to hardest. The first one is a single line.

---

## 2. TF32: using the fast math units

### 2.1 The problem

An NVIDIA GPU has two kinds of compute units:

- **CUDA cores** do general-purpose math.
- **Tensor cores** do one thing, matrix multiplication, and are much faster at it.

Almost all of a transformer's compute is matrix multiplication, so you want it on the tensor cores. But by default, PyTorch runs FP32 matrix multiplies on the **CUDA cores**. Why? Because tensor cores can't handle FP32's full precision.

To see what that means, look at how a floating-point number is stored. It has an **exponent**, which sets how big or small the number can be (its range), and a **mantissa**, which sets how many digits of precision it keeps. FP32 uses 8 bits of exponent and 23 bits of mantissa. Tensor cores can't do math on 23-bit mantissas.

### 2.2 The fix

**TF32** keeps FP32's 8 exponent bits but only 10 mantissa bits:

```
FP32: [sign 1][exponent 8][mantissa 23]  -> CUDA cores
TF32: [sign 1][exponent 8][mantissa 10]  -> tensor cores
```

Same range, less precision, and now it fits on the tensor cores. Turning it on is one line:

```python
# trainer.py, before the training loop
torch.set_float32_matmul_precision("high")
```

How much faster is the math? On an A100, FP32 on CUDA cores peaks at 19.5 TFLOPS. TF32 on tensor cores peaks at 156 TFLOPS. That's $156 / 19.5 = 8\times$.

*Is it safe to drop 13 bits?* Yes. The range is unchanged, because the exponent is the same. Only the least significant digits are lost, and training doesn't depend on them.

*Does training get 8x faster?* No. Only the matrix multiplies speed up. Softmax, normalization, and reading and writing memory take as long as before. How much the whole step speeds up depends on how much of it is matmuls, and it's always far less than 8x.

> **Note:** `set_float32_matmul_precision` takes three values. `"highest"` is full FP32, the slow default. `"high"` is TF32, the one you want. `"medium"` lets FP32 matrix multiplies drop all the way to BF16 internally. It only affects matrix multiplies, which is narrower than the autocast in the next section.

Put this line in every PyTorch training script.

---

## 3. BF16 mixed precision: using half the bytes

### 3.1 The problem

TF32 makes the multiplies faster, but every number is still stored in 4 bytes. Moving data costs time too, and every activation, every weight read, every intermediate result is twice as big as it needs to be.

### 3.2 The fix: autocast to BF16

**BF16 (bfloat16)** stores a number in 2 bytes. Half the bytes means half the data to move, and tensor cores do BF16 math twice as fast as TF32 (312 vs 156 TFLOPS on an A100).

The trick is that we don't convert the whole model to BF16. We wrap the forward pass in `autocast`, which picks BF16 for the operations that benefit from it. The backward pass then follows the same choices automatically:

```python
# trainer.py
with torch.autocast(device_type=self.device, dtype=torch.bfloat16):
    _, per_token_loss = self.model(x, y, loss_reduction="none")
```

Inside this block, PyTorch decides per operation which precision to use. Matrix multiplies run in BF16, which is where the speed comes from, while a handful of precision-sensitive operations stay in FP32. The weights themselves stay in FP32. This is why it's called *mixed* precision. §3.5 walks through exactly what runs in which format, in the forward pass, the backward pass and the optimizer step.

### 3.3 Why BF16 and not FP16?

Both are 2 bytes, but they split the bits differently:

```
FP16: [sign 1][exponent 5][mantissa 10]  <- more precision, small range
BF16: [sign 1][exponent 8][mantissa 7]   <- less precision, same range as FP32
FP32: [sign 1][exponent 8][mantissa 23]
```

FP16 only has 5 exponent bits, so the largest number it can store is about 65,504. Large activations overflow, and small gradients round down to zero. FP16 training works around this with **loss scaling**: multiply the loss by a big number before the backward pass so the gradients don't underflow, then divide them back down afterward.

BF16 has FP32's 8 exponent bits, so it covers the same range. Nothing overflows, nothing underflows, and no loss scaling is needed. It gives up precision instead, and as we saw with TF32, precision is the thing training can afford to lose.

### 3.4 Storing the embeddings in BF16

We go one step further and store the embedding tables themselves in BF16:

```python
# gpt2_model.py, called once after the model is on the GPU
def cast_embeddings_to_bfloat16(self):
    """Cast token and value embeddings to bfloat16 (nanochat-style)."""
    if self.transformer.wte.weight.device.type == "cuda":
        self.transformer.wte.to(dtype=torch.bfloat16)
        for ve in self.value_embeds.values():
            ve.to(dtype=torch.bfloat16)

# model_setup.py
raw_model = GPT(config, master_process=master_process)
raw_model.to(device)
raw_model.cast_embeddings_to_bfloat16()
```

An embedding table is a lookup table: a token ID comes in, and you return that row. But it's a large table (vocabulary size × model width), so storing it in 2 bytes instead of 4 halves its memory, and the optimizer handles the lower precision fine.

The same goes for the **RoPE** (rotary position embedding) tables. They're fixed sines and cosines that are never trained, so we build them in BF16 from the start:

```python
# gpt2_model.py, at model init
cos, sin = precompute_rotary_embeddings(
    self.rotary_seq_len,
    head_dim,
    base=10000,
    device="cpu",
    dtype=torch.bfloat16,
)
```

Together, BF16 autocast and BF16 embeddings put the matmuls on twice the peak throughput of TF32 and halve the size of activations and embedding tables, and the memory saved lets you use a larger batch.

### 3.5 What runs in which precision

| Step | BF16 | FP32 |
|---|---|---|
| **Stored weights** | Embedding tables (§3.4) | All other weights |
| **Forward** (in `autocast`) | Matmuls (linear layers, attention), RMSNorm, and ops that just follow their BF16 inputs | Logits, soft-cap and loss (the model calls `logits.float()`), plus autocast's FP32 list: softmax, `log`, `exp`, sums |
| **Backward** | Each op's backward uses the same format as its forward, so the backward matmuls are BF16 too | Gradients of the FP32 weights are converted back to FP32 |
| **Optimizer** | Embedding updates | Everything else |

The tensor cores multiply in BF16 but add up the products in FP32, so long dot products don't lose precision.

**Where does TF32 fit?** TF32 only affects matmuls that are still FP32. Inside autocast, the model's matmuls are BF16, so TF32 only speeds up FP32 matmuls outside it. The two don't stack.

---

## 4. `torch.compile`: fewer trips to memory

### 4.1 The problem

Here's how PyTorch normally runs your model. Every operation is its own GPU **kernel**, a small program launched on the GPU. An add is a kernel. A multiply is a kernel. A GELU is a kernel. Each one:

1. reads its inputs from GPU memory,
2. does a little math,
3. writes its output back to GPU memory,

and then the next kernel reads that output right back in. For a chain of small elementwise operations, almost all the time goes into those memory round trips, not the math.

### 4.2 The fix

```python
# model_setup.py
raw_model = GPT(config, master_process=master_process)
raw_model.to(device)
raw_model.cast_embeddings_to_bfloat16()

model = torch.compile(raw_model, dynamic=False)

# keep raw_model for checkpointing, so there's nothing to unwrap
return config, raw_model, model
```

`torch.compile` looks at the whole forward pass and does three things:

1. **Fuses operations.** It merges chains of operations into a single kernel. The data is read once, all the math happens, and the result is written once.
2. **Improves memory access.** It reorders operations so data is reused while it's still in cache, and removes copies that aren't needed.
3. **Removes unnecessary work.** Unused computations are dropped. Values that never change, like mask shapes based on a fixed `block_size`, are computed once at compile time.

`dynamic=False` tells the compiler to specialize the code to the exact input shapes it sees. That fits training, where every batch is `(batch_size, block_size)`. If a shape ever did change, it would recompile for the new shape instead of switching to slower, shape-generic code.

> **Note:** Calling `torch.compile()` returns instantly. It only wraps the model. The actual compilation happens **on the first forward pass**, when PyTorch sees real shapes and dtypes for the first time. So the first step is slow, and every step after it runs the compiled code.

How much this saves depends on how much of your step is small elementwise operations that can be merged.

---

## 5. Flash Attention: not moving the big matrix

### 5.1 The problem

Attention computes a score between every pair of tokens. For a sequence of length $T$, that's a $T \times T$ matrix per head, and standard attention writes it to **HBM**, the GPU's main memory.

How big is it? For one sequence, in one layer with 12 heads, at 4 bytes per number:

```
T = 1,024:  12 × 1,024 × 1,024 =  12.6M numbers =  50 MB
T = 8,192:  12 × 8,192 × 8,192 = 805M numbers   = 3.2 GB
```

That's for one sequence in one layer; multiply by the batch size for the real total. And it grows with $T^2$: 8x longer sequences means 64x more memory.

The memory isn't the only cost. The GPU can do the attention math quickly. What's slow is **writing that matrix to HBM and reading it back**. Attention is limited by memory bandwidth, not by compute.

### 5.2 The fix

GPUs also have **SRAM**, a small amount of very fast memory on the chip itself. **Flash Attention** splits attention into tiles small enough to fit in SRAM, does all the work for each tile there, and only writes the final output (plus a small per-row statistic it needs for the backward pass) to HBM. The full $T \times T$ matrix is never stored.

*Is it an approximation?* No. It's exact attention. The results match standard attention up to floating-point rounding. Only the order of the computation changes.

What changes is the cost. Extra memory now grows with $T$ instead of $T^2$, and attention runs much faster because it skips most of the memory traffic.

### 5.3 Picking a version

Our attention module tries the fastest version first and falls back if it's not available. The check runs once, when the module is imported:

```python
# attention.py
def _load_flash_attention_3():
    """Try to load Flash Attention 3 (requires Hopper GPU, sm90)."""
    if not torch.cuda.is_available():
        return None
    try:
        major, _ = torch.cuda.get_device_capability()
        if major != 9:  # FA3 is Hopper (sm90) only
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

At runtime, it uses the best version that supports the current inputs:

```python
# attention.py
def attention_forward(q, k, v, is_causal=True, enable_gqa=False, window_size=()):
    supported_dtypes_fa3 = (torch.float16, torch.bfloat16, torch.float8_e4m3fn)
    supported_dtypes_fa2 = (torch.float16, torch.bfloat16)

    use_fa3 = HAS_FA3 and q.is_cuda and q.dtype in supported_dtypes_fa3
    use_fa2 = HAS_FA2 and q.is_cuda and q.dtype in supported_dtypes_fa2

    if use_fa3 or use_fa2:
        # Flash Attention expects (B, T, n_head, head_dim);
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
        # fallback: PyTorch SDPA (simplified here; the real code also repeats
        # K/V heads for GQA and builds a sliding-window mask when needed)
        return F.scaled_dot_product_attention(q, k, v, dropout_p=0.0, is_causal=is_causal)
```

The three options:

- **Flash Attention 3** runs on Hopper GPUs (H100, H200). It's the fastest: its paper reports 1.5 to 2x over Flash Attention 2, using instructions only Hopper has.
- **Flash Attention 2** runs on Ampere GPUs (A100, A10 and similar). Still very fast, and what most people will use.
- **PyTorch SDPA** (`scaled_dot_product_attention`) is the fallback. It uses a fused kernel when it can, but it's slower than the dedicated Flash Attention kernels.

> **Note:** Flash Attention 2 only accepts FP16 or BF16 inputs (FA3 also accepts FP8). That's why the BF16 autocast from §3 matters here: without it, you never reach the fast paths. On a CPU or an Apple Mac (MPS), Flash Attention isn't available and the code falls back to SDPA. Training still works, just slower.

Flash Attention also supports **sliding-window attention**, where each token looks only at nearby tokens. Our model uses it: three of every four layers pass `window_size=(1024, 0)`, so each token attends to itself and the previous 1,024 tokens.

---

## 6. DataLoader workers: the GPU shouldn't wait for the CPU

### 6.1 The problem

Here's the loop everyone writes first:

```python
for batch in dataset:
    train_step(batch)
```

Trace what happens in one iteration. The CPU reads files, tokenizes the text, and packs it into a batch. **The GPU waits.** Then the GPU runs the step, and the CPU waits for it to finish (our trainer synchronizes every step) before building the next batch. The GPU waits again.

Batch preparation and GPU compute take turns, and the GPU, the most expensive part of the setup, spends part of every step idle.

### 6.2 The fix

Build batches in separate CPU processes, in the background, while the GPU works. While the GPU is on step $N$, the workers are already preparing the batches after it.

```python
# fineweb_edu_parquet_bos_dataloader.py
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

- **`num_workers=4`** starts 4 worker processes. Each one reads Parquet files, tokenizes, packs sequences, and puts finished batches in a shared queue.
- **`prefetch_factor=4`** has each worker keep 4 batches ready ahead of time. With 4 workers, that's $4 \times 4 = 16$ batches ready at any moment.
- **`persistent_workers=True`** keeps the workers alive between epochs. Without it, PyTorch stops every worker at the end of an epoch and starts new ones, which costs startup time on every epoch.

Now the CPU and GPU work in parallel, and the GPU always has a batch waiting.

---

## 7. Pinned memory: the GPU shouldn't wait for the copy

### 7.1 The problem

Every `.to("cuda")` hides a cost. The GPU copies data from CPU memory using a **DMA (direct memory access)** engine. But normal CPU memory is **pageable**: the operating system can move it at any time, so the DMA engine can't read it directly. CUDA first stages the data through a temporary pinned buffer, which adds an extra copy and slows the transfer.

### 7.2 The fix

```python
dataloader = DataLoader(
    dataset,
    num_workers=4,
    prefetch_factor=4,
    pin_memory=True,          # hand batches over in pinned memory
    persistent_workers=True,
)
```

With **`pin_memory=True`**, a background thread copies each finished batch into **pinned** (page-locked) memory. The DMA engine reads it directly, so `.to("cuda")` skips the staging step and runs at full speed.

You can also pass `non_blocking=True` to `.to()`, so the CPU doesn't wait for the copy and can keep queuing GPU work. VibeNanoChat doesn't use it; it uses pinning with a regular `.to(device)`.

Two limits. This only helps on CUDA, not on a CPU or Apple MPS, so our dataloader only enables pinning on CUDA with workers. And pinned memory can't be swapped to disk, so it uses real RAM. Don't pin more than you need.

---

## 8. Putting it together

These changes depend on each other: Flash Attention needs the BF16 autocast to reach its fast paths. Here's the full setup in one place:

```python
# §2. TF32, at the very start
torch.set_float32_matmul_precision("high")

# §3. BF16 embeddings, after creating the model and moving it to the GPU
raw_model = GPT(config)
raw_model.to(device)
raw_model.cast_embeddings_to_bfloat16()

# §4. torch.compile with fixed shapes
model = torch.compile(raw_model, dynamic=False)

# §5. Flash Attention is picked when attention.py is imported,
#     and runs inside the model's forward pass

# §6 + §7. DataLoader with workers, prefetching and pinned memory
dataloader = DataLoader(
    dataset,
    num_workers=4,
    prefetch_factor=4,
    pin_memory=True,
    persistent_workers=True,
)

for x, y in dataloader:
    x, y = x.to(device), y.to(device)  # fast, because the batch is pinned (§7)
    # §3. BF16 autocast (backward follows the forward's precisions)
    with torch.autocast(device_type=device, dtype=torch.bfloat16):
        _, loss = model(x, y)  # Flash Attention runs in here
    loss.backward()
    optimizer.step()
```

Go back to the list in §1. Each line in this setup removes one of the reasons from §1: slow math units, too many bytes, too many memory trips, a huge attention matrix, the CPU, and the copy.

All of the code is in [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat):

- `src/gpt_2/trainer.py`: TF32 and BF16 autocast
- `src/gpt_2/attention.py`: Flash Attention loading and dispatch
- `src/gpt_2/training_utilities/model_setup.py`: BF16 embeddings and `torch.compile`
- `src/dataloaders/fineweb_edu_parquet_bos_dataloader.py`: DataLoader workers and pinned memory
