export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  date: string;
  authors: string[];
  link?: string;
  github?: string;
}

export const projects: Project[] = [
  {
    id: "vibe-nanochat",
    title: "VibeNanoChat: GPT-2 Scale LLM Pretraining from Scratch",
    summary: "A from-scratch framework for pretraining, scaling, and evaluating GPT-2 scale language models, featuring depth-parameterized scaling laws, a custom distributed Muon optimizer, and a 35+ benchmark evaluation suite.",
    description: "A personal research project building an end-to-end **LLM pretraining framework** from the ground up. Implemented a modern **decoder-only transformer** (RoPE, RMSNorm, sliding-window attention, value embeddings) trained with **next-token prediction** on the **FineWeb-Edu** corpus. Designed a **one-knob depth parameterization** scheme where a single `DEPTH` value auto-derives layer count, embedding width, learning rates, and weight decay, enabling effortless multi-scale training sweeps from **44M to 522M parameters**. Built **DistMuonAdamW**, a hybrid distributed optimizer applying **Muon** (Newton-Schulz orthogonalization) to 2D weight matrices and AdamW to embeddings and the LM head, with **ZeRO-2 style optimizer-state sharding** for memory efficiency. Ran **scaling-law experiments** across 40+ runs, empirically verifying the **C = 6ND** compute relation and fitting isoflop curves to find compute-optimal model sizes. Squeezed training throughput to **1M+ tokens/sec on 8× H100** via **bfloat16** mixed precision, **Flash Attention 3**, `torch.compile`, parallel data loaders, and pinned memory. Includes a **35+ task evaluation harness** (MMLU, HellaSwag, ARC, GSM8K, HumanEval) and a FastAPI web chat UI. Documented the journey in two technical blog posts on transformer scaling and training optimization.",
    tags: ["LLM Pretraining", "Scaling Laws", "Distributed Training", "PyTorch", "Flash Attention", "Muon"],
    date: "2026-03-01",
    authors: ["Divyanshu Goyal"],
    github: "https://github.com/divyanshu25/VibeNanoChat"
  },
  {
    id: "mq-model-training",
    title: "Marketing Quality Vision-Language Models",
    summary: "Fine-tuned Gemma-3-12B with SFT and multi-round GRPO, then trained Qwen3.5-4B judges for marketing attributes, checked on a leak-checked benchmark suite.",
    description: "Training **vision-language models** to judge **marketing image quality**. Built distributed **SFT** and multi-round **GRPO** pipelines for **Gemma-3-12B** (12.2B parameters; LoRA rank 256, 1.19B trainable) on 8× H100: each RL round samples a group of completions per prompt, scores them with programmatic rewards against ground truth, and trains with a clipped policy-gradient loss. Audited the runs for **reward hacking**: over 20 rounds the policy collapsed onto one magnitude word (usage rose from 0.55 to a peak of 0.89); traced the causes to the reward's shape, an unlearnable label, and lost exploration, and redesigned the scorers. Then built a **1.1M-row training set** from 14 human-rated sources, using rater disagreement as soft labels, and trained **Qwen3.5-4B** LoRA judges on mixes sampled from it; with a score readout refit on crowd labels, the served model raised validation SRCC over the reference model from **0.421 to 0.663** on KonIQ and from 0.395 to 0.595 on KADID. Each model is checked on a held-out **benchmark suite**: 8 sets, 67,168 items, leak-checked with SSCD copy detection against all 537,282 training images, with pre-registered bootstrap non-inferiority checks.",
    tags: ["Vision-Language Models", "Reinforcement Learning", "GRPO", "LoRA", "Evaluation", "PyTorch"],
    date: "2026-10-01",
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "adobe-genstudio",
    title: "Adobe GenStudio for Performance Marketing",
    summary: "Built the founding prototype and pitched it to Adobe leadership, leading to the launch of a generative-AI platform for creating on-brand marketing content at scale.",
    description: "Led the development of the **foundational prototype** and presented to Adobe executive leadership, driving the strategic decision to launch GenStudio in October 2024. This **generative AI-first platform** addresses a critical market need where content demand is expected to grow **5x by 2026**, enabling marketing teams to create on-brand campaign content at scale. Built with **Adobe Firefly** for image generation and enterprise LLMs for copy generation, the platform integrates with major advertising platforms (Google Campaign Manager 360, Meta, Microsoft Advertising, Snap, TikTok) and provides **AI-powered brand validation**. Now serving enterprise marketing teams across major brands.",
    tags: ["Generative AI", "Product Development", "LLMs", "Marketing AI"],
    date: "2024-10-14",
    authors: ["Divyanshu Goyal"],
    link: "https://business.adobe.com/products/genstudio-for-performance-marketing.html"
  }
];
