const experience = [
  {
    title: "Applied Scientist",
    company: "Adobe",
    location: "San Jose, CA",
    period: "June 2021 – Present",
    highlights: [
      {
        area: "FixIt: Multimodal Models for Marketing and Photo Quality (Tech Lead, team of 7)",
        bullets: [
          "Tech lead for three multimodal models: a marketing VLM, judge models, and the ATune retoucher. Defined the data annotation strategy, the training pipeline, and the evaluation protocol, keeping training stable and fast and verifying that each model learned its intended reward.",
          "Demonstrated sub-second decisions on marketing content. The demos secured org-wide investment in these models and led to customer engagements that opened new revenue streams.",
        ],
      },
      {
        area: "Adobe Marketing VLM (Gemma-3-12B, SFT and GRPO)",
        bullets: [
          "Fine-tuned Gemma-3-12B with distributed SFT followed by multi-round GRPO on 8× H100, using LoRA at rank 256 (1.19B trainable parameters). Each GRPO round samples a group of answers per prompt, scores them against ground truth, and updates the policy with a clipped policy-gradient loss.",
          "Designed programmatic rewards for 7 tasks: marketing quality, distortion type and severity, emotion, audience, attention, creative attributes, and photo observables.",
          "Diagnosed reward hacking. Rollout audits showed the policy collapsing onto hedged answers: it gave the middle quality rating to 84% of images, against 56% for human reviewers. Traced the cause to the reward's shape and redesigned the scorers.",
          "Built the data and serving stack: an asynchronous VLM annotation pipeline with chunked checkpoints and crash recovery, and a router-and-worker inference API across 4 GPUs.",
        ],
      },
      {
        area: "JEV-Style Marketing Judge Models",
        bullets: [
          "Trained Qwen3.5-4B LoRA judges on a 1.1M-example dataset curated from 14 human-rated sources, using the spread of rater opinions as soft labels.",
          "Raised correlation with human ratings on KonIQ to 0.663 SRCC, up from 0.421 for the reference model, after calibrating the score output on crowd ratings (paired 95% CI above zero).",
          "Built a 67K-item held-out benchmark, leak-checked with SSCD copy detection against all 537K training images. It gated every release from v9 to v19 through a pre-registered non-inferiority test. Served the judge at 21 replicas across 8 H100s.",
          "Applied the judge to pairwise crop selection, reaching 0.82 accuracy on GAIC vs. 0.71 for the score-based baseline.",
          "Detected a run whose vision encoder collapsed within 200 steps, leaving every checkpoint blind to the image, and added a vision-health check to the training pipeline.",
        ],
      },
      {
        area: "ATune: Unsupervised Photo Retouching (Co-Lead with Adobe Research)",
        bullets: [
          "Co-led the project with Adobe Research as co-first author (under review). Mentored an intern and owned the synthetic data pipeline, the training recipe, and the evaluation.",
          "Trained a 54M-parameter model that retouches photos by setting the sliders of off-the-shelf editors (RawTherapee and darktable). It learns from 10M unedited photographs, with no expert edits.",
          "In a human study with 157 raters and 3,524 judgments, its edits beat GPT-6 Astra using the same editor (54.3% of decisive votes, 95% CI 50.3–58.3) and matched Claude Opus 5 (50.5%). On FiveK, PPR10K, and SPAQ, at least 8 of 9 published image-quality judges also prefer it to GPT-6 Astra.",
          "Ran a data-scaling study from 1M to 10M photographs: each larger corpus wins or ties, and no judge on any test set prefers a smaller one.",
        ],
      },
      {
        area: "Adobe GenStudio for Performance Marketing (Tech Lead, team of 20+)",
        bullets: [
          "Took GenStudio from prototype to a multi-million-dollar product used by Fortune 500 companies (launched October 2024). Tech lead for the production API server that connects the product to cloud LLM providers at scale.",
          "Co-invented a system that uses generative models to turn a company's source material into structured brand guidelines, generate marketing content from them, and score that content against each guideline (US20250117829). Designed the brand-compliance evaluation; the work became the product Adobe Brand Intelligence.",
          "Fine-tuned custom models on a Fortune 500 customer's own data, which led to a custom-models deal.",
          "Built a multimodal agent that edits images in Photoshop, selecting from 49 tools with vision grounding.",
        ],
      },
      {
        area: "Evaluation Research",
        bullets: [
          "DistortBench (first author; CVPR and ICML 2026 workshops): a benchmark of 13.5K questions over 27 distortion types and 5 severity levels. The best of 18 VLMs (Qwen3.5-27B, 61.9%) beats the average annotator (60.2%) but trails a 3-annotator majority vote (65.7%).",
          "JudgeBreak (ICML 2026 workshop): showed that linear probes on Qwen3-32B hidden states beat the best reward model or LLM judge across 95 subjective settings (78.1% vs. 70.1% pairwise accuracy).",
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
          "Joined Adobe's ML serving platform at inception and helped plan the end-to-end product, which hosts internal models such as field-aware factorization machines.",
          "Owned serving throughput: scaled the production ML prediction service to 3,500 QPS per node at 0.3–0.6 ms p99 latency (Adobe Tech Blog), with a garbage-collection-free asynchronous event pipeline on LMAX Disruptor that removed back-pressure under peak load.",
          "Built the model lifecycle platform for versioned deployment, monitoring, and staged rollout across environments.",
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
