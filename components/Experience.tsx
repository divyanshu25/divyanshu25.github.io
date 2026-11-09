const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    team: "Unified Platform",
    location: "San Jose, CA",
    period: "June 2021 – Present",
    highlights: [
      {
        area: "VLM Fine-Tuning with SFT and Reinforcement Learning (Gemma-3-12B)",
        bullets: [
          "Built distributed SFT and multi-round GRPO pipelines to train Gemma-3-12B (12.2B parameters; LoRA rank 256, 1.19B trainable) to assess marketing-image quality on 8× H100: each RL round samples a group of completions per prompt, scores them with programmatic rewards against ground truth, and trains with a clipped policy-gradient loss.",
          "Audited GRPO runs for reward hacking and found the policy learning safe guesses: over 20 rounds, one magnitude word grew from 55% to a peak of 89% of its answers, and in another run it gave the middle quality rating to 84% of images when reviewers gave it to 56%. Traced the causes to the reward's shape, an unlearnable label, and lost exploration, and redesigned the scorers.",
        ],
      },
      {
        area: "Multimodal Judge Models",
        bullets: [
          "Built a 1.1M-row training set from 14 human-rated sources with rater disagreement as soft labels, and trained Qwen3.5-4B LoRA judges on mixes sampled from it. With a score readout refit on crowd labels, the served model raised validation SRCC over the reference model from 0.421 to 0.663 on KonIQ and from 0.395 to 0.595 on KADID (paired 95% CIs above 0).",
          "Built a held-out benchmark suite: 8 sets, 67,168 items, leak-checked with SSCD against all 537,282 training images, with a pre-registered bootstrap non-inferiority release gate.",
        ],
      },
      {
        area: "Unsupervised Photo Retouching (ATune)",
        bullets: [
          "Led ATune (co-first author, under review): a 54M-parameter model that learns photo retouching from 10M unedited photographs with no expert edits and operates off-the-shelf editors by setting their sliders. With 157 raters, its edits beat GPT-6 Astra using the same editor (54.3% of decisive votes, 95% CI 50.3–58.3; 3,524 answers) and tied with Claude Opus 5 (50.5%, CI 46.8–54.2).",
          "Evaluated ATune on FiveK, PPR10K, and SPAQ with 9 published judges and Holm-corrected paired tests: on every set, at least 8 of 9 prefer it to GPT-6 Astra and at least 7 of 9 to seven learned retouchers.",
        ],
      },
      {
        area: "Evaluation Research",
        bullets: [
          "Created DistortBench (first author; CVPR 2026 and ICML 2026 Workshops): 13.5K questions over 27 distortion types and 5 severity levels. Of 18 VLMs, the best (Qwen3.5-27B) scores 61.9% (chance 25%), above the average annotator (60.2%) and below a 3-annotator majority vote (65.7%).",
          "Co-authored JudgeBreak (ICML 2026 Workshop): across 95 subjective settings, linear probes on Qwen3-32B hidden states with cross-validated layer selection reach 78.1% mean pairwise accuracy vs. 70.1% for the best reward model or zero-shot GPT-5.4 judge.",
        ],
      },
      {
        area: "Product",
        bullets: [
          "Prototyped Adobe GenStudio for Performance Marketing (launched October 2024, serving Fortune 500 clients) and built a multimodal Photoshop agent that edits images using 49 tools with vision grounding.",
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
