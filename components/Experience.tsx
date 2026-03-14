const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    team: "Unified Platform",
    location: "San Jose, CA",
    period: "June 2021 — Present",
    highlights: [
      {
        area: "Vision-Language Model Training & Evaluation",
        bullets: [
          "Designed and trained a 13B-parameter VLM on 2M image-text pairs across 8x H100 GPUs, using novel observable injection techniques.",
          "Fine-tuned CLIP and LLaVA-style models, boosting F1 score by 20% in multi-label classification tasks.",
          "Developed MQCore evaluation benchmark inspired by DCLM CORE for domain-specific quality assessment.",
        ],
      },
      {
        area: "LLM Alignment & Multimodal Reasoning",
        bullets: [
          "Created curiosity-driven LLM-as-a-judge framework for personalized creative evaluation (arXiv 2025).",
          "Pioneered creativity modeling with Bayesian surprise, achieving 23% F1 and 38% correlation improvements.",
          "Leading development of multimodal agentic systems for Photoshop editing workflows.",
        ],
      },
      {
        area: "Production AI & Patented Inventions",
        bullets: [
          "Led development of Adobe GenStudio for Performance Marketing (Oct 2024) — now serving Fortune 500 clients including Microsoft and AT&T.",
          "Invented cross-cultural image adaptation pipeline using VLM grounding + diffusion models (US Patent 2026).",
          "Designed constrained machine translation system with facet-level adherence scoring (US Patent 2026).",
        ],
      },
    ],
  },
  {
    title: "Machine Learning Engineer",
    company: "Adobe",
    team: "Adobe Inc.",
    location: "Bangalore, India",
    period: "July 2016 — August 2019",
    highlights: [
      {
        area: "ML Infrastructure & Serving",
        bullets: [
          "Co-engineered Adobe's ML inference platform — 3,500 QPS/node at 0.3–0.6ms latency (p99).",
          "Designed GC-free async event pipeline using LMAX Disruptor, eliminating back-pressure under peak load.",
          "Built custom model lifecycle management platform — versioned deployment, monitoring, and staged rollout across environments.",
        ],
      },
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-14 bg-[var(--bg)] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1 tracking-tight">
            Experience
          </h2>
        </div>

        <div className="space-y-6">
          {experience.map((role, index) => (
            <div key={index} className="relative bg-[var(--bg-card)] p-6 sm:p-8 rounded-xl border border-[var(--border)]">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <h3 className="text-lg font-bold text-[var(--text)]">
                  {role.title}
                </h3>
                <span className="text-[var(--text-tertiary)]">—</span>
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
