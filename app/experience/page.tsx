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
        area: "FixIt: Multimodal Models for Marketing & Visual Quality (Tech Lead, Team of 7)",
        items: [
          "Spearheaded technical vision and execution across the full ML stack for a 7-person team, encompassing distributed data pipelines, RL alignment, and low-latency inference.",
          "Architected a sub-second JEV-style judge model integrated directly into the Firefly AI Agent evaluation harness, gating agent outputs to reduce user revision iterations by 40%.",
          "Directed the deployment of three specialized model streams: domain-adapted VLMs, dense reward judges, and an unsupervised photo retoucher trained entirely without human-edited pairs.",
        ],
      },
      {
        area: "Adobe Marketing VLM (Gemma-3-12B, SFT & GRPO Alignment)",
        items: [
          "Fine-tuned Gemma-3-12B via distributed SFT followed by multi-round GRPO on 8× H100s, leveraging LoRA at rank 256 (1.19B trainable parameters) across 7 custom reward functions.",
          "Diagnosed policy collapse in marketing quality: the policy predicted the middle rating for 84% of images vs. 56% for humans, because a central guess is never more than 2 points from any label. Mitigated it with a cubed distance penalty and class-weighted advantages for rare ratings, cutting middle-rating predictions to 64%.",
          "Built a fault-tolerant annotation pipeline that labeled ~10M images with a teacher VLM to create the SFT dataset.",
          "Built a Photoshop agent powered by the marketing VLM that edits photos toward marketing taste, turning the model's judgment of what makes an image effective into concrete Photoshop edits.",
        ],
      },
      {
        area: "JEV-Style Marketing Judge Models",
        items: [
          "Trained Qwen3.5-4B LoRA reward models on a 1.1M soft-labeled dataset curated from 14 human-rated sources, raising KonIQ correlation to 0.663 SRCC (vs. 0.421 for the reference model).",
          "Curated a 67K-item held-out benchmark, leak-checked against all training images via SSCD copy detection, and gated 10 model releases on a pre-registered non-inferiority test.",
          "Conceived and built a live demo suite that turns the judge from a scorer into a creative engine: it auto-crops images (0.82 pairwise accuracy on GAIC vs. 0.71 for the score-based baseline), retouches photos, scores marketing and custom attributes, re-ranks Adobe Stock for marketing use, and flags low-quality assets. Presented it to leadership and external partners, opening new customer engagements.",
          "Caught a run whose vision encoder collapsed within 200 steps, leaving every checkpoint blind to the image, and added an automated vision-health check to the training pipeline.",
        ],
      },
      {
        area: "ATune: Unsupervised Photo Retouching (Co-Lead with Adobe Research)",
        items: [
          "Co-led project design with Adobe Research as co-first author, owning the synthetic data pipeline, training recipe, and human evaluation framework, and mentored an intern on the project.",
          "Trained a 54M-parameter model that performs non-destructive photo adjustments via off-the-shelf editors (RawTherapee/darktable), learned from 10M unedited photographs with zero expert targets.",
          "In a 157-rater human study (3,524 judgments), beat GPT-6 Astra (54.3% of decisive votes) and matched Claude Opus 5 (50.5%); preferred over GPT-6 Astra by at least 8 of 9 published quality judges across FiveK, PPR10K, and SPAQ.",
          "Ran data-scaling studies from 1M to 10M images: each larger corpus wins or ties, and no judge on any test set prefers a smaller one.",
        ],
      },
      {
        area: "Adobe GenStudio for Performance Marketing (Tech Lead, Team of 20+)",
        items: [
          "Took GenStudio from prototype to a multi-million-dollar enterprise product (launched Oct 2024), leading the production API layer that serves its LLM-powered features to Fortune 500 customers.",
          "Co-invented automated brand-guideline extraction and compliance scoring (US20250117829), the foundational engine for Adobe Brand Intelligence.",
          "Developed parameter-efficient fine-tuning pipelines on a Fortune 500 customer's brand data, directly closing a custom-model enterprise deal.",
        ],
      },
      {
        area: "Evaluation Research",
        items: [
          "DistortBench (First Author; CVPR/ICML 2026 Workshops): Established a 13.5K-question visual distortion benchmark across 27 types and 5 severity levels; the best of 18 VLMs (61.9%) trails a human majority vote (65.7%).",
          "JudgeBreak (ICML 2026 Workshop): Showed that linear probing on hidden representations of Qwen3-32B outperforms LLM reward models and judges by 8 points (78.1% vs. 70.1%) on subjective evaluations.",
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
          "Joined Adobe's core ML serving platform team at inception and helped plan the end-to-end serving infrastructure for internal workloads, including field-aware factorization machines.",
          "Scaled production inference throughput to 3,500 QPS per node at 0.3–0.6 ms p99 latency (Adobe Tech Blog), implementing a garbage-collection-free asynchronous event pipeline on LMAX Disruptor.",
          "Built the model lifecycle platform for versioned deployment, monitoring, and staged rollout.",
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
