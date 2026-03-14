import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" className="relative py-14 bg-[var(--bg)] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-1 tracking-tight">
            About Me
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Education */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Education</h3>
            <div className="space-y-3">
              {profile.education.map((edu, index) => (
                <div key={index} className={index > 0 ? "pt-3 border-t border-[var(--border)]" : ""}>
                  <p className="font-medium text-[var(--text)] text-sm leading-tight">{edu.degree}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{edu.institution}</p>
                  {edu.specialization && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{edu.specialization}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Expertise</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.expertise.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-1 bg-[var(--accent-bg)] text-[var(--accent)] rounded-full text-xs font-medium border border-[var(--accent-border)]"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Tools & Languages */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Tools & Languages</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 bg-[var(--bg-warm)] text-[var(--text-secondary)] rounded-full text-xs font-medium border border-[var(--border)]"
                >
                  {tool}
                </span>
              ))}
              {profile.skills.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-1 bg-[var(--bg-warm)] text-[var(--text-secondary)] rounded-full text-xs font-medium border border-[var(--border)]"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
