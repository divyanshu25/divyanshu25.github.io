const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    team: "Unified Platform",
    location: "San Jose, CA",
    period: "June 2021 — Present",
    highlights: [
      {
        area: "Vision-Language Model Training",
        bullets: [
          "Designed and trained a 13B-parameter vision-language model from scratch on 2M image-text pairs across 8x H100 GPUs, using novel observable injection techniques.",
          "Fine-tuned CLIP on custom vision-language datasets, boosting F1 score by 20% in multi-label classification tasks.",
          "Developed MQCore evaluation benchmark inspired by DCLM CORE for domain-specific quality assessment.",
        ],
      },
      {
        area: "LLM Alignment & Evaluation",
        bullets: [
          "Created curiosity-driven LLM-as-a-judge framework for personalized creative evaluation (arXiv 2025).",
          "Achieved 18% improvement in human-likeness metrics and 25% improvement in response adherence through advanced alignment techniques.",
        ],
      },
      {
        area: "Localization & Cultural AI",
        bullets: [
          "Invented a multi-stage generative pipeline for cross-cultural image adaptation (US Patent 2026).",
          "Designed a constrained machine translation system with facet-level adherence scoring (US Patent 2026).",
        ],
      },
      {
        area: "Production AI Systems",
        bullets: [
          "Led development of Adobe GenStudio for Performance Marketing, launched Oct 2024 — now serving Fortune 500 clients including Microsoft and AT&T.",
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
          "Co-engineered Adobe's User Response Prediction Service — 3,500 QPS/node at 0.3–0.6ms latency (99th percentile).",
          "Built a Model Management service on MLflow and Databricks for end-to-end model lifecycle management.",
          "Designed a GC-free async event pipeline using LMAX Disruptor, eliminating back-pressure under peak load.",
          "Reduced GC pauses to ~30ms per 20s through ThreadLocal reuse, custom serialization, and JVM tuning.",
        ],
      },
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-20 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/20 to-violet-100/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/20 to-blue-100/20 rounded-full filter blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Experience
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0">
            <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-gray-200"></div>
          </div>

          <div className="space-y-12">
            {experience.map((role, index) => (
              <div key={index} className="relative">
                {/* Timeline node */}
                <div className="hidden md:flex absolute left-0 top-6 items-center">
                  <div className="relative z-10 w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-sm"></div>
                  <div className="w-6 h-[1px] bg-gray-200 ml-[-1px]"></div>
                </div>

                <div className="md:ml-14">
                  <div className="group relative bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-200 hover:border-blue-300 transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>

                    <div className="relative">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {role.period}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {role.location}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                        {role.title}
                      </h3>
                      <p className="text-lg text-gray-600 mb-6 font-medium">
                        {role.company} — {role.team}
                      </p>

                      {/* Highlight areas */}
                      <div className="space-y-5">
                        {role.highlights.map((highlight, hIdx) => (
                          <div key={hIdx}>
                            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">
                              {highlight.area}
                            </h4>
                            <ul className="space-y-1.5">
                              {highlight.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="flex gap-2 text-base text-gray-700 leading-relaxed">
                                  <span className="text-blue-400 mt-1.5 flex-shrink-0">&#8594;</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
