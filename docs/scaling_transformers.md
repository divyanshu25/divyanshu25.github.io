# A Lazy Engineer's Guide to Scaling Transformers

*How to set a transformer's architecture, batch size, learning rate, weight decay and training length from one integer: `depth`. Code is from [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat).*

---

## 1. The problem: too many knobs that depend on each other

To try a new model size, you normally pick three architecture numbers:

- `n_layer`: how many transformer blocks are stacked.
- `n_embed`: the hidden dimension, the width of the vector each token is represented by.
- `n_head`: how many attention heads each layer has.

Then you pick a batch size, learning rate, weight decay and number of training tokens to go with them.

For a scaling sweep over six model sizes, that is six hand-written configs. In practice one of them has the wrong learning rate, one runs out of memory on the first batch, and you find out hours into the run.

This post replaces all of that with **one integer, `depth`**, the number of transformer layers. Everything else is computed from it.

---

## 2. Most architecture configs are bad

The three architecture numbers are not independent:

1. **`n_embed` must be divisible by `n_head`.** Each head gets `n_embed / n_head` dimensions, which must be a whole number.
2. **The head dimension should be 64 or 128.** Flash Attention's fastest kernels are built for these sizes.
3. **The aspect ratio `n_embed / n_layer` should be roughly 64 to 128.** GPT-2 small has 768 / 12 = 64. GPT-3 175B has 12,288 / 96 = 128, and LLaMA 7B has 4,096 / 32 = 128. Kaplan et al. (2020) found that loss changes very little across a wide range of aspect ratios, and published models cluster in this band.

So most points in the 3D space of `(n_layer, n_embed, n_head)` are invalid (heads don't divide the width), slow (wrong head size), or oddly shaped (aspect ratio far outside the usual band). **The good configs lie along a thin 1D curve through that space.**

The idea of this post: stop searching the 3D space and move only along that curve.

---

## 3. The architecture from `depth`

Fix the aspect ratio and the head dimension. Then:

```
n_layer = depth
n_embed = depth × aspect_ratio      (rounded up to a multiple of head_dim)
n_head  = n_embed ÷ head_dim
```

With `aspect_ratio = 64` and `head_dim = 64`, no rounding is ever needed:

| depth | n_layer | n_embed | n_head |
|---|---|---|---|
| 12 | 12 | 12 × 64 = 768 | 768 / 64 = 12 |
| 24 | 24 | 24 × 64 = 1,536 | 1,536 / 64 = 24 |

`depth = 12` is the GPT-2 small shape.

With this setup, you cannot create a config where the heads don't divide the width, or where the aspect ratio is off. Those configs cannot be expressed.

### The code

This is in `GPTConfig.__post_init__`, which Python runs automatically after the dataclass is created:

```python
# config.py
@dataclass
class GPTConfig:
    depth: int = 12          # the one knob; 12 is the GPT-2 small shape
    aspect_ratio: int = 64   # n_embed / n_layer, fixed across sizes
    head_dim: int = 64       # per-head dimension, a Flash Attention fast path

    def __post_init__(self):
        if self.depth > 0:
            self.n_layer = self.depth
            base_dim = self.depth * self.aspect_ratio

            # ceiling division: round up to the nearest multiple of head_dim
            # so that n_embed % head_dim == 0 always holds
            self.n_embed = ((base_dim + self.head_dim - 1) // self.head_dim) * self.head_dim

            self.n_head = self.n_embed // self.head_dim
```

**Why the rounding.** Suppose you try `aspect_ratio = 50` and `depth = 13`. Then `base_dim = 650`, and 650 / 64 = 10.16 heads, which is not a whole number. The ceiling division rounds `n_embed` up to 704, which gives 704 / 64 = 11 heads.

The code records how much it added:

```python
nudge = self.n_embed - base_dim  # dimensions added to make heads divide evenly
```

With `aspect_ratio = 64` and `head_dim = 64`, `nudge` is always 0. With other aspect ratios, it tells you how far the actual model is from what you asked for.

---

## 4. The training hyperparameters from `depth`

The architecture is only the first step. `depth` sets the parameter count, and the parameter count sets everything below. Each step uses the output of the one before:

```
depth -> parameters -> training tokens -> batch size -> learning rate -> weight decay
```

All of these are defined **relative to a reference model, `depth = 12`**, which is small enough to tune by hand. You tune its batch size, learning rate and weight decay once. Every other size gets those values multiplied by a scale factor.

### 4.1 Training tokens

The Chinchilla paper (Hoffmann et al., 2022) showed that for a fixed compute budget, there is a best ratio of **training tokens to model parameters**. Too few tokens and the model is undertrained. Too many and you spend compute for little gain.

We store this as one config value, `target_param_data_ratio`, the number of training tokens per parameter:

```
training_tokens = target_param_data_ratio × parameters
```

A bigger model has more parameters, so it automatically trains on more tokens. Chinchilla measured about **20** tokens per parameter for their setup. For our architecture we use **10**. This ratio depends on the architecture, so measure it for yours instead of copying it.

### 4.2 Batch size

More training tokens means a larger best batch size. The **Power Lines** paper (Bergsma et al., 2025) found that the best batch size grows as a power of the number of training tokens D:

```
B_opt ∝ D^0.383
```

So we scale from the reference model:

```python
token_ratio = target_tokens / reference_tokens
predicted_batch_size = reference_batch_size * (token_ratio ** 0.383)
```

The growth is sublinear. 10× more tokens gives 10^0.383 = **2.4× the batch size**, not 10×. We then round to a power of 2.

Like the Chinchilla ratio, the 0.383 exponent was measured on a specific setup. It is a good starting point, not a law.

### 4.3 Learning rate

A larger batch averages the gradient over more samples, so each gradient estimate is less noisy and you can take larger steps.

- For **SGD**, the usual rule is linear: double the batch, double the learning rate.
- For **Adam and AdamW**, the usual rule is **square root**: double the batch, multiply the learning rate by √2 = 1.41. Adam already divides each update by a running estimate of the gradient's size, which partly cancels the effect of noise, so a bigger batch helps it less.

```python
batch_ratio = total_batch_size / reference_batch_size
lr_scale_factor = batch_ratio ** 0.5
```

The reference model's learning rate is tuned by hand. Every other size multiplies it by `lr_scale_factor`.

### 4.4 Weight decay

Weight decay uses the **τ_epoch** idea from the Power Lines paper.

With AdamW, the weights behave like an exponential moving average of recent updates. The length of that average, measured in optimizer steps, is 1 / (η·λ), where η is the learning rate and λ is the weight decay. Training lasts D / B steps, where D is training tokens and B is the batch size in tokens. Dividing the first by the second gives the averaging window as a **fraction of the whole training run**:

```
τ_epoch = (1 / (η·λ)) / (D / B) = B / (η·λ·D)
```

The paper found the best τ_epoch stays about the same across model sizes. So we hold τ_epoch fixed and solve for λ:

```
λ = B / (η · τ_epoch · D)
```

Since η already scales as √B (section 4.3), B / η scales as B / √B = √B. That gives:

```
λ / λ_ref = √(B / B_ref) × (D_ref / D)
```

```python
batch_ratio = total_batch_size / reference_batch_size
token_ratio = reference_tokens / target_tokens   # note: D_ref / D, inverted
wd_scale_factor = (batch_ratio ** 0.5) * token_ratio
```

In words: **a bigger batch needs more weight decay, and a longer run needs less.** The full code is in `batch_scaling.py`.

---

## 5. A worked example: depth 12 to depth 24

Parameters here count the transformer weight matrices plus the output head, which is what the scaling uses. Each transformer layer has about 12 × n_embed² weights: 4 × n_embed² for attention and 8 × n_embed² for the MLP.

**depth = 12 (the reference)**
- n_layer = 12, n_embed = 768, n_head = 12, about **125M parameters**
- Training tokens: 10 × 125M = **1.25B**
- Batch size: **524K tokens** (2^19, tuned by hand)
- Learning rate and weight decay scale: **1.0×** by definition

**depth = 24**
- n_layer = 24, n_embed = 1,536, n_head = 24, about **760M parameters**
- Training tokens: 10 × 760M = **7.6B**, so the token ratio is 7.6 / 1.25 = 6.1
- Batch size: 524K × 6.1^0.383 = 524K × 2.0 ≈ **1M tokens**
- Learning rate scale: √(1M / 524K) = √2 ≈ **1.41×**
- Weight decay scale: √2 × (1.25B / 7.6B) = 1.41 × 0.16 ≈ **0.23×**

**Why the parameter count goes up 6×, not 2×.** Doubling `depth` doubles the number of layers *and* the width. Each layer has about 12 × n_embed² weights, so the transformer part grows 2 (layers) × 2² (width squared) = **8×**. The output head only grows with width, so it grows 2×. Together that comes to about 6×.

**Why weight decay drops so much.** The larger model trains on 6.1× more tokens. A longer run already averages over more updates, so it needs less weight decay to keep the same τ_epoch. The bigger batch pushes weight decay up by √2, but the longer run pulls it down by 6.1×, and the second effect wins.

Every number above follows from changing one input: 12 to 24.

---

## 6. A scaling sweep

```bash
# six models, one variable
DEPTH=6  python train.py   # ~30M params
DEPTH=8  python train.py   # ~51M params
DEPTH=12 python train.py   # ~125M params  <- tune hyperparameters here, once
DEPTH=16 python train.py   # ~253M params
DEPTH=20 python train.py   # ~458M params
DEPTH=26 python train.py   # ~948M params
```

For each run, the architecture, training length, batch size, learning rate and weight decay are all computed. You choose one number.

The alternative is six hand-written configs, each checked by hand, with the usual mistakes: a learning rate not updated for the bigger model, an out-of-memory error, a batch size tweaked and rerun.

---

## 7. The general idea

Parameterized by `(n_layer, n_embed, n_head)` independently, the config space is three-dimensional and mostly bad. The `depth` parameterization keeps you on the 1D curve of good configs. Bad configs are not checked for and rejected; they simply cannot be written down.

This applies beyond transformers: **design the interface so that invalid states cannot be represented.** Instead of checking `n_embed % n_head == 0`, compute `n_embed` and `n_head` from one input so the constraint always holds.

The practical result: a scaling sweep that used to mean a week of config fixes is now one number per run. That time goes to the questions that matter, like what the loss curves look like and where the scaling law stops holding.
