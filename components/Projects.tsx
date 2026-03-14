import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section id="projects" className="relative py-6 bg-[var(--bg)] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1 tracking-tight">
            Projects
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <div key={index} className="group relative bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border)] hover:border-[var(--text-tertiary)] transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-[var(--text-tertiary)]">
                  {new Date(project.date).getFullYear()}
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--text)] mb-2 leading-tight group-hover:text-[var(--accent)] transition-colors">
                {project.title}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed line-clamp-3">
                {project.summary}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--text)] text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <span>View</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[var(--bg-warm)] text-[var(--text-tertiary)] rounded-full text-[11px] font-medium border border-[var(--border)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
