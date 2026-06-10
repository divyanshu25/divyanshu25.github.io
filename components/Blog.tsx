import Link from "next/link";
import { posts } from "@/data/posts";

export default function Blog() {
  // Newest first.
  const items = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section id="blog" className="relative py-6 bg-[var(--bg)] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1 tracking-tight">
            Writing
          </h2>
        </div>

        <div className="relative">
          {/* Timeline rail */}
          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[var(--border)]" aria-hidden />

          <div className="space-y-3">
            {items.map((post) => (
              <div key={post.id} className="group/item relative pl-9 sm:pl-12">
                {/* Node */}
                <span
                  className="absolute left-[7px] top-6 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] transition-colors group-hover/item:bg-[var(--accent)]"
                  aria-hidden
                />

                <Link
                  href={post.url || `/blog/${post.id}`}
                  target={post.url ? "_blank" : undefined}
                  rel={post.url ? "noopener noreferrer" : undefined}
                  className="group block bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border)] hover:border-[var(--text-tertiary)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                        {post.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap font-mono">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
