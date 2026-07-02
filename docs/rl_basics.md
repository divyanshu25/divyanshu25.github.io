# Reinforcement Learning, from First Principles

*A from-scratch primer on how RL works for LLMs. Assumes you've understood pretraining and SFT and nothing past that.*

---

## 1. Where we are, and why SFT isn't enough

By the time you reach RL you've already done two things to the model.

First, **pretraining**: predict the next token over a giant pile of internet text. The model learns language, facts, reasoning patterns, a sloppy world model. This takes months of compute and produces a base model that can complete sentences but has no idea it's supposed to be an assistant.

Second, **SFT (supervised fine-tuning)**: take that base model and show it a few thousand curated `(conversation, ideal_response)` pairs. You do next-token prediction again, but now only on the assistant's tokens. The model learns the *format* of being helpful: turn-taking, following instructions, answering questions instead of just continuing the text.

Both of these are the same thing under the hood. **Imitation.** You show the model a target string and say "make this string more likely." Cross-entropy loss, the whole way down.

That's fine, and it gets you surprisingly far. But imitation has a ceiling, and the ceiling is your data.


> **Note:** Throughout this post we'll use **GSM8K** as our running example. It's the perfect RL toy problem. GSM8K is a dataset of 8,500 grade-school math word problems. Each one has a plain English question and a single integer answer. A typical problem looks like this:

> **Question:** James has 3 bags of apples. Each bag has 6 apples. He eats 4 apples. How many apples does he have left?
>
> **Model's response:** James starts with 3 × 6 = 18 apples. After eating 4, he has 18 - 4 = 14. `#### 14`

The `####` marker is GSM8K's convention for the final answer. The model can write whatever reasoning it likes before it, we only check the number after `####`.

Now here's the problem with SFT on this task. What we actually want is for the model to **reason its way to the correct final number**. But there are hundreds of valid reasoning paths to any given answer. We might have one demonstration in our training data showing one particular path. SFT trains the model to copy *that path*. If the model tries a slightly different sequence of steps and gets the right answer, SFT would penalize it, because those aren't the exact tokens in the training example.

More fundamentally: the thing we actually care about is a property of the *outcome*,  **"is the final number correct?"**, not a property of any particular string. SFT has no way to express that. SFT's only question is *"does the output match the target?"*, whereas we care about *"is the output correct?"*

RL is the answer. Instead of showing the model the right answer, you let it try, and then tell it whether it was right.

```
SFT:   here is the correct answer, make it more likely.   (imitation)
RL:    try to answer. I'll tell you if you were right.    (trial and error)
       now make the things that worked more likely.
```

That's the whole idea. The rest of this post is deriving exactly how to do the last line.

> **Note**: This is where Andrej Karpathy's observation that **RL is like sucking intelligence through a straw** feels most apt. The model's trajectory can be completely nonsensical, but as long as it lands on the right answer, RL will still reward it. Addressing that issue, though, is beyond the scope of this article.

---

## 2. The setup: turning a chat model into an RL agent

We need to recast "answer a math question" as something RL can chew on. The vocabulary of RL is: **policy**, **action**, **trajectory**, **reward**.

- The **policy** is the model itself. Given a context, it outputs a probability distribution over the next token. Call it $\pi_\theta(\text{token} \mid \text{context})$ where $\theta$ are the model's weights. The policy *is* the network.
- An **action** is sampling one token from that distribution.
- A **trajectory** is a full rollout: start from the question, sample token after token until the model emits `<|assistant_end|>`. That sequence of tokens is one complete attempt at the problem.
- The **reward** is a single number we hand back *after* the trajectory finishes, scoring how good the attempt was.

For GSM8K the reward is dead simple:

```python
def reward(self, conversation, assistant_response):
    is_correct = self.evaluate(conversation, assistant_response)
    return float(is_correct)   # 1.0 if final number matches, else 0.0
```

That's it. We parse the number after the `####` marker out of the model's completion, compare it to ground truth, and return `1.0` or `0.0`. Notice what we are **not** doing: we are not checking whether the reasoning matches, not scoring partial credit, not looking at style. The model is free to reason however it likes; we only grade the final answer. This is the thing SFT structurally could not do.

> **A note on what makes a good reward.** GSM8K is a gift: the answer is a number, so it's *automatically verifiable*. We can check correctness with a regex, no human and no second model in the loop. This is why math and code are the poster children of LLM RL: the reward is cheap, objective, and un-gameable. The moment your reward needs a human or a learned reward model to judge it, everything gets harder and more expensive. We'll stick to the easy, verifiable case on purpose.

---

## 3. The core question: which tokens get credit?

Say we let the model attempt a problem and it produces a 200-token solution that arrives at the right answer. Reward = 1.0. 

Now what? We want to "make this work more likely." But the model didn't make one decision: it made 200 decisions, one per token. Which of those 200 tokens deserve credit for the success? The early ones that set up the approach? The arithmetic in the middle? The final number?

This is the **credit assignment problem**, and it's the central difficulty of RL. The reward arrives once, at the very end, but it has to be distributed back over every decision that led to it.

The beautiful, almost-too-simple answer that **policy gradients** give: *don't try to be clever about it. Give every token in the trajectory the same credit: the trajectory's total reward.* Scale each token's nudge by how well its rollout did:  upward for good rollouts, and downward for bad ones. Average over enough rollouts and the tokens that systematically lead to good outcomes float up, while the rest wash out as noise.

Let's make that precise.

---

## 4. Deriving the policy gradient (the one piece of math)

### 4.1 Step 0: What a "gradient" means here

If you've done SFT you already know the training loop: compute a loss, call `.backward()`, the optimizer takes a step. The gradient ($\nabla_\theta$) is just a long vector, one number per weight in the model, that says "increase this weight to decrease the loss." Gradient *descent* follows that direction to reduce loss.

Here we want to *maximize* reward instead of minimize loss, so we follow the gradient in the *opposite* sign convention: **gradient ascent**. Mechanically it's identical: compute a gradient, step in it. The math below is about deriving *what that gradient is*.

---

### 4.2 Step 1: The objective: maximize expected reward

When we say "maximize expected reward," concretely it means: over many different problems and rollouts, we want the average reward to be as high as possible. In math, if $\tau$ is one rollout (trajectory) and $R(\tau)$ is its reward:

$$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\big[ R(\tau) \big]$$

$\mathbb{E}[\cdot]$ just means "average over many samples." The subscript $\tau \sim \pi_\theta$ says those samples are drawn from our current policy (the model with weights $\theta$).

We want $\nabla_\theta J(\theta)$: the gradient of this average reward with respect to every weight.

---

### 4.3 Step 2: A simpler idea first, and why we want more

You might think: out of 4 rollouts, if 2 got the answer right (reward=1) and 2 didn't (reward=0), why not just do SFT on the 2 correct ones? Ignore the failures, treat the successes as gold demonstrations, backpropagate normally.

This is a real algorithm (called **rejection sampling fine-tuning (RFT)**) and it works. In fact, with a pure 0/1 reward, REINFORCE (no baseline) is mathematically identical to it: a $R=0$ trajectory multiplies the gradient by zero, so it contributes nothing, and you're left reinforcing only the correct ones.

**But there's a better version.** The failures aren't just noise to be ignored: they're information. A rollout that got the wrong answer is actively telling you "don't do this." If you could also *push down* the probability of incorrect responses, you'd use the full signal from every rollout, not just half of it.

That calls for a gradient that looks like: *(some signed weight) × (push this rollout up or down)*. If the weight is positive, reinforce the rollout. If it's negative, suppress it. The **log-derivative trick** (next section) gives us exactly this form. One thing to be clear about upfront: with a plain 0/1 reward, the weight is the reward itself, which is never negative. So right after deriving the trick, we still won't have suppression of bad rollouts. That arrives in §5, when we replace the raw reward with an **advantage** (reward minus a baseline), which *can* go negative. The trick gives us the right structure; the baseline is what puts negative weights in it.

---

### 4.4 Step 3: The log-derivative trick (one algebraic identity)

Before the algebra, let's make one piece of notation concrete: **what is $p_\theta(\tau)$?**

It's the probability that your model (with weights $\theta$) generates that specific sequence of tokens. The model picks one token at a time, each with some probability. The probability of the whole trajectory is the product of every token's probability given everything before it:

$$p_\theta(\tau) = \pi_\theta(\text{"The"} \mid \text{question}) \times \pi_\theta(\text{"answer"} \mid \text{question, "The"}) \times \cdots \times \pi_\theta(\text{"10"} \mid \text{everything before})$$

Same idea as rolling two dice: probability of rolling 3 then 5 = $\frac{1}{6} \times \frac{1}{6}$. Multiply the individual probabilities.

This gives us **two distinct objects, and it's worth keeping them straight** (they look similar but mean different things):

- **$\pi_\theta(a_t \mid s_t)$: the policy.** The per-token distribution the network outputs at one step: given the context $s_t$, the probability of each possible next token $a_t$. This is literally the model's softmax. It's *the* fundamental object: when we say "the policy," this is it.
- **$p_\theta(\tau)$: the trajectory probability.** A single number for the *whole* rollout, obtained by multiplying the policy's per-step probabilities together: $p_\theta(\tau) = \prod_t \pi_\theta(a_t \mid s_t)$.

So $p_\theta(\tau)$ is *built from* $\pi_\theta$: it's just the product of all the per-token probabilities along the trajectory. They're related, but not the same thing. $\pi_\theta$ is one step; $p_\theta(\tau)$ is the whole sequence.

The $\theta$ subscript on both is a reminder that these probabilities change when the weights change: that's what training does. A gradient step adjusts $\theta$ to make $p_\theta(\tau)$ higher for good trajectories and lower for bad ones.

---

There's a clever identity from calculus. For any function $p(\tau)$:

$$\nabla_\theta \, p(\tau) = p(\tau) \cdot \nabla_\theta \log p(\tau)$$

*Why is this true?* Chain rule. $\log p$ is a function of $p$, so $\frac{d}{d\theta} \log p = \frac{1}{p} \frac{dp}{d\theta}$, rearranged: $\frac{dp}{d\theta} = p \cdot \frac{d \log p}{d\theta}$. That's it. *High school chain rule.*

*Why is this useful?* First, a quick note on notation: $\mathbb{E}[f(\tau)]$ (expectation) and $\int p(\tau) f(\tau) \, d\tau$ (integral) are the same thing written two ways. Expectation *is* a weighted average, and in math a weighted average over a continuous space is written as an integral. So:

$$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)] = \int p_\theta(\tau) \, R(\tau) \, d\tau$$

Same object, two notations. The integral form is useful here because it lets us write out the gradient explicitly. Now watch what happens:

$$\nabla_\theta J(\theta)
= \nabla_\theta \int p_\theta(\tau) \, R(\tau) \, d\tau
= \int \nabla_\theta p_\theta(\tau) \, R(\tau) \, d\tau$$

The second step moves the $\nabla_\theta$ inside the integral, valid because $R(\tau)$ doesn't depend on $\theta$ (the reward is fixed once the rollout is done), so it's just a constant being pulled outside.

Now apply the identity to swap $\nabla p$ for $p \cdot \nabla \log p$:

$$= \int p_\theta(\tau) \cdot \nabla_\theta \log p_\theta(\tau) \cdot R(\tau) \, d\tau$$

And now flip back to expectation notation: an integral weighted by $p_\theta(\tau)$ is exactly the definition of $\mathbb{E}_{\tau \sim \pi_\theta}[\cdot]$.

$$\boxed{\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\big[ R(\tau)\, \nabla_\theta \log p_\theta(\tau) \big]}$$

The sampling is now *inside* the expectation and we only need to differentiate the $\log p_\theta(\tau)$ term, which is differentiable. The trick moved the differentiation off the sampling operation and onto the log-probability, which the model computes directly. (And in the next step we'll crack $\log p_\theta(\tau)$ open into the per-token policy terms.)

---

### 4.5 Step 4: breaking the trajectory into tokens

The boxed result has a $\log p_\theta(\tau)$: the log-probability of the *whole trajectory*. But the network doesn't output trajectory probabilities; it outputs per-token policy probabilities $\pi_\theta(a_t \mid s_t)$. So we crack the trajectory term open using the relationship from Step 3:

$$p_\theta(\tau) = \prod_{t} \pi_\theta(a_t \mid s_t)$$

where $a_t$ is the token sampled at step $t$ and $s_t$ is everything before it (the context). Taking the log of a product converts it to a sum (the standard $\log(ab) = \log a + \log b$):

$$\log p_\theta(\tau) = \sum_{t} \log \pi_\theta(a_t \mid s_t)$$

This is the key move: the trajectory log-prob is just the **sum of the per-token policy log-probs**, and those are exactly what the network produces. The gradient of a sum is the sum of the gradients:

$$\nabla_\theta \log p_\theta(\tau) = \sum_{t} \nabla_\theta \log \pi_\theta(a_t \mid s_t)$$

---

### 4.6 Putting it together: REINFORCE

Substituting back in:

$$\nabla_\theta J(\theta) = \mathbb{E}\Big[ R(\tau) \cdot \sum_{t} \nabla_\theta \log \pi_\theta(a_t \mid s_t) \Big]$$

Read this one piece at a time:

- $\nabla_\theta \log \pi_\theta(a_t \mid s_t)$: the gradient that would make token $a_t$ *more likely* at step $t$. This is the direction to nudge the weights to assign higher probability to the token that was actually sampled.
- Multiply that direction by $R(\tau)$: the reward for the whole trajectory.
- Sum over every token $t$ in the rollout.
- Average over many rollouts.

In plain English:

> **For every token in the rollout: compute the direction that makes that token more likely, then scale it by the trajectory's reward. If the rollout was good ($R=1$), push all its tokens up. If the reward was zero, do nothing. Repeat over many rollouts.**

That's it. That's REINFORCE. The gradient is computable because $\log \pi_\theta(a_t \mid s_t)$ is just the log-probability the model assigns to the token it sampled, something the model computes directly and can backpropagate through.

---

### 4.7 The connection to SFT that should click right now
For an autoregressive decoder (like the GPT here), the cross-entropy loss over one sequence is:

$$\mathcal{L}(\theta) = -\sum_{t=1}^{T} \log \pi_\theta(a_t \mid a_{<t})$$

where $a_t$ is the true/target token at position $t$, and $a_{<t} = a_1, \dots, a_{t-1}$ is everything before it (the context). Usually you average instead of sum:

$$\mathcal{L}(\theta) = -\frac{1}{T}\sum_{t=1}^{T} \log \pi_\theta(a_t \mid a_{<t})$$


In SFT the training loss for one token is:

$$\mathcal{L}_\text{SFT} = -\log \pi_\theta(a_t \mid s_t)$$

Minimizing that is identical to maximizing $\log \pi_\theta(a_t \mid s_t)$, which is identical to the gradient direction above. So the per-token gradient in RL is **exactly the same computation as SFT**. The one difference:

```
SFT gradient:    gradient of log π  ×  1           (constant, always reinforce)
RL gradient:     gradient of log π  ×  R(τ)        (scale by reward, varies per rollout)
```

SFT is the special case where every demonstration gets reward = 1 (it's shown as correct by assumption). RL lets the reward vary: good rollouts get reinforced strongly, bad rollouts get suppressed, and the signal is proportional to outcome quality. **Same engine, smarter throttle**.

---

## 5. The variance problem, and the one trick that fixes it

REINFORCE works. But if you actually run it, it learns *slowly* and the training curve looks like a seismograph. The culprit is **variance**, and there's a one-line fix that is genuinely one of the prettiest tricks in RL. Let's see the problem first, because once you see it the fix is obvious.

Here's the thing that should bother you about the gradient we just derived. On GSM8K the reward is always 0 or 1, **never negative**. So trace what the gradient actually does to each rollout:

- Correct rollout ($R=1$): push all its tokens **up**.
- Wrong rollout ($R=0$): multiply by zero → do **nothing**.

Stare at that for a second. **You never push anything down.** Every step is "make these sequences more likely," and the only signal the model gets is how *hard* it gets pushed up. A correct rollout gets a nudge of 1; a wrong rollout contributes nothing. The softmax is normalized, so relentlessly upvoting correct responses does implicitly downvote everything else, but it's a maddeningly indirect signal. It's like coaching chess by only ever saying "nice!" and never once saying "no, not that."

But it gets worse. This binary signal tells the model nothing about *how much* better one correct rollout is compared to another, or how much it still needs to learn on easy questions it already knows well. Take a question the model already nails 90% of the time. Sample 16 rollouts → ~14 correct, ~2 wrong. The gradient cheerfully reinforces all 14 correct ones at full strength, even though the model *already knows how to solve this*. We're blowing almost the entire gradient budget applauding behavior that's already locked in, while the 2 genuinely informative failures contribute exactly nothing. Huge update, near-zero learning. **That's the variance problem: the size of the gradient has almost nothing to do with how much there actually is to learn.**

The fix is a **baseline**. Instead of scaling by the raw reward, scale by reward *minus some reference value* $b$:

$$\nabla_\theta J = \mathbb{E}\Big[ (R(\tau) - b) \sum_t \nabla_\theta \log \pi_\theta(a_t \mid s_t) \Big]$$

Two things make this beautiful.

**First, it brings back the "down."** Pick $b$ to be roughly the average reward for a question, and suddenly $R(\tau) - b$ is positive for better-than-average rollouts and *negative* for worse-than-average ones. Now the gradient pushes good rollouts up **and bad rollouts down**, both halves of the signal, finally. The quantity $R(\tau) - b$ gets a name: the **advantage**. It stops asking "was this rollout good?" and starts asking the only question that actually teaches: "was this rollout better or worse than what I'd normally do here?"

**Second, it's free.** You might worry: we just changed the weights on every rollout — doesn't that corrupt what we're optimizing? No, because subtracting $b$ doesn't change the *expected* gradient. To see why, expand the new objective by linearity of expectation:

$$\mathbb{E}\big[(R(\tau) - b)\,\nabla_\theta \log p_\theta\big] = \underbrace{\mathbb{E}\big[R(\tau)\,\nabla_\theta \log p_\theta\big]}_{\text{original REINFORCE gradient}} - \underbrace{\mathbb{E}\big[b\,\nabla_\theta \log p_\theta\big]}_{\text{= 0, proved below}}$$

The second term vanishes. Here's the proof (the key is that any probability distribution integrates to 1 regardless of $\theta$, so its gradient with respect to $\theta$ must be zero):

$$
\mathbb{E}_{\tau}\big[\nabla_\theta \log p_\theta(\tau)\big]
= \int p_\theta \,\nabla_\theta \log p_\theta \, d\tau
= \int \nabla_\theta\, p_\theta \, d\tau
= \nabla_\theta \underbrace{\int p_\theta \, d\tau}_{=\,1\ \text{always}}
= \nabla_\theta\, 1 = 0
$$

The middle step runs the log-derivative trick backwards ($p\,\nabla\log p = \nabla p$); the last step is just "the gradient of a constant is zero." So the baseline term is exactly zero in expectation, and you can choose any $b$ you like without introducing bias.

Now: what's a good baseline? The cleverest choice, and this is the central idea of **GRPO** (Group Relative Policy Optimization), is to use *the average reward of other attempts at the same question*.

So the recipe becomes:

1. Take one question.
2. Sample a **group** of $G$ completions for it (say, 16).
3. Compute each completion's reward.
4. Use the **group's mean reward** as the baseline.
5. Advantage of completion $i$ = $R_i - \text{mean}(R)$.

This is gorgeous because the baseline is *per-question and self-calibrating*. An easy question where 15/16 rollouts succeed has a high baseline (~0.94), so the lone failure gets a large negative advantage ("you blew an easy one, fix that") while the successes get a tiny positive nudge ("nice, but everyone did that"). A hard question where only 1/16 succeeds has a low baseline (~0.06), so that one lucky correct rollout gets a big positive advantage ("you found the needle, do more of that"). The signal automatically focuses on the rollouts that are *surprising relative to their peers*. No value network, no extra model: just sample a bunch and subtract the mean.

In code it's two lines:

```python
mu = rewards.mean()
advantages = rewards - mu
```

That's the entire "GRPO." Let that sink in: the famous algorithm is `rewards - rewards.mean()`.

---

## 6. From REINFORCE to GRPO: the family tree

We've actually already built the entire algorithm: REINFORCE + a group-mean baseline. That's essentially what "GRPO" is. But the literature has a zoo of acronyms **(PPO, TRPO, GRPO, DAPO)** that all sound like prerequisites. They're not. Each one is just **REINFORCE plus a patch for a specific pain**. Build the family tree from scratch and "GRPO" reads as "REINFORCE with a couple of patches," which is exactly what it is.

### 6.1 The family tree: each algorithm just patches the last one's headache

The most useful thing to realize about the acronym soup (REINFORCE, TRPO, PPO, GRPO, DAPO) is that it isn't five rival algorithms you study separately. It's **one** algorithm, REINFORCE, with a chain of patches bolted on. Every node below is just "the previous one **plus** a fix for the specific headache it created." Here's the whole chain on one line; then we walk it node by node:

1. **REINFORCE** — the base algorithm. One gradient step per batch of rollouts.
2. **+ Importance sampling → TRPO** — lets you reuse a batch for multiple steps, but needs a trust region to stop the policy from drifting too far.
3. **+ PPO clip** — replaces TRPO's expensive second-order trust region with a cheap one-line clamp. Same protection, 10x simpler.
4. **+ Group baseline → GRPO** — ditches PPO's learned value network. Uses the mean reward across a group of rollouts for the same question as the baseline instead.
5. **+ DAPO tweaks** — four practical fixes for large-scale, long chain-of-thought training (asymmetric clip, dynamic sampling, token-level normalization, overlong reward shaping).

*If that felt like a lot, don't worry, we'll walk through each one step by step.*

#### 6.1.1 REINFORCE: the base case

REINFORCE is the original policy gradient algorithm; everything else in this tree is a patch on top of it. The whole loop:

1. **Sample rollouts.** Let the current model attempt a batch of questions; each attempt is one trajectory.
2. **Score them.** Run the reward function on each: for GSM8K, 1.0 if the final number matches, else 0.0.
3. **Update.** For each token in each rollout, take the gradient of its log-probability (the direction that makes that token more likely) and scale it by the rollout's **reward**. Sum over all tokens and rollouts, step.

The core insight, which §4 derived: **it's the SFT cross-entropy gradient, scaled by a reward instead of treating every token as correct.** With a 0/1 reward that means a correct rollout (reward = 1) gets all its tokens pushed up, and a wrong rollout (reward = 0) contributes nothing: its gradient is multiplied by zero. Run enough questions through it and the distribution concentrates on the reasoning paths that work.

**The limitation that kicks off the chain.** REINFORCE is strictly **on-policy**: the gradient is only valid for the exact model that generated the rollouts. The instant you step, the model changes and the rollouts in your hand are stale: reusing them for a second step would bias the gradient. So one batch of rollouts buys exactly **one** step, then it's trash. Since generating rollouts is the expensive part (decoding tokens one at a time, across many samples), spending all that compute on a single update *stings*, and that sting is what the next node fixes.

#### 6.1.2 Importance sampling: fixes "a batch is only good for one step"

(Not an algorithm on its own: it's the patch the next three are built on, so it comes first.)

We'd love to take several gradient steps per batch, since rollouts are expensive to generate. The naive way, just keep stepping on the same data, is subtly wrong: after the first step the model has moved, so you're now training on samples drawn by an *older* version of itself. The gradient quietly points the wrong way, and nothing warns you.

The fix is one of the oldest tricks in statistics. If you have samples from an old distribution but want the average under a new one, reweight each sample by how much more (or less) likely the new model makes it:

$$\text{ratio} = \frac{\pi_\text{new}(a)}{\pi_\text{old}(a)} \quad\text{"how much more likely is this token now than when I sampled it?"}$$

A token that's become 1.5× as likely since sampling counts 1.5×; one that's become half as likely counts 0.5×. Reweighting every token this way cancels the bias, and stale data becomes usable again. So REINFORCE's objective `reward · logp` simply becomes `reward · ratio`. That's the whole idea.

And it barely touches the gradient. Differentiating the ratio with the same `∇p = p·∇log p` identity from §4.4 (with $\pi_\text{old}$ held constant) gives:

$$\nabla\,\text{ratio} = \frac{\nabla\pi_\text{new}}{\pi_\text{old}} = \frac{\pi_\text{new}\cdot\nabla\log\pi_\text{new}}{\pi_\text{old}} = \text{ratio}\cdot\nabla\log\pi_\text{new}$$

so REINFORCE's per-token gradient `reward · ∇logp` becomes `reward · ratio · ∇logp`, the very same gradient, with the ratio bolted on as a reweighting factor.

In code it's a one-line change, and you compute the ratio in log-space for stability:

```python
logp   = -cross_entropy(logits, targets)   # log π_new, same forward pass as REINFORCE/SFT
ratio  = torch.exp(logp - logp_old)        # = π_new/π_old; logp_old logged at sampling, detached
pg_obj = (ratio * rewards).sum()           # was: (logp * rewards).sum()
```

The model outputs log-probabilities, so `π_new/π_old` is computed as `exp(logp - logp_old)`: subtract in log-space, exponentiate once. This avoids numerical underflow from multiplying hundreds of tiny per-token probabilities directly.

Here's the key insight on when you actually need this. On the *first* step, before the model has moved, `π_new = π_old`, so every ratio is exactly 1 and `reward · ratio · ∇logp` collapses straight back to plain REINFORCE. The ratio only earns its keep on the *second* step onward, once you reuse the batch and the two policies have drifted apart. If you take exactly one gradient step per batch and then resample fresh, the ratio is always 1, and you can use the plain on-policy objective without ever computing one.

#### 6.1.3 TRPO: fixes "a reused-data step can leap too far"

Reusing a batch, the previous fix, opened a new wound. The moment the current policy drifts from the one that generated the data, the ratio stops being near 1: a token the old model thought unlikely but the new one now loves produces a *huge* ratio, the gradient's variance detonates, and one oversized step can wreck the model. So we need a cap: don't let the policy move *too far* in a single round of reuse.

The obvious cap is a small fixed learning rate, but that doesn't work reliably. The same step size in weight space can be a tiny behavioral change in one part of training and a catastrophic one later, the model suddenly starts repeating tokens or spewing garbage. Weight distance and behavioral distance aren't the same thing. We need to budget steps by how far the model's *behavior* moves, not by how far the *weights* move. And to do that we need a way to measure "how different are two policies", which is the **KL divergence**.

> **Quick aside: what is "KL Divergence"?** Everyone uses it to mean "how different are two probability distributions," and that's all it is. Say at one position the old policy thinks the next token is `{cat: 0.6, dog: 0.4}` and the new one thinks `{cat: 0.5, dog: 0.5}`. KL gives you a single number for how far apart those two opinions are: `0` if identical, growing as they diverge. The formula is just a weighted average of the log-ratio of the two probabilities:
>
> $$\text{KL}(p \,\|\, q) = \sum_{v \in V} p(v)\,\log\frac{p(v)}{q(v)}$$
>
> Read it as: for each possible token $v$, look at how many times more (or less) likely $p$ thinks it is versus $q$, that's $\log\frac{p(v)}{q(v)}$, and average those log-ratios, weighting by how often $p$ actually produces that token. If $p$ and $q$ agree everywhere, every ratio is 1, every log is 0, and the sum is 0.
>
> For an LLM the "distribution" is the next-token softmax, so you compute this sum **over the whole vocabulary at one position**, then **add it up across all positions** in the sequence to get the KL for the whole response. (Computing the full vocab sum for every token, for two models, is pricey, so in practice people estimate it from just the *sampled* token's probabilities, but the exact definition is the sum above.)

With KL as the ruler, **TRPO** (Trust Region Policy Optimization) states its rule in one line: **never let a single update change the policy by more than a fixed KL budget**, say $\text{KL} = 0.01$. The catch is the weight-vs-behavior gap from above: the same step size in weight space produces a different amount of behavioral change depending on where you are in training. So you can't just pick a fixed step size and know you're staying inside the KL budget. TRPO has to *estimate* how much behavior changes per unit of weight movement at the current point, and then step accordingly.

The mechanics of how TRPO estimates and enforces this budget (Fisher Information Matrix, conjugate gradient, line search) are beyond the scope of this post, the details are in the [original paper](https://arxiv.org/abs/1502.05477). What matters here is that it works but it's expensive. That cost is exactly why people reached for PPO's cheaper alternative instead. PPO threw the whole machinery away and got 90% of the benefit with a one-line clamp.

#### 6.1.4 PPO: fixes "TRPO's second-order math is too expensive"

**PPO** (Proximal Policy Optimization) is the cheap, wildly popular approximation that made TRPO a museum piece. It keeps §6.1.2's reusable ratio objective but makes two moves: weight each token by a proper **advantage** instead of the raw reward, and replace TRPO's curvature math with a dead-simple **clip**. Take them in turn.

**1. The advantage: and the critic that produces it.** PPO uses a learned baseline: a second network called the **critic** (or value network) that takes the current state, the prompt plus tokens generated so far, and predicts how much reward to expect from here. The advantage is then "what you actually got minus what the critic predicted." A positive advantage means the rollout did better than expected; negative means it did worse. PPO further refines this into per-token advantages using **GAE** (Generalized Advantage Estimation), which assigns credit more carefully across individual tokens rather than giving every token the same global number. A full treatment of GAE is out of scope here, the [original PPO paper](https://arxiv.org/abs/1707.06347) covers it well. The key **cost**: the critic is a whole extra model to train alongside the policy, roughly doubling memory and compute. That's exactly what GRPO removes next.

**2. The clip: a cheap stand-in for TRPO's trust region.** Rather than measure KL and solve for a step size, PPO just forbids any token's ratio from leaving $[1-\epsilon,\,1+\epsilon] = [0.8,\,1.2]$ (with $\epsilon \approx 0.2$):

$$\mathcal{L}^{\text{PPO}} = \min\!\left(\underbrace{\text{ratio} \cdot A}_{\text{term 1: unclipped}},\quad \underbrace{\text{clip}(\text{ratio},\ 1{-}\epsilon,\ 1{+}\epsilon) \cdot A}_{\text{term 2: ratio clamped to } [0.8,\,1.2]}\right), \quad \epsilon = 0.2$$

Term 1 is the plain importance-sampling objective from §6.1.2: no clamping, ratio can go anywhere. Term 2 is the same thing but with the ratio hard-clamped to $[0.8, 1.2]$. The `min` picks whichever of the two is smaller.

To read the `min`, consider four cases: ratio can be inside or outside `[0.8, 1.2]`, and A can be positive or negative:

- **Good update, gone far enough** (A>0, ratio>1.2, token's prob rose past the boundary): `min(1.5·A, 1.2·A) = 1.2·A`, picks the clipped term, gradient zero, stop pushing. ✓
- **Bad update made a mistake** (A<0, ratio>1.2, model *increased* a bad token's prob): `min(1.5·(−1), 1.2·(−1)) = min(−1.5, −1.2) = −1.5`, picks the *unclipped* term, gradient flows, corrects back down. ✓
- **Bad update, suppressed far enough** (A<0, ratio<0.8, token's prob fell past the boundary): `min(0.6·(−1), 0.8·(−1)) = min(−0.6, −0.8) = −0.8`, picks the clipped term, gradient zero, stop suppressing. ✓
- **Good update made a mistake** (A>0, ratio<0.8, model *decreased* a good token's prob): `min(0.6·A, 0.8·A) = 0.6·A`, picks the *unclipped* term, gradient flows, corrects back up. ✓

The pattern: **clipping only kicks in when the ratio moved in the same direction as the advantage (a beneficial update that's gone far enough). When the ratio moved in the wrong direction, a mistake, the `min` picks the unclipped term and lets the gradient fix it.** With just the clipped term, cases 2 and 4 would have zero gradient and the mistakes would go uncorrected.

Another way to see it: `min(ratio·A, clip·A)` is always ≤ `ratio·A`, making it a **pessimistic lower bound** on the unclipped objective: you never over-claim progress, but you never block corrections. Net effect: TRPO's trust region, first-order and free, with no KL computed and no line search.

**The payoff** is the data reuse we were after all along: with the clip as a guardrail you can safely run *several* gradient steps over the same batch of rollouts before throwing it out and resampling. Squeezing many safe steps from each expensive batch is PPO's whole value proposition.

One more thing usually bundled into PPO-for-LLMs, while we're here: the **KL-to-reference leash.** Bounding the step size stops *blow-ups*, but not a slower failure: over many steps a policy chasing a loose or learned reward will creep toward degenerate text that scores high and reads like nonsense ("reward hacking"). The fix is to keep a *frozen copy* of the original SFT model and add a penalty for drifting too far from *it*. Careful: this is a **different KL from TRPO's**, and people mix them up constantly; TRPO bounds the gap between *consecutive* policies (step to step), while this one anchors to a *fixed* reference for the whole run. One limits how fast you move; the other ties you to base camp. (This is the "spring" version of a KL bound, vs. TRPO's hard wall.)

#### 6.1.5 GRPO: fixes "PPO hauls a costly second network (the critic)"

Step back and look at what that critic costs. It's a second model roughly as large as the policy, which in LLM-land means it **roughly doubles your memory footprint and a big chunk of your compute**: you're forwarding *and* backpropagating two giant networks every step. It has to be trained, so it adds its own loss and hyperparameters. And it's a chicken-and-egg headache: early in training the critic's predictions are garbage, so your advantages are garbage, so the policy gets noisy updates, and a critic that mis-estimates can drag the whole run sideways.

**GRPO** (Group Relative Policy Optimization) answers exactly that and **deletes the critic outright.** It still needs a baseline, but recall *why* we wanted one (the variance section): just to know whether a rollout did better or worse than "typical for this question." GRPO gets that for free from rollouts it's already generating: sample a **group** of $G$ completions per question and use the group's **mean reward** as the baseline. No value network, no GAE, no second model. That's literally the `rewards - rewards.mean()` we built earlier, the "critic" replaced by an empirical average over samples you were taking anyway. In practice this **cuts memory and model FLOPs by roughly half** versus PPO and removes the critic-instability failure mode entirely. The trade: you now need *several* completions per question to estimate that mean, costing extra sampling, but sampling is cheap next to hauling a second network. GRPO keeps PPO's clip and usually the KL-to-reference leash; the *only* thing it removes is the critic.

#### 6.1.6 DAPO: fixes "scaling up long-reasoning runs"

**DAPO** (Decoupled Clip and Dynamic sampling Policy Optimization, from ByteDance) is GRPO with four engineering fixes that address specific failure modes at scale. The full details are in the [DAPO paper](https://arxiv.org/abs/2503.14476); here's the intuition for each:

1. **Clip-Higher**: PPO's symmetric clip $[0.8, 1.2]$ limits how fast any token's probability can grow, which hurts exploration — the model converges to a narrow set of confident responses and stops trying new things. DAPO loosens only the upper bound, so rare-but-good tokens can still climb quickly.

2. **Dynamic Sampling**: when every completion in a group gets the same reward (all correct, or all wrong), the advantages are all zero and the group contributes no gradient. These are wasted rollouts. DAPO skips such groups and keeps sampling until the batch has a healthy mix of wins and losses.

3. **Token-Level Loss**: divides the loss by total tokens, not total sequences. Without this, a 50-token response and a 500-token response each count as "one example," which quietly biases the model toward short answers.

4. **Overlong Reward Shaping**: if a response hits the length limit mid-generation and gets cut off, a hard penalty is unfair, the model had no way to know it was about to be truncated. DAPO softens or removes the penalty for truncated responses to keep the reward signal clean.

These fixes matter most when training on long chain-of-thought tasks at scale. For short, simple tasks with a clean verifiable reward, you can usually skip them.

---

## 7. The one-paragraph version

You did SFT, which is imitation and therefore capped by your demonstrations. RL lets you optimize the *outcome* directly: let the model attempt a verifiable problem, score the attempt with a reward, and reuse your SFT cross-entropy gradient, but scaled by that reward, so successful rollouts get reinforced and failures suppressed. Sample a group of attempts per question and subtract the group's mean reward to get a low-variance **advantage** (that's the whole of "GRPO"). Everything else in the acronym zoo (the importance ratio, the trust region, the PPO clip, the value network, the DAPO tweaks) is just a patch for a pain that only shows up at a particular scale or setting. Reach for each one when its specific headache actually appears, and not before.

```
pretraining   ->  learn language          (imitate the internet)
SFT           ->  learn to be an assistant (imitate good answers)
RL            ->  learn to be RIGHT        (try, get scored, reinforce what worked)
```
