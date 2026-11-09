const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    team: "Unified Platform",
    location: "San Jose, CA",
    period: "June 2021 – Present",
    highlights: [
      {
        area: "Vision-Language Model Training & Evaluation",
        bullets: [
          "Led ATune (under review): a 54M-parameter model that learns photo retouching from 10M unedited stock photographs and drives off-the-shelf editors through their sliders. In a study with 157 raters, its edits were preferred over GPT-6 Astra's in 54.3% of votes and tied with Claude Opus 5's (50.5%).",
          "Fine-tuned Gemma-3-12B with LoRA on 8× H100 (DDP, BF16, FlashAttention-2, Liger kernels) to assess the quality of marketing images.",
          "Grounded VLM quality reasoning in computed pixel-level metrics (sharpness, exposure, color balance); the resulting interpretable scorer reaches MAE 0.77 (Pearson r ≈ 0.88) vs. 1.34 for zero-shot GPT-5.4 and 1.95 for Claude Opus 4.7.",
          "Built the MQCore evaluation benchmark and a fault-tolerant async annotation pipeline (100+ images/min) for the 700K-image KADIS image-quality dataset.",
        ],
      },
      {
        area: "Evaluation Research & Benchmarking",
        bullets: [
          "First author of DistortBench (CVPR 2026 and ICML 2026 Workshops): a 13.5K-question benchmark over 27 distortion types and 5 severity levels. Of 18 VLMs evaluated, the best (Qwen3.5-27B) scores 61.9% (chance 25%), above the average individual annotator (60.2%) but below a 3-annotator majority vote (65.7%).",
          "Co-authored JudgeBreak (ICML 2026 Workshop): across 95 subjective evaluation settings, linear probes on Qwen3-32B hidden states reach 78.1% mean pairwise accuracy vs. 70.1% for the strongest baseline (the best reward model or a zero-shot GPT-5.4 judge).",
          "Co-authored a curiosity-driven LLM-as-a-judge that personalizes creative-writing evaluation using an intrinsic curiosity model (AAAI 2026 Workshop, Oral), raising mean F1 from 0.37 to 0.62 and Pearson r from 0.15 to 0.56 over an SFT baseline.",
        ],
      },
      {
        area: "Production Multimodal Systems & Agents",
        bullets: [
          "Built the founding prototype of Adobe GenStudio for Performance Marketing (launched October 2024, now serving Fortune 500 clients including Microsoft and AT&T) and architected its multimodal brand service (brand-DNA extraction, retrieval, VLM content validation) across 3 regions.",
          "Built a multimodal Photoshop agent that edits images from natural language through a 49-tool observe, think, and act loop with vision grounding and a quality-critic refinement step.",
        ],
      },
    ],
  },
  {
    title: "Machine Learning Engineer",
    company: "Adobe",
    team: "Adobe Inc.",
    location: "Bangalore, India",
    period: "July 2016 – August 2019",
    highlights: [
      {
        area: "ML Infrastructure & Serving",
        bullets: [
          "Co-engineered Adobe's ML inference platform: 3,500 QPS/node at 0.3–0.6 ms app-side p99 latency.",
          "Designed GC-free async event pipeline using LMAX Disruptor, eliminating back-pressure under peak load.",
          "Built custom model lifecycle management platform: versioned deployment, monitoring, and staged rollout across environments.",
        ],
      },
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-6 bg-[var(--bg)] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1 tracking-tight">
            Experience
          </h2>
        </div>

        <div className="space-y-6">
          {experience.map((role, index) => (
            <div key={index} className="relative bg-[var(--bg-card)] p-4 sm:p-6 lg:p-8 rounded-xl border border-[var(--border)]">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <h3 className="text-lg font-bold text-[var(--text)]">
                  {role.title}
                </h3>
                <span className="text-[var(--text-tertiary)]">/</span>
                <span className="text-sm text-[var(--text-secondary)] font-medium">
                  {role.company}, {role.location}
                </span>
              </div>
              <p className="text-xs font-mono text-[var(--text-tertiary)] mb-5">{role.period}</p>

              <div className="space-y-4">
                {role.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className={hIdx > 0 ? "pt-4 border-t border-[var(--border)]" : ""}>
                    <h4 className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                      {highlight.area}
                    </h4>
                    <ul className="space-y-1.5">
                      {highlight.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex gap-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                          <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] mt-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
