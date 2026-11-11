const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    location: "San Jose, CA",
    period: "June 2021 – Present",
    highlights: [
      {
        area: "FixIt: Multimodal Models for Marketing & Visual Quality (Tech Lead, Team of 7)",
        bullets: [
          "Architected a sub-second JEV-style judge model integrated directly into the Firefly AI Agent evaluation harness, improving the agent's outputs through real-time feedback and reducing user revisions by 40%.",
          "Directed the development of three specialized model streams: domain-adapted VLMs, marketing-quality judges, and an unsupervised photo retoucher trained entirely without human-edited pairs.",
        ],
      },
      {
        area: "Adobe Marketing VLM (Gemma-3-12B, SFT & GRPO Alignment)",
        bullets: [
          "Fine-tuned Gemma-3-12B via distributed SFT followed by multi-round GRPO on 8× H100s, leveraging LoRA at rank 256 (1.19B trainable parameters) across 7 custom reward functions.",
          "Diagnosed policy collapse in marketing quality: the policy predicted the middle rating for 84% of images vs. 56% for humans, because a central guess is never more than 2 points from any label. Mitigated it with a cubed distance penalty and class-weighted advantages for rare ratings, cutting middle-rating predictions to 64%.",
          "Built a fault-tolerant annotation pipeline that labeled ~10M images with a teacher VLM to create the SFT dataset.",
          "Built a Photoshop agent powered by the marketing VLM that edits photos toward marketing taste, turning the model's judgment of what makes an image effective into concrete Photoshop edits.",
        ],
      },
      {
        area: "JEV-Style Marketing Judge Models",
        bullets: [
          "Trained Qwen3.5-4B LoRA judges on a 1.1M soft-labeled dataset curated from 14 human-rated sources, raising KonIQ correlation to 0.663 SRCC (vs. 0.421 for the reference model).",
          "Curated a 67K-item held-out benchmark, leak-checked against all training images via SSCD copy detection, and gated every model release on a pre-registered non-inferiority test, so a new model shipped only if it held its quality on unseen data.",
          "Conceived and built a live demo suite that turns the judge from a scorer into a creative engine: it picks the best crop of an image (0.82 pairwise accuracy on GAIC vs. 0.71 for the score-based baseline), guides photo retouching, scores marketing and custom attributes, re-ranks Adobe Stock for marketing use, and flags low-quality assets. Presented it to leadership and external partners, opening new customer engagements.",
          "Diagnosed a vision-encoder collapse that left every checkpoint image-blind within 200 steps while the loss looked normal, and added an automated vision-health check that halts training on collapse, catching silent failures the loss misses.",
        ],
      },
      {
        area: "ATune: Unsupervised Photo Retouching (Co-Lead with Adobe Research)",
        bullets: [
          "Co-led project architecture and evaluation design with Adobe Research as co-first author, owning the synthetic data pipeline, training recipe, and human evaluation framework, and mentored a PhD intern on the project.",
          "Trained a compact 54M-parameter model that performs non-destructive photo adjustments via off-the-shelf editors (RawTherapee/darktable), learned from 10M unedited photographs with zero expert targets.",
          "In a 157-rater human study (3,524 judgments), beat GPT-6 Astra (54.3% of decisive votes) and matched Claude Opus 5 (50.5%); preferred over GPT-6 Astra by ≥8 of 9 published quality judges across FiveK, PPR10K, and SPAQ.",
          "Ran data-scaling studies from 1M to 10M images: each larger corpus wins or ties, and no judge on any test set prefers a smaller one.",
        ],
      },
      {
        area: "Adobe GenStudio for Performance Marketing (Tech Lead, Team of 20+)",
        bullets: [
          "Took GenStudio from prototype to a multi-million-dollar enterprise product (launched Oct 2024), leading its technical strategy and the production API layer that serves its LLM-powered features to Fortune 500 customers.",
          "Co-invented automated brand-guideline extraction and compliance scoring (US20250117829), the foundational engine for Adobe Brand Intelligence.",
          "Developed parameter-efficient fine-tuning pipelines on a Fortune 500 customer's brand data, directly closing a custom-model enterprise deal.",
        ],
      },
      {
        area: "Evaluation Research",
        bullets: [
          "DistortBench (First Author; CVPR/ICML 2026 Workshops): Established a 13.5K-question visual distortion benchmark across 27 types and 5 severity levels; the best of 18 VLMs (61.9%) trails a human majority vote (65.7%).",
        ],
      },
    ],
  },
  {
    title: "Machine Learning Engineer",
    company: "Adobe",
    location: "Bangalore, India",
    period: "July 2016 – August 2019",
    highlights: [
      {
        area: "ML Infrastructure & Serving",
        bullets: [
          "Joined Adobe's core ML serving platform team at inception and helped plan the end-to-end serving infrastructure for internal workloads, including field-aware factorization machines.",
          "Scaled production inference throughput to 3,500 QPS per node at 0.3–0.6 ms p99 latency (Adobe Tech Blog), implementing a garbage-collection-free asynchronous event pipeline on LMAX Disruptor.",
          "Built the model lifecycle platform for versioned deployment, monitoring, and staged rollout.",
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
