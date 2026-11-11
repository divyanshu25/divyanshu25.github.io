const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    location: "San Jose, CA",
    period: "June 2021 – Present",
    highlights: [
      {
        area: "GenStudio for Performance Marketing · Tech Lead",
        bullets: [
          "Led technical strategy and the production LLM API layer, taking GenStudio from prototype to multi-million-dollar Fortune 500 adoption.",
          "Co-invented brand-guideline extraction and compliance scoring, the engine behind Adobe Brand Intelligence.",
        ],
      },
      {
        area: "Marketing VLM · Gemma-3-12B, SFT + GRPO",
        bullets: [
          "Optimized distributed SFT and multi-round GRPO on 8× H100s, cutting training from 6 days to 24 hours.",
          "Diagnosed reward hacking (84% middle-rating collapse vs. 56% human) and redesigned the reward to bring it to 64%.",
          "Extended the VLM into a Photoshop agent that plans edits toward marketing appeal, now used by millions.",
        ],
      },
      {
        area: "ATune · Co-Lead with Adobe Research",
        bullets: [
          "A 54M-parameter retoucher that drives real image editors, trained on 10M unedited photos with no expert targets.",
          "Beat GPT-6 Astra (54.3% of decisive votes) and matched Claude Opus 5 in a 157-rater human preference study.",
        ],
      },
      {
        area: "JEV-Style Marketing Judge",
        bullets: [
          "Qwen3.5-4B judge trained on 1.1M human ratings; +57% SRCC on KonIQ, now integrated into Lightroom, Adobe Stock, and Firefly AI Assistant.",
          "Caught a silent vision-encoder collapse that loss curves missed, and built automated vision-health monitoring.",
        ],
      },
      {
        area: "DistortBench · First Author",
        bullets: [
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
    highlights: [
      {
        area: "ML Serving Platform",
        bullets: [
          "Joined Adobe's ML serving platform at inception; scaled inference to 3,500 QPS per node at 0.3–0.6 ms p99 with a GC-free LMAX Disruptor pipeline.",
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
