import { profile } from "@/data/profile";

export default function Publications() {
  // Newest first. Stable sort preserves the data order within the same year.
  const items = [...profile.publications].sort(
    (a, b) => Number(b.year) - Number(a.year)
  );

  return (
    <section id="publications" className="relative py-6 bg-[var(--bg)] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1 tracking-tight">
            Publications & Patents
          </h2>
        </div>

        <div className="relative">
          {/* Timeline rail */}
          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[var(--border)]" aria-hidden />

          <div className="space-y-3">
            {items.map((pub, index) => (
              <div key={index} className="group/item relative pl-9 sm:pl-12">
                {/* Node */}
                <span
                  className="absolute left-[7px] top-6 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] transition-colors group-hover/item:bg-[var(--accent)]"
                  aria-hidden
                />

                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border)] hover:border-[var(--text-tertiary)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                        {pub.title}
                      </h3>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">{pub.authors}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-[var(--bg-warm)] text-[var(--text-tertiary)] rounded-full text-[11px] font-medium border border-[var(--border)]">
                        {pub.venue}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">{pub.year}</span>
                      <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
