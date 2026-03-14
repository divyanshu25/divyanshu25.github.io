"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[var(--bg)]/90 backdrop-blur-xl shadow-sm border-b border-[var(--border)]'
        : 'bg-[var(--bg)]/70 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <span className="text-lg font-bold text-[var(--text)] tracking-tight">
                DG
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/#experience"
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              Experience
            </Link>
            <Link
              href="/#projects"
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/#publications"
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              Research
            </Link>
            <Link
              href="/#blog"
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              Writing
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[var(--bg)]/95 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="px-6 pt-2 pb-4 space-y-1">
            <Link
              href="/#experience"
              className="block px-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Experience
            </Link>
            <Link
              href="/#projects"
              className="block px-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/#publications"
              className="block px-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Research
            </Link>
            <Link
              href="/#blog"
              className="block px-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Writing
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
