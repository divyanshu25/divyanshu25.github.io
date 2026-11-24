# Going Fast: Every Optimization That Made LLM Training Fly

*Six changes that made [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat), a GPT-2 scale training framework, use far more of the GPU. Assumes you know what a PyTorch training loop looks like.*

---

## The metric: MFU

**MFU (Model FLOPs Utilization)** is the fraction of the GPU's peak compute that your training run actually uses. If a GPU can do 1,000 TFLOPS (trillion floating-point operations per second) and your model's forward and backward passes do 400 TFLOPS worth of useful work, your MFU is 40%.

A low MFU means you are paying for a GPU that is mostly waiting: on memory, on the CPU, on data, or on slow kernels. The six changes below each remove one of those waits. They are ordered roughly by effort, easiest first.

| # | Change | What it fixes | Effort |
|---|---|---|---|
| 1 | TF32 | FP32 matmuls skip the tensor cores | 1 line |
| 2 | BF16 mixed precision | Every tensor is 4 bytes when 2 is enough | A few lines |
| 3 | `torch.compile` | Too many small kernel launches | 1 line |
| 4 | Flash Attention | Attention reads and writes a huge matrix to memory | A module |
| 5 | DataLoader workers | GPU waits for the CPU to prepare the next batch | A few args |
| 6 | Pinned memory + non-blocking copies | GPU waits for the CPU-to-GPU copy | 2 args |

---

## 1. TF32: use the tensor cores for FP32 matmuls

```python
# trainer.py, before the training loop starts
torch.set_float32_matmul_precision("high")
```

That is the whole change.

**What it does.** By default, PyTorch runs FP32 matrix multiplications on the GPU's regular CUDA cores with the full 23-bit mantissa (the bits that store a number's precision). **TF32** keeps FP32's 8-bit exponent but cuts the mantissa to 10 bits. That smaller format is what lets the matmul run on the **tensor cores**, the GPU units built for matrix math.

```
FP32 ("highest"): [sign 1][exponent 8][mantissa 23]  -> CUDA cores
TF32 ("high"):    [sign 1][exponent 8][mantissa 10]  -> tensor cores
```

On an A100, dense FP32 on CUDA cores peaks at 19.5 TFLOPS, and dense TF32 on tensor cores peaks at 156 TFLOPS. That is 156 / 19.5 = **8x more peak matmul throughput**.

**Why it is safe.** The range of numbers you can represent is unchanged, because the exponent is still 8 bits. Only the least significant precision bits are dropped, and training is not sensitive to them.

**What you actually get.** Wall-clock speedups are typically 10 to 40%, not 8x. Only the matmuls get faster. Softmax, normalization, memory reads and everything else run at the same speed as before.

The three settings:
- `"highest"`: full FP32. The slow default.
- `"high"`: TF32 for matmuls. Use this.
- `"medium"`: allows BF16 internally for FP32 matmuls. This only affects matmuls, unlike the autocast in section 2, which covers the whole forward pass.

**Rule:** put this line in every PyTorch training script.

---

## 2. BF16 mixed precision

TF32 speeds up matmuls but still stores every tensor in 4 bytes. **BF16 (bfloat16)** stores numbers in 2 bytes. Half the bytes means half the memory traffic and roughly twice the matmul throughput on tensor cores.

You do not train fully in BF16. You run the **forward pass** in it with `autocast`:

```python
# trainer.py, wrap the forward pass
with torch.autocast(device_type=self.device, dtype=torch.bfloat16):
    _, per_token_loss = self.model(x, y, loss_reduction="none")
```

Inside this block, PyTorch runs eligible operations (matmuls and attention) in BF16 and keeps numerically sensitive ones (like softmax, normalization and loss reductions) in FP32. The model weights and their gradients stay in FP32, so the optimizer update keeps full precision.

### Why BF16 and not FP16

```
FP16: [sign 1][exponent 5][mantissa 10]  <- small range, needs loss scaling
BF16: [sign 1][exponent 8][mantissa 7]   <- same range as FP32, less precision
FP32: [sign 1][exponent 8][mantissa 23]  <- full precision, 4 bytes
```

FP16's largest value is about 65,504. Large activations overflow and small gradients underflow to zero, so FP16 training needs **loss scaling**: multiply the loss by a large factor before the backward pass and divide the gradients back afterward. BF16 has the same 8-bit exponent as FP32, so it covers the same range and needs no loss scaling. With mixed precision, BF16 training curves track FP32 closely.

### Storing embeddings in BF16

We go one step further and store the embedding tables in BF16 permanently:

```python
# gpt2_model.py, called once after moving the model to the GPU
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

An embedding table is a lookup table: each token ID selects one row. The table is large (vocabulary size × model width), so storing it in 2 bytes instead of 4 halves its memory, and the optimizer tolerates the lower precision.

The RoPE (rotary position embedding) tables are also precomputed in BF16, since they are fixed and never trained:

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

**Result:** roughly 2x forward-pass throughput, plus memory savings that let you use a larger batch.

---

## 3. `torch.compile`

```python
# model_setup.py
raw_model = GPT(config, master_process=master_process)
raw_model.to(device)
raw_model.cast_embeddings_to_bfloat16()

model = torch.compile(raw_model, dynamic=False)

# keep raw_model for checkpointing, so there is nothing to unwrap
return config, raw_model, model
```

`dynamic=False` tells the compiler that input shapes never change. In training, every batch is `(batch_size, block_size)`, always. With fixed shapes, the compiler can generate kernels specialized to those exact sizes instead of general ones that check shapes at runtime.

### What compile does

1. **Kernel fusion.** Without compile, each operation (add, multiply, activation) launches its own GPU kernel and writes its result to memory, and the next kernel reads it back. Compile fuses chains of operations into one kernel, so there are fewer launches and fewer round trips to memory.
2. **Memory layout.** It reorders operations to improve cache use and removes unnecessary copies.
3. **Dead code removal and constant folding.** Unused computation is dropped. Values that never change, like mask shapes derived from a fixed `block_size`, are computed once at compile time. With `dynamic=False`, most shape arithmetic falls into this group.

The `torch.compile()` call itself returns instantly; it only wraps the model. The real compilation (tracing the graph and generating Triton kernels) happens **just-in-time on the first forward pass**, when it first sees real shapes and dtypes. The first step is slow. After that, you run the optimized kernels.

**Typical result:** 10 to 30% faster training, depending on the architecture.

---

## 4. Flash Attention

Standard attention builds the full T × T attention matrix (T = sequence length) for every head and stores it in **HBM**, the GPU's main memory. That costs O(T²) memory.

The arithmetic for one layer, in FP32 (4 bytes per number):
- T = 1,024 tokens, 12 heads: 12 × 1,024 × 1,024 = 12.6M numbers = **50 MB**.
- T = 8,192 tokens, 12 heads: 12 × 8,192 × 8,192 = 805M numbers = **3.2 GB**.

That is for the attention weights alone, in a single layer.

**Flash Attention** computes attention in tiles that fit in **SRAM**, the small, fast on-chip memory, and never writes the full matrix to HBM. It is exact attention, not an approximation; results match standard attention up to floating-point rounding. Extra memory drops from O(T²) to O(T), and it runs much faster because attention is limited by memory bandwidth, not by compute.

Our attention module tries Flash Attention 3 first, then Flash Attention 2, then PyTorch's built-in SDPA (scaled dot product attention):

```python
# attention.py, detected once at import time
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

At runtime:

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
        # fallback: PyTorch's fused attention
        return F.scaled_dot_product_attention(q, k, v, dropout_p=0.0, is_causal=is_causal)
```

Which path you get:
- **Flash Attention 3** (H100/H200, Hopper GPUs): fastest. Uses Hopper-specific tensor core instructions. Roughly 2 to 3x faster than standard attention.
- **Flash Attention 2** (A100, A10 and similar): still very fast. Most people land here.
- **PyTorch SDPA**: a fused kernel, better than naive attention but slower than the dedicated Flash Attention kernels.

> **Note:** Flash Attention 2 and 3 only accept FP16 or BF16 inputs, so the BF16 autocast from section 2 is required for those paths. Without it (on CPU or Apple MPS, for example), the code falls back to SDPA in FP32. Training still works; it is just slower.

Flash Attention also supports **GQA (grouped query attention)** and **sliding-window attention** directly, and our model uses both. Passing `window_size=(512, 0)` means each token attends to the previous 512 tokens and none after it, which gives local attention at no extra cost.

---

## 5. DataLoader workers: keep the GPU from waiting on data

The GPU is the most expensive part of the setup, so it should never wait for data. The naive loop:

```python
for batch in dataset:
    train_step(batch)
```

runs everything in sequence. The GPU finishes the forward and backward pass, then sits idle while the CPU reads, tokenizes and packs the next batch.

The fix is to prepare batches in parallel CPU processes while the GPU works. While the GPU runs step N, the workers are already building the batches after it.

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

- **`num_workers=4`**: starts 4 worker processes. Each one reads Parquet files, tokenizes, packs sequences, and puts finished batches on a shared queue.
- **`prefetch_factor=4`**: each worker keeps 4 batches ready ahead of time. 4 workers × 4 batches = **16 batches** waiting at any moment.
- **`persistent_workers=True`**: keeps workers alive between epochs. Without it, PyTorch kills and restarts every worker at each epoch boundary, which can take several seconds on large datasets. With it, workers keep their open files and state.

---

## 6. Pinned memory and non-blocking copies

Every `.to("cuda")` call has a hidden cost. These two settings fix it together: `pin_memory=True` on the DataLoader and `non_blocking=True` on the copy.

**What happens by default.** The GPU copies data from CPU memory using a **DMA (direct memory access)** engine. Normal CPU memory is *pageable*: the operating system can move it or swap it to disk at any time, so the DMA engine cannot read it safely. CUDA therefore:
1. copies the tensor into a temporary page-locked buffer,
2. copies that buffer to the GPU,
3. blocks your Python code until both copies finish.

That is two copies, one after the other, while your training loop waits.

**The fix:**

```python
# DataLoader setup
dataloader = DataLoader(
    dataset,
    num_workers=4,
    prefetch_factor=4,
    pin_memory=True,          # allocate batches in page-locked memory
    persistent_workers=True,
)

# training loop
x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
```

- **`pin_memory=True`**: batches are allocated in **pinned (page-locked) memory**, which the DMA engine can read directly. One copy instead of two.
- **`non_blocking=True`**: starts the copy and returns immediately instead of waiting for it to finish. CUDA orders the copy before any GPU work that uses the data, so the result is still correct.

Together, the copy of batch N+1 runs while the GPU is computing batch N, so the transfer time is hidden.

Limits:
- It only helps on CUDA, not on CPU or Apple MPS. Our dataloader turns `pin_memory` on only for CUDA with workers enabled.
- Pinned memory cannot be swapped out, so it uses real RAM. Do not pin more than you need.

---

## 7. Putting it together

The six changes are not independent. Flash Attention needs the BF16 autocast, and pinned memory only pays off with `non_blocking=True`. Here is the condensed training setup:

```python
# 1. TF32, at the very start
torch.set_float32_matmul_precision("high")

# 2. BF16 embeddings, after init and .to(device)
raw_model = GPT(config)
raw_model.to(device)
raw_model.cast_embeddings_to_bfloat16()

# 3. torch.compile with fixed shapes
model = torch.compile(raw_model, dynamic=False)

# 4. Flash Attention is picked at import time inside attention.py
#    and used inside the model's forward pass

# 5 + 6. DataLoader with workers, prefetching and pinned memory
dataloader = DataLoader(
    dataset,
    num_workers=4,
    prefetch_factor=4,
    pin_memory=True,
    persistent_workers=True,
)

for x, y in dataloader:
    x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
    # 2. BF16 autocast for the forward pass
    with torch.autocast(device_type=device, dtype=torch.bfloat16):
        _, loss = model(x, y)  # Flash Attention runs in here
    loss.backward()
    optimizer.step()
```

---

## Code

Everything here is in [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat):

- `src/gpt_2/trainer.py`: TF32 and BF16 autocast
- `src/gpt_2/attention.py`: Flash Attention loading and dispatch
- `src/gpt_2/training_utilities/model_setup.py`: BF16 embeddings and `torch.compile`
- `src/dataloaders/fineweb_edu_parquet_bos_dataloader.py`: DataLoader workers and pinned memory
