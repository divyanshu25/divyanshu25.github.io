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
    period: "2021 – Present",
    blocks: [
      {
        area: "VLM Fine-Tuning with SFT and Reinforcement Learning (Gemma-3-12B)",
        items: [
          "Trained Gemma-3-12B (LoRA rank 256, 1.19B trainable parameters) to assess marketing-image quality with distributed SFT, then multi-round GRPO, on 8× H100. Each round samples a group of completions per prompt, scores them with programmatic rewards against ground truth, and updates the policy with a clipped policy-gradient loss. Diagnosed reward hacking (collapse onto hedged, low-information answers) and redesigned the reward scorers.",
        ],
      },
      {
        area: "Multimodal Judge Models",
        items: [
          "Built a 1.1M-row training set from 14 human-rated sources with rater disagreement as soft labels, and trained Qwen3.5-4B LoRA judges on mixes sampled from it. After calibrating its score output on crowd ratings, the served judge raised validation SRCC on KonIQ from 0.421 (reference model) to 0.663 (paired 95% CI above 0), measured on a leak-checked 67K-item held-out benchmark suite I built.",
        ],
      },
      {
        area: "Unsupervised Photo Retouching (ATune)",
        items: [
          "Led ATune (co-first author, under review): a 54M-parameter model that learns photo retouching from 10M unedited photographs with no expert edits and operates off-the-shelf editors by setting their sliders. With 157 raters, its edits beat GPT-6 Astra using the same editor (54.3% of decisive votes, 95% CI 50.3–58.3; 3,524 answers) and tied with Claude Opus 5 (50.5%, CI 46.8–54.2). On FiveK, PPR10K, and SPAQ, at least 8 of 9 published quality judges prefer it to GPT-6 Astra.",
        ],
      },
      {
        area: "Evaluation Research",
        items: [
          "Created DistortBench (first author; CVPR 2026 and ICML 2026 Workshops): 13.5K questions over 27 distortion types and 5 severity levels. Of 18 VLMs, the best (Qwen3.5-27B) scores 61.9% (chance 25%), above the average annotator (60.2%) and below a 3-annotator majority vote (65.7%).",
          "Co-authored JudgeBreak (ICML 2026 Workshop): linear probes on Qwen3-32B hidden states reach 78.1% pairwise accuracy across 95 subjective settings, vs. 70.1% for the best reward model or LLM judge.",
        ],
      },
      {
        area: "Product",
        items: [
          "Prototyped Adobe GenStudio for Performance Marketing (launched October 2024, serving Fortune 500 clients) and built a multimodal Photoshop agent that edits images with vision grounding.",
        ],
      },
    ],
  },
  {
    title: "Machine Learning Engineer",
    company: "Adobe",
    location: "Bangalore, India",
    period: "2016 – 2019",
    blocks: [
      {
        area: "ML Infrastructure & Serving",
        items: [
          "Co-engineered Adobe's ML inference platform: 3,500 QPS/node at 0.3–0.6 ms app-side p99 latency.",
          "GC-free async event pipeline using LMAX Disruptor: no back-pressure under peak load.",
          "Model lifecycle management: versioned deployment, monitoring, staged rollout.",
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
            8+ years at Adobe, now training and evaluating multimodal models: SFT and RL fine-tuning of vision-language models, unsupervised photo retouching, and the benchmarks that measure them.
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

                <div className={`overflow-hidden transition-all duration-500 ${openRole === i ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
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
