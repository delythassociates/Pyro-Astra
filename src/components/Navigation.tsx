'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/functions', label: 'Functions' },
    { href: '/readiness', label: 'Readiness' },
    { href: '/proposals', label: 'Proposals' },
    { href: '/surprises', label: 'Surprises' },
    { href: '/rank', label: 'Rank' },
    { href: '/coverage', label: 'Coverage' },
    { href: '/compare', label: 'Compare' },
    { href: '/models', label: 'Models' },
    { href: '/ask', label: 'Ask ASTRA' },
    { href: '/data-quality', label: 'Quality' },
    { href: '/trust', label: 'Trust' },
    { href: '/data', label: 'Data Center' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 py-2 items-center justify-between gap-2">
          {/* Logo & Platform Name (Text only, no NASA logos) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center font-mono font-black text-cyan-400 group-hover:border-cyan-400 transition-colors">
                Ψ
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-base font-black tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                  PYRO-ASTRA
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400/80">
                  NASA PSI Fire Safety Intel
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-wrap items-center justify-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Status & Credits Indicator */}
          <div className="hidden 2xl:flex items-center gap-3 shrink-0">
            <div className="px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PSI Provenance: Active</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-cyan-900/40 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-mono ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-700/60'
                    : 'text-zinc-300 hover:bg-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

export default Navigation;
