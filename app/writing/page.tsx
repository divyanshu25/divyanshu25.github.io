import Link from "next/link";
import { posts } from "@/data/posts";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function WritingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navigation />
      <main className="flex-grow pt-20 sm:pt-28 pb-12 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center text-[var(--accent)] hover:text-[var(--accent-light)] mb-10 group text-sm font-medium">
            <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[var(--text)] mb-4">Writing</h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-10 sm:mb-16 max-w-2xl">
            Long-form notes on scaling transformers, training optimizations, and building high-performance ML systems.
          </p>

          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={post.url || `/blog/${post.id}`}
                target={post.url ? "_blank" : undefined}
                rel={post.url ? "noopener noreferrer" : undefined}
                className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 sm:p-8 card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xs text-[var(--text-tertiary)]">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-[var(--text-tertiary)]">&middot;</span>
                  <span className="font-mono text-xs text-[var(--text-tertiary)]">
                    {Math.ceil(post.content.split(/\s+/).length / 200)} min read
                  </span>
                </div>

                <h2 className="font-display text-xl sm:text-2xl text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-3">
                  {post.title}
                </h2>

                <p className="text-[var(--text-secondary)] leading-relaxed mb-4 max-w-3xl">
                  {post.summary}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-[var(--bg-warm)] text-[var(--text-tertiary)] border border-[var(--border)] rounded-full text-[11px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
