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
        ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
        : 'bg-white/70 backdrop-blur-md border-b border-gray-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">DG</span>
              </div>
              <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors hidden sm:block">
                Divyanshu Goyal
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/#about" 
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              About
            </Link>
            <Link 
              href="/#projects" 
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              Projects
            </Link>
            <Link 
              href="/#publications" 
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              Publications
            </Link>
            <Link 
              href="/#contact" 
              className="ml-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-300/30 hover:scale-105"
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
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
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
          <div className="px-6 pt-2 pb-6 space-y-2">
            <Link
              href="/#about"
              className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/#projects"
              className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all font-medium"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/#publications"
              className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all font-medium"
              onClick={() => setIsOpen(false)}
            >
              Publications
            </Link>
            <Link
              href="/#contact"
              className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition-all font-bold text-center shadow-lg"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
