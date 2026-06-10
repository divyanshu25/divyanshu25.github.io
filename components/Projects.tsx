import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section id="projects" className="relative py-6 bg-[var(--bg)] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-4 sm:mb-6">
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

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-warm)] text-[var(--text)] rounded-lg text-xs font-medium border border-[var(--border)] hover:border-[var(--text-tertiary)] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.218.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>Code</span>
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
