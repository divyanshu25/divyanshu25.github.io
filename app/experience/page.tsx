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
        area: "GenStudio for Performance Marketing · Tech Lead",
        items: [
          "Led technical strategy and the production LLM API layer, taking GenStudio from prototype to multi-million-dollar Fortune 500 adoption.",
          "Co-invented brand-guideline extraction and compliance scoring, the engine behind Adobe Brand Intelligence.",
        ],
      },
      {
        area: "Marketing VLM · Gemma-3-12B, SFT + GRPO",
        items: [
          "Optimized distributed SFT and multi-round GRPO on 8× H100s, cutting training from 6 days to 24 hours.",
          "Diagnosed reward hacking (84% middle-rating collapse vs. 56% human) and redesigned the reward to bring it to 64%.",
          "Extended the VLM into a Photoshop agent that plans edits toward marketing appeal, now used by millions.",
        ],
      },
      {
        area: "ATune · Co-Lead with Adobe Research",
        items: [
          "A 54M-parameter retoucher that drives real image editors, trained on 10M unedited photos with no expert targets.",
          "Beat GPT-6 Astra (54.3% of decisive votes) and matched Claude Opus 5 in a 157-rater human preference study.",
        ],
      },
      {
        area: "JEV-Style Marketing Judge",
        items: [
          "Qwen3.5-4B judge trained on 1.1M human ratings; +57% SRCC on KonIQ, now integrated into Lightroom, Adobe Stock, and Firefly AI Assistant.",
          "Caught a silent vision-encoder collapse that loss curves missed, and built automated vision-health monitoring.",
        ],
      },
      {
        area: "DistortBench · First Author",
        items: [
          "13.5K-question benchmark for fine-grained visual quality across 27 distortion types, adopted at Adobe to evaluate Photoshop-agent models.",
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
        area: "ML Serving Platform",
        items: [
          "Joined Adobe's ML serving platform at inception; scaled inference to 3,500 QPS per node at 0.3–0.6 ms p99 with a GC-free LMAX Disruptor pipeline.",
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
