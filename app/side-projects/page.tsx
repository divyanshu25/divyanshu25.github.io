import Link from "next/link";
import Image from "next/image";
import { sideProjects } from "@/data/sideProjects";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Side Projects | Divyanshu Goyal",
  description: "Apps I build as a hobby, mostly around on-device ML.",
};

export default function SideProjectsPage() {
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

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[var(--text)] mb-4">Side Projects</h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-10 sm:mb-16 max-w-2xl">
            I love building apps as a hobby, mostly around what ML can do on-device.
          </p>

          <div className="space-y-6">
            {sideProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  {project.logo && (
                    <Image
                      src={project.logo}
                      alt={`${project.title} logo`}
                      width={72}
                      height={72}
                      className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-2xl flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-display text-xl sm:text-2xl text-[var(--text)] leading-snug">
                        {project.title}
                      </h2>
                      <span className="font-mono text-xs text-[var(--text-tertiary)]">{project.platform}</span>
                    </div>
                    <p className="text-[var(--text)] mb-3">{project.tagline}</p>
                    <p className="text-[var(--text-secondary)] leading-relaxed mb-5 max-w-3xl">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                      {project.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
                        >
                          {link.label}
                          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      ))}
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 bg-[var(--bg-warm)] text-[var(--text-tertiary)] border border-[var(--border)] rounded-full text-[11px] font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
