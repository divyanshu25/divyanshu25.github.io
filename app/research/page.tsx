import Link from "next/link";
import { profile } from "@/data/profile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ResearchPage() {
  const papers = profile.publications.filter((p) => !p.venue.includes("Patent"));
  const patents = profile.publications.filter((p) => p.venue.includes("Patent"));

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navigation />
      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <Link href="/" className="inline-flex items-center text-[var(--accent)] hover:text-[var(--accent-light)] mb-10 group text-sm font-medium">
            <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>

          <h1 className="font-display text-4xl sm:text-5xl text-[var(--text)] mb-4">Research & Patents</h1>
          <p className="text-[var(--text-secondary)] text-lg mb-16 max-w-2xl">
            1 peer-reviewed publication and 4 US patent applications — spanning creative AI, VLMs, cultural adaptation, and machine translation.
          </p>

          {/* Papers */}
          {papers.length > 0 && (
            <div className="mb-16">
              <p className="font-mono text-xs tracking-widest text-[var(--accent)] uppercase mb-6">Papers</p>
              <div className="space-y-4">
                {papers.map((pub, i) => (
                  <a
                    key={i}
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 card-hover"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      <span className="font-mono text-[11px] text-[var(--text-tertiary)]">{pub.venue} &middot; {pub.year}</span>
                    </div>
                    <h3 className="font-display text-xl text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-2 leading-snug">
                      {pub.title}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] mb-3">{pub.authors}</p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{pub.abstract}</p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {pub.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full text-[11px] font-medium">{tag}</span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Patents */}
          {patents.length > 0 && (
            <div>
              <p className="font-mono text-xs tracking-widest text-[var(--accent)] uppercase mb-6">Patents</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patents.map((pub, i) => (
                  <a
                    key={i}
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 card-hover"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      <span className="font-mono text-[11px] text-[var(--text-tertiary)]">US Patent &middot; {pub.year}</span>
                    </div>
                    <h3 className="text-base font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-2">
                      {pub.title}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">{pub.authors}</p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">{pub.abstract}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
