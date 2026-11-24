# A Lazy Engineer's Guide to Scaling Transformers

*How to derive a transformer's architecture, training length, batch size, learning rate and weight decay from one integer: `depth`. Assumes you know what a transformer layer is and have trained a model before. Code is from [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat).*

---

## 1. The problem: a config is seven numbers

To train a model of a new size, you have to choose:

```
architecture:  n_layer, n_embed, n_head
training:      training tokens, batch size, learning rate, weight decay
```

Seven numbers, and they aren't independent. Change the width and the head count may stop dividing evenly. Train longer and the best batch size changes. Change the batch size and the learning rate should change too.

Now run a scaling sweep: six model sizes, so six configs, each with seven numbers to get right. In practice one config keeps the learning rate that suited the small model, another runs out of memory on the first batch, and you find out hours into the run.

This post replaces all seven numbers with **one integer, `depth`**, the number of transformer layers. Everything else is derived from it:

```
depth -> architecture -> parameters -> training tokens -> batch size -> learning rate
                                                                     -> weight decay
```

Each step uses the output of the step before. Let's build it one link at a time.

---

## 2. Why most architectures are bad

Start with the architecture. A transformer's shape is three numbers:

- **`n_layer`**: how many transformer blocks are stacked.
- **`n_embed`**: the width, the size of the vector that represents each token.
- **`n_head`**: how many attention heads each layer has.

These look like three free choices. They're not, because of three constraints:

1. **`n_embed` must be divisible by `n_head`.** Each head gets `n_embed / n_head` dimensions, and that has to be a whole number. Otherwise the model doesn't run.
2. **The head dimension should be 64 or 128.** Flash Attention's fastest kernels are built for those sizes.
3. **The aspect ratio `n_embed / n_layer` should be roughly 64 to 128.**

The third one needs some explanation. Look at well-known models:

```
GPT-2 small:   768 / 12    =  64
GPT-3 175B:  12,288 / 96   = 128
LLaMA 7B:     4,096 / 32   = 128
```

This isn't a coincidence. Kaplan et al. (2020) found that loss changes very little across a wide range of aspect ratios, and published models settled in this band. Go far outside it, and you're shaping models in a way nobody has really tested.

Now think of every possible `(n_layer, n_embed, n_head)` as a point in a 3D space. Most points are bad: the heads don't divide the width (broken), or the head size is wrong (slow), or the aspect ratio is far off (untested). **The good configs lie along a thin 1D curve through that space.**

So instead of searching the 3D space, we'll only move along the curve.

---

## 3. The architecture from `depth`

### 3.1 Three lines of math

Fix two of the ratios, the aspect ratio and the head dimension. Then the third number follows:

```
n_layer = depth
n_embed = depth × aspect_ratio      (rounded up to a multiple of head_dim)
n_head  = n_embed / head_dim
```

With `aspect_ratio = 64` and `head_dim = 64`:

```
depth = 12:  n_layer = 12,  n_embed = 12 × 64 =   768,  n_head =   768 / 64 = 12
depth = 24:  n_layer = 24,  n_embed = 24 × 64 = 1,536,  n_head = 1,536 / 64 = 24
```

`depth = 12` is exactly the GPT-2 small shape.

Now notice what you **can't** do anymore. You can't make a config where the heads don't divide the width, and you can't make one with an odd aspect ratio. We don't check for those mistakes. They simply can't be written down.

### 3.2 The code

This goes in `__post_init__` on the config dataclass, which Python runs right after the object is created:

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

*Why the rounding?* With 64 and 64 it never does anything. It matters if you try other aspect ratios. Say `aspect_ratio = 50` and `depth = 13`. Then `base_dim = 650`, and $650 / 64 \approx 10.16$ heads, which isn't a whole number. The ceiling division rounds `n_embed` up to 704, and $704 / 64 = 11$ heads.

The code also records how much it added:

```python
nudge = self.n_embed - base_dim  # dimensions added so the heads divide evenly
```

With 64 and 64, `nudge` is always 0. With other values, it tells you how far the real model is from what you asked for.

---

## 4. Training tokens from parameters

That handles the architecture. The rest of the cascade starts from the parameter count, which `depth` now fixes.

Everything from here on is measured against a **reference model: `depth = 12`**, about 125M parameters. It's small enough to tune by hand. We tune its batch size, learning rate and weight decay once. Every other size gets those values times a scale factor, and the next three sections derive those factors.

The first question is how long to train. The **Chinchilla** paper (Hoffmann et al., 2022) showed that for a fixed compute budget, there's a best ratio of training tokens to parameters. Too few tokens and the model is undertrained. Too many and you're spending compute for little gain.

We store this ratio as one config value, `target_param_data_ratio`:

$$\text{training tokens} = \text{target\_param\_data\_ratio} \times \text{parameters}$$

A bigger model has more parameters, so it automatically trains on more tokens. Chinchilla found about **20** tokens per parameter for their setup. For our architecture we use **10**.

> **Note:** The ratio depends on the architecture and data. It's something you measure for your own setup, not a constant you copy from a paper.

---

## 5. Batch size from training tokens

More training tokens means a larger best batch size. How much larger? The **Power Lines** paper (Bergsma et al., 2025) measured that the best batch size $B$ grows with the number of training tokens $D$ as:

$$B_\text{opt} \propto D^{0.383}$$

So we scale from the reference model:

```python
token_ratio = target_tokens / reference_tokens
predicted_batch_size = reference_batch_size * (token_ratio ** 0.383)
```

The exponent is well below 1, so the batch grows much more slowly than the data. 10x more tokens gives $10^{0.383} \approx 2.4\times$ the batch, not 10x. We round the result to a power of 2.

Like the Chinchilla ratio, 0.383 was measured on a specific setup. Treat it as a starting point you can recalibrate.

---

## 6. Learning rate from batch size

The batch size just changed, so the learning rate should too.

*Why?* Each step's gradient is an average over the batch. A bigger batch averages over more examples, so the gradient is less noisy. A less noisy gradient points more reliably in the right direction, so you can afford a bigger step.

How much bigger depends on the optimizer:

```
SGD:    double the batch -> double the learning rate      (linear)
Adam:   double the batch -> learning rate × √2 ≈ 1.41     (square root)
```

*Why is Adam different?* Adam divides each update by a running estimate of the gradient's size, which already cancels part of the noise. So a bigger batch helps it less, and the rule that works in practice is the square root:

```python
batch_ratio = total_batch_size / reference_batch_size
lr_scale_factor = batch_ratio ** 0.5
```

The reference model's learning rate is tuned by hand. Every other size multiplies it by `lr_scale_factor`.

---

## 7. Weight decay from batch size and training tokens

This is the least obvious link, so let's derive it.

### 7.1 AdamW as a moving average

With AdamW, each step does two things to a weight: it adds the gradient update, and it shrinks the weight a little (that's weight decay). The shrinking means old updates slowly fade out, so the weight ends up being roughly a **moving average of recent updates**.

How long is that averaging window? Each step multiplies the weight by $(1 - \eta\lambda)$, where $\eta$ is the learning rate and $\lambda$ is the weight decay. An update fades out after about

$$\frac{1}{\eta \lambda} \text{ steps}$$

### 7.2 The window as a fraction of training

The whole training run is $D / B$ steps, where $D$ is training tokens and $B$ is the batch size in tokens. Divide the window by the run length, and you get the window as a fraction of training. The Power Lines paper calls this $\tau_\text{epoch}$:

$$\tau_\text{epoch} = \frac{1 / (\eta\lambda)}{D / B} = \frac{B}{\eta \lambda D}$$

The paper found that the best $\tau_\text{epoch}$ stays about the same across model sizes. So we hold it fixed and solve for $\lambda$:

$$\lambda = \frac{B}{\eta \, \tau_\text{epoch} \, D}$$

### 7.3 Plugging in the learning rate

From §6, $\eta$ scales as $\sqrt{B}$. So $B / \eta$ scales as $B / \sqrt{B} = \sqrt{B}$, and:

$$\frac{\lambda}{\lambda_\text{ref}} = \sqrt{\frac{B}{B_\text{ref}}} \times \frac{D_\text{ref}}{D}$$

```python
batch_ratio = total_batch_size / reference_batch_size
token_ratio = reference_tokens / target_tokens   # note: D_ref / D, inverted
wd_scale_factor = (batch_ratio ** 0.5) * token_ratio
```

In plain English:

> **A bigger batch needs more weight decay. A longer training run needs less, because the moving average already spans more updates.**

The full code is in `batch_scaling.py`.

---

## 8. A worked example: depth 12 to depth 24

Let's follow every link of the cascade for one change: `depth` from 12 to 24.

**Architecture.** From §3:

```
depth = 12:  n_layer = 12,  n_embed =   768,  n_head = 12   -> ~125M parameters
depth = 24:  n_layer = 24,  n_embed = 1,536,  n_head = 24   -> ~760M parameters
```

*Why 6x the parameters when we only doubled the depth?* Because doubling depth also doubles the width. Each transformer layer has about $12 \times n_\text{embed}^2$ weights ($4 n_\text{embed}^2$ in attention and $8 n_\text{embed}^2$ in the MLP). So the layers grow by $2$ (twice as many) $\times\ 2^2$ (each one four times bigger) $= 8\times$. The output head only grows with width, so $2\times$. Together, about $6\times$.

**Training tokens.** From §4, with a ratio of 10:

```
depth = 12:  10 × 125M = 1.25B tokens
depth = 24:  10 × 760M = 7.6B tokens     -> token ratio = 7.6 / 1.25 = 6.1
```

**Batch size.** From §5, starting from the hand-tuned 524,288 tokens ($2^{19}$):

$$524\text{K} \times 6.1^{0.383} = 524\text{K} \times 2.0 \approx 1\text{M tokens}$$

**Learning rate.** From §6, the batch doubled:

$$\sqrt{1\text{M} / 524\text{K}} = \sqrt{2} \approx 1.41\times$$

**Weight decay.** From §7:

$$\sqrt{2} \times \frac{1.25\text{B}}{7.6\text{B}} = 1.41 \times 0.16 \approx 0.23\times$$

Why does weight decay drop so much? Two effects pull in opposite directions. The bigger batch pushes it up by $1.41\times$. The longer run pushes it down by $6.1\times$, because a longer run already averages over more updates. The second effect is larger, so weight decay ends up at about a quarter of the reference.

Every number above came from one change: 12 to 24.

---

## 9. The sweep

A full scaling sweep is now:

```bash
DEPTH=6  python train.py   # ~30M params
DEPTH=8  python train.py   # ~51M params
DEPTH=12 python train.py   # ~125M params  <- tune hyperparameters here, once
DEPTH=16 python train.py   # ~253M params
DEPTH=20 python train.py   # ~458M params
DEPTH=26 python train.py   # ~948M params
```

One number per run. For each, the architecture, training length, batch size, learning rate and weight decay are all derived.

Compare that to six hand-written configs, each checked by hand: a learning rate left over from the small model, an out-of-memory error, a batch size tweaked and rerun. That's a week of work for a question that should take an afternoon.

---

## 10. The general idea

Treat `n_layer`, `n_embed` and `n_head` as three independent settings, and most of the configs you can write are bad, so you need checks to catch them. Derive all three from one number, and the bad configs can't be written at all. There's nothing to check.

That's a useful rule well beyond transformers: **make invalid states impossible to express.** Don't check that `n_embed % n_head == 0`. Build both from one input so it's always true.

And it frees up time for the questions that actually matter: what the loss curves look like, and where the scaling law stops holding.
