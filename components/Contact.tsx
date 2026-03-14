import { profile } from "@/data/profile";

export default function Contact() {
  return (
    <section id="contact" className="py-14 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="bg-[#1a1008] rounded-2xl px-6 sm:px-8 py-6 sm:py-8 max-w-md">
          <p className="font-mono text-[11px] text-[var(--accent-light)] tracking-widest uppercase mb-4">04</p>
          <h2 className="text-xl font-bold text-white mb-5">
            Let&apos;s talk
          </h2>
          <div className="flex flex-col gap-4">
            <a
              href={`mailto:${profile.social.email}`}
              className="inline-flex items-center gap-2.5 text-white/80 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4 text-[var(--accent-light)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm underline underline-offset-4 decoration-white/20 group-hover:decoration-white/60 transition-all">
                {profile.social.email}
              </span>
            </a>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-white/80 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4 text-[var(--accent-light)] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm underline underline-offset-4 decoration-white/20 group-hover:decoration-white/60 transition-all">
                LinkedIn
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
