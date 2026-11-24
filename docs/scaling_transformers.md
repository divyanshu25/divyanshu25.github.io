# A Lazy Engineer's Guide to Scaling Transformers

*How I got every hyperparameter in [VibeNanoChat](https://github.com/divyanshu25/VibeNanoChat) to follow from a single number.*

---

Training an LLM isn't the tedious part. The GPUs do that. The tedious part is the configuration.

Every time I wanted to try a new model size, I'd sit down and pick three numbers: the number of layers, the width, and the number of attention heads. Then I'd pick a batch size, a learning rate, a weight decay, and how many tokens to train on. And these numbers all depend on each other in ways that are easy to get wrong.

Now do that for six model sizes, because you want to run a scaling sweep. One config will have a learning rate that made sense for the small model but not the big one. Another will run out of memory on the first batch. You'll find out three hours in.

I got tired of this, so I made everything follow from one integer: `depth`, the number of transformer layers. You pick the depth, and the width, the heads, the batch size, the learning rate, the weight decay and the training length are all computed from it. Want a bigger model? Make the number bigger. That's the whole interface.

Here's how it works.

## Most configs are bad

A transformer's shape comes down to three numbers. `n_layer` is how many blocks you stack. `n_embed` is the width, the size of the vector each token is represented by. `n_head` is how many attention heads each layer has.

It looks like you have three free choices, but you don't really, because there are constraints between them.

The width has to divide evenly by the number of heads, since each head gets `n_embed / n_head` dimensions. If that's not a whole number, the model doesn't even work.

That per-head dimension should also be 64 or 128, because that's what Flash Attention's fastest kernels are built for.

And then there's the aspect ratio, `n_embed / n_layer`, which is the interesting one. If you look at well-known models, it keeps landing in roughly the same range. GPT-2 small is 768 wide and 12 deep, so 64. GPT-3 175B is 12,288 wide and 96 deep, so 128. LLaMA 7B is 4,096 and 32, also 128. This isn't a coincidence. Kaplan et al. (2020) found that loss barely changes across a wide range of aspect ratios, so people settled on what works and stopped messing with it. Go far outside that range and you're in territory nobody has really tested.

So if you think of all possible `(n_layer, n_embed, n_head)` combinations as a 3D space, most of it is junk. Some configs are broken, some are slow, and some are weirdly shaped. The good ones sit along a thin curve running through that space.

So why search the whole 3D space? Just walk along the curve.

## Three lines of math

Fix the aspect ratio and the head dimension, and everything else falls out of depth:

```
n_layer = depth
n_embed = depth × aspect_ratio      (rounded up to a multiple of head_dim)
n_head  = n_embed / head_dim
```

With `aspect_ratio = 64` and `head_dim = 64`, everything divides evenly. `depth = 12` gives 768 wide with 12 heads, which is exactly GPT-2 small. `depth = 24` gives 1,536 wide with 24 heads.

What I like about this is what you can no longer do. You can't make a config where the heads don't divide the width. You can't make one with a weird aspect ratio. You don't need to check for those mistakes, because there's no way to write them down.

In code, it lives in `__post_init__` on the config dataclass, which Python runs automatically right after the object is created:

```python
@dataclass
class GPTConfig:
    depth: int = 12          # the one knob; 12 is the GPT-2 small shape
    aspect_ratio: int = 64   # n_embed / n_layer, fixed across sizes
    head_dim: int = 64       # per-head dimension, a Flash Attention fast path

    def __post_init__(self):
        if self.depth > 0:
            self.n_layer = self.depth
            base_dim = self.depth * self.aspect_ratio

            # round up to the nearest multiple of head_dim,
            # so n_embed % head_dim == 0 always holds
            self.n_embed = ((base_dim + self.head_dim - 1) // self.head_dim) * self.head_dim

            self.n_head = self.n_embed // self.head_dim
```

The rounding line only matters if you try other aspect ratios. Say you try `aspect_ratio = 50` with `depth = 13`. That gives a base width of 650, and 650 / 64 is about 10.16 heads, which doesn't work. The rounding bumps the width up to 704, which is exactly 11 heads. I also track how much got added:

```python
nudge = self.n_embed - base_dim  # how many dimensions were added to fit the heads
```

With 64 and 64, the nudge is always zero. With other values, it tells you how far the real model drifted from what you asked for.

## The rest of the hyperparameters

Getting the architecture from depth is nice, but the part I find more satisfying is that everything else follows too. Depth sets the architecture. The architecture sets the parameter count. The parameter count sets how long to train. The training length sets the batch size. The batch size sets the learning rate and the weight decay. Each step feeds the next.

All of it is measured against one reference model, `depth = 12`, about 125M parameters. It's small enough that I can afford to tune it by hand. I tuned its batch size, learning rate and weight decay once, and every other size just scales those values by some ratio.

### How long to train

The Chinchilla paper (Hoffmann et al., 2022) showed that for a fixed compute budget, there's a best ratio of training tokens to model parameters. Train on too few tokens and the model is undertrained. Train on too many and you're spending compute for very little gain.

I store this as one config value, `target_param_data_ratio`:

```
training_tokens = target_param_data_ratio × parameters
```

A bigger model has more parameters, so it automatically trains on more tokens. Chinchilla found about 20 tokens per parameter for their setup. For mine it's 10. Don't just copy either number. This ratio depends on the architecture, and you have to measure it for yours.

### Batch size

More training tokens means you want a bigger batch. But how much bigger? The Power Lines paper (Bergsma et al., 2025) found that the best batch size grows with the number of training tokens D like this:

```
B_opt ∝ D^0.383
```

So I scale from the reference model:

```python
token_ratio = target_tokens / reference_tokens
predicted_batch_size = reference_batch_size * (token_ratio ** 0.383)
```

The exponent is well below 1, so the batch grows a lot slower than the data. 10x more tokens only gets you 10^0.383 ≈ 2.4x the batch size. I round the result to a power of 2. Like the Chinchilla ratio, the 0.383 was measured on someone else's setup, so treat it as a good starting point you can recalibrate.

### Learning rate

Now the batch changed, so the learning rate should too. A bigger batch averages the gradient over more examples, so each gradient estimate is less noisy and you can trust it enough to take a bigger step.

With plain SGD, the usual rule is linear: double the batch, double the learning rate. Adam is different. Adam already divides each update by a running estimate of how big the gradients are, which cancels out part of the noise on its own. So it gains less from a bigger batch, and the rule that works in practice is the square root:

```python
batch_ratio = total_batch_size / reference_batch_size
lr_scale_factor = batch_ratio ** 0.5
```

Double the batch, and the learning rate goes up by √2 ≈ 1.41x, not 2x.

### Weight decay

This one took me the longest to understand, so let me go slowly.

The Power Lines paper looks at AdamW in a useful way. With weight decay, the model's weights end up behaving like a moving average of recent updates. Older updates slowly fade out. The question is how long that averaging window is.

It turns out the window is about 1 / (η·λ) steps, where η is the learning rate and λ is the weight decay. The whole training run is D / B steps, where D is the number of training tokens and B is the batch size in tokens. Divide one by the other and you get the window as a fraction of the training run:

```
τ_epoch = (1 / (η·λ)) / (D / B) = B / (η·λ·D)
```

The paper found that the best τ_epoch stays about the same across model sizes. So I hold it fixed and solve for weight decay:

```
λ = B / (η · τ_epoch · D)
```

The learning rate already scales with √B from the last section, so B / η scales like B / √B = √B. That leaves:

```
λ / λ_ref = √(B / B_ref) × (D_ref / D)
```

```python
batch_ratio = total_batch_size / reference_batch_size
token_ratio = reference_tokens / target_tokens   # note: D_ref / D, flipped
wd_scale_factor = (batch_ratio ** 0.5) * token_ratio
```

In plain words: a bigger batch wants more weight decay, and a longer run wants less. The full code is in `batch_scaling.py`.

## Let's follow the numbers

Let's go from the reference model at depth 12 to depth 24 and see what changes.

At depth 12, the model has 12 layers, 768 width and 12 heads, about 125M parameters. That means 10 × 125M = 1.25B training tokens. The batch size is 524,288 tokens (that's 2^19), which I tuned by hand. The learning rate and weight decay scales are 1.0, by definition.

At depth 24, the model has 24 layers, 1,536 width and 24 heads, about 760M parameters.

Wait, why 760M? We only doubled the depth. But remember, doubling depth also doubles the width. Each transformer layer has about 12 × n_embed² weights (4 × n_embed² for attention, 8 × n_embed² for the MLP). So the layers grow by 2 for twice as many layers, times 2² = 4 for the wider layers, which is 8x. The output head only grows with width, so 2x. Mix those together and you get about 6x.

Now the cascade. Training tokens are 10 × 760M = 7.6B, which is 7.6 / 1.25 = 6.1x the reference. The batch size becomes 524K × 6.1^0.383 = 524K × 2.0 ≈ 1M tokens. The batch doubled, so the learning rate goes up by √2 ≈ 1.41x. And the weight decay becomes √2 × (1.25 / 7.6) = 1.41 × 0.16 ≈ 0.23x.

That last one drops a lot, and it's worth seeing why. The bigger batch pushes weight decay up by 1.41x. But the model trains on 6.1x more tokens, and a longer run already averages over more updates, so it needs much less decay to keep the same τ_epoch. The second effect is bigger, so overall it goes down.

Every one of those numbers came from changing 12 to 24.

## The payoff

A full scaling sweep now looks like this:

```bash
DEPTH=6  python train.py   # ~30M params
DEPTH=8  python train.py   # ~51M params
DEPTH=12 python train.py   # ~125M params  <- tune hyperparameters here, once
DEPTH=16 python train.py   # ~253M params
DEPTH=20 python train.py   # ~458M params
DEPTH=26 python train.py   # ~948M params
```

One number per run. The architecture, training length, batch size, learning rate and weight decay all come out the other side.

Compare that to six hand-written configs, each one checked by hand, and the usual mistakes: forgetting to update the learning rate for the bigger model, hitting an out-of-memory error, tweaking the batch size and starting over. That used to eat a week. Now it's an afternoon.

## The bigger idea

If I zoom out, the thing I like most here isn't really about transformers. If you treat `n_layer`, `n_embed` and `n_head` as three independent settings, most of the combinations you can write down are bad, and you have to check for that. If you instead compute all three from one number, the bad combinations can't be written down in the first place. There's nothing to check.

That's a good rule for designing config and APIs in general: make invalid states impossible to express. Don't check that `n_embed % n_head == 0`. Build both from one input so it's always true.

And the practical win is that I spend my time on the questions I actually care about, like what the loss curves look like and where the scaling law starts to break, instead of on bookkeeping.
