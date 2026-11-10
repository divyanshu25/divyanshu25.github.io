"use client";

import { useState } from "react";
import Link from "next/link";
import { profile } from "@/data/profile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const roles = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    location: "San Jose, CA",
    period: "June 2021 – Present",
    blocks: [
      {
        area: "FixIt: Multimodal Models for Marketing and Photo Quality (Tech Lead, team of 7)",
        items: [
          "Tech lead for three multimodal models: a marketing VLM, judge models, and the ATune retoucher. Defined the data annotation strategy, the training pipeline, and the evaluation protocol, keeping training stable and fast and verifying that each model learned its intended reward.",
          "Demonstrated sub-second decisions on marketing content. The demos secured org-wide investment in these models and led to customer engagements that opened new revenue streams.",
        ],
      },
      {
        area: "Adobe Marketing VLM (Gemma-3-12B, SFT and GRPO)",
        items: [
          "Fine-tuned Gemma-3-12B with distributed SFT followed by multi-round GRPO on 8× H100, using LoRA at rank 256 (1.19B trainable parameters). Each GRPO round samples a group of answers per prompt, scores them against ground truth, and updates the policy with a clipped policy-gradient loss.",
          "Designed programmatic rewards for 7 tasks: marketing quality, distortion type and severity, emotion, audience, attention, creative attributes, and photo observables.",
          "Diagnosed reward hacking. Rollout audits showed the policy collapsing onto hedged answers: it gave the middle quality rating to 84% of images, against 56% for human reviewers. Traced the cause to the reward's shape and redesigned the scorers.",
          "Built the data and serving stack: an asynchronous VLM annotation pipeline with chunked checkpoints and crash recovery, and a router-and-worker inference API across 4 GPUs.",
        ],
      },
      {
        area: "JEV-Style Marketing Judge Models",
        items: [
          "Trained Qwen3.5-4B LoRA judges on a 1.1M-example dataset curated from 14 human-rated sources, using the spread of rater opinions as soft labels.",
          "Raised correlation with human ratings on KonIQ to 0.663 SRCC, up from 0.421 for the reference model, after calibrating the score output on crowd ratings (paired 95% CI above zero).",
          "Built a 67K-item held-out benchmark, leak-checked with SSCD copy detection against all 537K training images. It gated every release from v9 to v19 through a pre-registered non-inferiority test. Served the judge at 21 replicas across 8 H100s.",
          "Applied the judge to pairwise crop selection, reaching 0.82 accuracy on GAIC vs. 0.71 for the score-based baseline.",
          "Detected a run whose vision encoder collapsed within 200 steps, leaving every checkpoint blind to the image, and added a vision-health check to the training pipeline.",
        ],
      },
      {
        area: "ATune: Unsupervised Photo Retouching (Co-Lead with Adobe Research)",
        items: [
          "Co-led the project with Adobe Research as co-first author (under review). Mentored an intern and owned the synthetic data pipeline, the training recipe, and the evaluation.",
          "Trained a 54M-parameter model that retouches photos by setting the sliders of off-the-shelf editors (RawTherapee and darktable). It learns from 10M unedited photographs, with no expert edits.",
          "In a human study with 157 raters and 3,524 judgments, its edits beat GPT-6 Astra using the same editor (54.3% of decisive votes, 95% CI 50.3–58.3) and matched Claude Opus 5 (50.5%). On FiveK, PPR10K, and SPAQ, at least 8 of 9 published image-quality judges also prefer it to GPT-6 Astra.",
          "Ran a data-scaling study from 1M to 10M photographs: each larger corpus wins or ties, and no judge on any test set prefers a smaller one.",
        ],
      },
      {
        area: "Adobe GenStudio for Performance Marketing (Tech Lead, team of 20+)",
        items: [
          "Took GenStudio from prototype to a multi-million-dollar product used by Fortune 500 companies (launched October 2024). Tech lead for the production API server that connects the product to cloud LLM providers at scale.",
          "Co-invented a system that uses generative models to turn a company's source material into structured brand guidelines, generate marketing content from them, and score that content against each guideline (US20250117829). Designed the brand-compliance evaluation; the work became the product Adobe Brand Intelligence.",
          "Fine-tuned custom models on a Fortune 500 customer's own data, which led to a custom-models deal.",
          "Built a multimodal agent that edits images in Photoshop, selecting from 49 tools with vision grounding.",
        ],
      },
      {
        area: "Evaluation Research",
        items: [
          "DistortBench (first author; CVPR and ICML 2026 workshops): a benchmark of 13.5K questions over 27 distortion types and 5 severity levels. The best of 18 VLMs (Qwen3.5-27B, 61.9%) beats the average annotator (60.2%) but trails a 3-annotator majority vote (65.7%).",
          "JudgeBreak (ICML 2026 workshop): showed that linear probes on Qwen3-32B hidden states beat the best reward model or LLM judge across 95 subjective settings (78.1% vs. 70.1% pairwise accuracy).",
        ],
      },
    ],
  },
  {
    title: "Machine Learning Engineer",
    company: "Adobe",
    location: "Bangalore, India",
    period: "July 2016 – August 2019",
    blocks: [
      {
        area: "ML Infrastructure & Serving",
        items: [
          "Joined Adobe's ML serving platform at inception and helped plan the end-to-end product, which hosts internal models such as field-aware factorization machines.",
          "Owned serving throughput: scaled the production ML prediction service to 3,500 QPS per node at 0.3–0.6 ms p99 latency (Adobe Tech Blog), with a garbage-collection-free asynchronous event pipeline on LMAX Disruptor that removed back-pressure under peak load.",
          "Built the model lifecycle platform for versioned deployment, monitoring, and staged rollout across environments.",
        ],
      },
    ],
  },
];

export default function ExperiencePage() {
  const [openRole, setOpenRole] = useState<number>(0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navigation />
      <main className="flex-grow pt-20 sm:pt-28 pb-12 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <Link href="/" className="inline-flex items-center text-[var(--accent)] hover:text-[var(--accent-light)] mb-10 group text-sm font-medium">
            <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[var(--text)] mb-4">Experience</h1>
          <p className="text-[var(--text-secondary)] text-lg mb-16 max-w-2xl">
            8+ years at Adobe: tech lead for Adobe GenStudio for Performance Marketing from prototype to a multi-million-dollar product, and now for multimodal models in marketing and photo quality.
          </p>

          {/* Skills bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12 sm:mb-20">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <p className="font-mono text-[10px] tracking-widest text-[var(--text-tertiary)] uppercase mb-3">Education</p>
              <div className="space-y-2">
                {profile.education.map((edu, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-[var(--text)]">{edu.degree}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <p className="font-mono text-[10px] tracking-widest text-[var(--text-tertiary)] uppercase mb-3">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.expertise.map((a) => (
                  <span key={a} className="px-2.5 py-1 bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full text-xs font-medium">{a}</span>
                ))}
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <p className="font-mono text-[10px] tracking-widest text-[var(--text-tertiary)] uppercase mb-3">Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {[...profile.skills.tools, ...profile.skills.languages].map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-[var(--bg-warm)] text-[var(--text-secondary)] border border-[var(--border)] rounded-full text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Roles */}
          <div className="space-y-12">
            {roles.map((role, i) => (
              <div key={i} className="border-l-2 border-[var(--border)] pl-8 relative">
                <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-[var(--accent)] -translate-x-[7px]" />

                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                  <h2 className="font-display text-2xl text-[var(--text)]">
                    {role.title}<span className="text-[var(--text-tertiary)]">, {role.company}</span>
                  </h2>
                  <span className="font-mono text-xs text-[var(--text-tertiary)]">{role.period}</span>
                </div>
                <p className="text-sm text-[var(--text-tertiary)] mb-6">{role.location}</p>

                <button
                  onClick={() => setOpenRole(openRole === i ? -1 : i)}
                  className="text-sm text-[var(--accent)] hover:text-[var(--accent-light)] font-medium mb-4 cursor-pointer"
                >
                  {openRole === i ? "Collapse" : "Show details"}
                </button>

                <div className={`overflow-hidden transition-all duration-500 ${openRole === i ? "max-h-[6000px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {role.blocks.map((block, j) => (
                      <div key={j} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
                        <p className="font-mono text-[10px] tracking-widest text-[var(--text-tertiary)] uppercase mb-3">{block.area}</p>
                        <ul className="space-y-2">
                          {block.items.map((item, k) => (
                            <li key={k} className="flex gap-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                              <span className="w-1 h-1 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
