"use client";

import { profile } from "@/data/profile";
import Image from "next/image";
import { useEffect, useState } from "react";
import ResumeDownload from "./ResumeDownload";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-[var(--bg)] overflow-hidden pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
          {/* Profile image */}
          <div className={`shrink-0 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full overflow-hidden ring-2 ring-[var(--border)]">
              <Image
                src="/profile.jpg"
                alt="Divyanshu Goyal"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Content next to photo */}
          <div className="text-center lg:text-left">
            <div className={`mb-4 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight mb-1">
                Divyanshu Goyal
              </h1>
              <p className="text-sm font-mono text-[var(--accent)]">
                {profile.title}
              </p>
            </div>

            {/* Bio */}
            <p className={`text-base text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.15s' }}>
              Applied Scientist at Adobe specializing in cutting-edge machine learning solutions. I hold an M.S. in Computer Science from Georgia Tech with a focus on Machine Learning. Passionate about training Large Language Models and Vision-Language Models, I thrive on solving real-world challenges that drive meaningful impact.
            </p>

            {/* Actions */}
            <div className={`flex items-center justify-center lg:justify-start gap-4 mb-5 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <ResumeDownload />
            </div>

            {/* Social icons */}
            <div className={`flex items-center justify-center lg:justify-start gap-3 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.25s' }}>
              <a
                href={`mailto:${profile.social.email}`}
                className="text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a
                href={profile.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={profile.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href={profile.social.scholar}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
                aria-label="Google Scholar"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
