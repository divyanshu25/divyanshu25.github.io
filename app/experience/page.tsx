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
        area: "Vision-Language Model Training & Evaluation",
        items: [
          "Led ATune (under review): a 54M-parameter model that learns photo retouching from 10M unedited photographs; human raters preferred its edits over GPT-6 Astra's and rated them on par with Claude Opus 5's.",
          "Fine-tuned Gemma-3-12B with LoRA on 8× H100 to assess the quality of marketing images.",
          "Grounded VLM quality reasoning in 14+ pixel-level metrics: Pearson r ≈ 0.88, MAE 0.77, vs. zero-shot GPT-5.4 (MAE 1.34).",
          "Built the MQCore evaluation benchmark and an async annotation pipeline (100+ images/min).",
        ],
      },
      {
        area: "Evaluation Research & Benchmarking",
        items: [
          "First author of DistortBench (CVPR 2026 Workshop): the best of 18 VLMs scores 61.9%, below a 3-annotator majority vote (65.7%).",
          "Co-authored JudgeBreak (ICML 2026 Workshop): linear probes on LLM hidden states reach 78.1% vs. 70.1% for the best reward model or LLM judge.",
          "Co-authored a curiosity-driven LLM-as-a-judge for personalized creative evaluation (AAAI 2026 Workshop, Oral).",
        ],
      },
      {
        area: "Production AI & Patents",
        items: [
          "Built the founding prototype of Adobe GenStudio for Performance Marketing, now serving Fortune 500 clients including Microsoft and AT&T.",
          "Built a multimodal agent that edits images in Photoshop from natural language through a 49-tool loop.",
          "4 US patents: 1 granted (constrained machine translation), 3 pending.",
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
            8+ years building ML systems at Adobe, from sub-millisecond inference engines to multimodal language models for creative work.
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
