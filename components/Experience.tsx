const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    team: "Unified Platform",
    location: "San Jose, CA",
    period: "June 2021:Present",
    highlights: [
      {
        area: "Vision-Language Model Training & Evaluation",
        bullets: [
          "Fine-tuned a Gemma-3-12B vision-language model with LoRA across 8× H100 GPUs (DDP, bfloat16, Flash Attention 2 + Liger kernels) for large-scale marketing-quality assessment.",
          "Pioneered an \"observable injection\" technique that grounds VLM quality reasoning in 14+ computed pixel-level metrics (sharpness, exposure, color balance), yielding an interpretable scorer at Pearson r ≈ 0.88 and MAE 0.77 that outperforms GPT-5.4 (MAE 1.34) and Claude Opus 4.7 (MAE 1.95).",
          "Built the MQCore evaluation benchmark (inspired by DCLM CORE) and a fault-tolerant async annotation pipeline processing 100+ images/min over the 700K-image KADIS corpus.",
        ],
      },
      {
        area: "Multimodal Research & Benchmarking",
        bullets: [
          "Authored DistortBench (CVPR FGVC13 Workshop 2026):a 13.5K-question diagnostic benchmark spanning 27 distortion types, 6 perceptual categories, and 5 severity levels.",
          "Evaluated 18+ frontier VLMs (GPT-5.4, Claude Sonnet 4.6, Qwen, InternVL, Gemma) with bootstrap CIs and balanced-accuracy metrics, exposing low-level perception as a major weakness:top model 61.9% vs. 65.7% human baseline.",
          "Created a curiosity-driven LLM-as-a-judge framework for personalized creative evaluation using Bayesian surprise (arXiv 2025):+23% F1 and +38% correlation over baselines.",
        ],
      },
      {
        area: "Production Multimodal Systems & Agents",
        bullets: [
          "Architected the Unified Brand Service (90K+ LOC across 3 global regions) powering Adobe GenStudio:multimodal brand-DNA extraction, RAG-based retrieval, and GPT-4-Vision content validation.",
          "Built a multimodal agent that drives Adobe Photoshop from natural language via a 49-tool observe-think-act loop with vision grounding and an iterative quality-critic refinement layer.",
          "Led the foundational prototype of Adobe GenStudio for Performance Marketing (Oct 2024):now serving Fortune 500 clients including Microsoft and AT&T:and invented patented VLM pipelines for cross-cultural image adaptation and constrained translation (US Patents 2026).",
        ],
      },
    ],
  },
  {
    title: "Machine Learning Engineer",
    company: "Adobe",
    team: "Adobe Inc.",
    location: "Bangalore, India",
    period: "July 2016:August 2019",
    highlights: [
      {
        area: "ML Infrastructure & Serving",
        bullets: [
          "Co-engineered Adobe's ML inference platform:3,500 QPS/node at 0.3–0.6ms latency (p99).",
          "Designed GC-free async event pipeline using LMAX Disruptor, eliminating back-pressure under peak load.",
          "Built custom model lifecycle management platform:versioned deployment, monitoring, and staged rollout across environments.",
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
