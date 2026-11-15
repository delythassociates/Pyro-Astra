'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldCheck, BookOpen, Sparkles, BarChart2, Flame, Compass, Cpu, Database } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: '✦ Ask ASTRA (Home)' },
  { href: '/explorer', label: '📊 Interactive Charts & Explorer' },
  { href: '/physics', label: '🔥 3D Flame & Flow Physics' },
  { href: '/path', label: '🧭 Evidence Gap & Flight Matrix' },
  { href: '/models', label: '🧮 AI Surrogate Gate' },
  { href: '/trust', label: '🛡️ Trust & Data Ledger' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openGuide } = useDashboard();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#EAE5DB] border-b border-[#D5CFC2] h-16 shadow-2xs">
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 xl:px-10 h-full">
        <div className="flex h-full items-center justify-between gap-4">
          {/* Logo & Platform Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 bg-[#FAF8F3] border border-[#D5CFC2] flex items-center justify-center font-mono font-bold text-[#1D4ED8] group-hover:border-[#1D4ED8] transition-colors text-base shadow-2xs">
              Ψ
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold tracking-tight text-[#181615] group-hover:text-[#1D4ED8] transition-colors leading-none">
                PYRO-ASTRA
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#5C5549] mt-1">
                NASA PSI Combustion Audit
              </span>
            </div>
          </Link>

          {/* Desktop Single-Row Navigation Bar */}
          <nav className="hidden xl:flex items-center h-full gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href === '/explorer' && pathname === '/coverage');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-full flex items-center px-3.5 text-xs font-mono transition-all border-b-2 whitespace-nowrap ${
                    active
                      ? 'border-[#1D4ED8] text-[#181615] font-bold bg-[#FAF8F3]/50'
                      : 'border-transparent text-[#4A453E] hover:text-[#181615] hover:bg-[#FAF8F3]/30 font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Medium Desktop (lg to xl) Nav */}
          <nav className="hidden lg:flex xl:hidden items-center h-full gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href === '/explorer' && pathname === '/coverage');
              const shortLabel = item.label.split(' ')[1] || item.label;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-full flex items-center px-2.5 text-xs font-mono transition-all border-b-2 whitespace-nowrap ${
                    active
                      ? 'border-[#1D4ED8] text-[#181615] font-bold bg-[#FAF8F3]/50'
                      : 'border-transparent text-[#4A453E] hover:text-[#181615] hover:bg-[#FAF8F3]/30 font-medium'
                  }`}
                >
                  <span>{shortLabel}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right-Side Utilities */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="px-3 py-1 bg-[#FAF8F3] border border-[#D5CFC2] text-[11px] font-mono text-[#15803D] font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              <span>PSI Provenance: Active</span>
            </div>

            <button
              type="button"
              onClick={() => openGuide('quickstart')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F3] hover:bg-white text-[#181615] border border-[#D5CFC2] text-xs font-mono font-bold transition-all shadow-2xs"
              aria-label="Open User Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>📖 User Guide</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => openGuide('quickstart')}
              className="p-2 text-[#181615] bg-[#FAF8F3] border border-[#D5CFC2]"
              aria-label="Open User Guide"
            >
              <BookOpen className="w-4 h-4 text-[#1D4ED8]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#181615] bg-[#FAF8F3] border border-[#D5CFC2] focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-16 bg-[#EAE5DB] border-b border-[#D5CFC2] p-4 shadow-lg z-50 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-xs font-mono font-semibold transition-colors border-l-2 ${
                    active
                      ? 'border-[#1D4ED8] bg-[#FAF8F3] text-[#181615]'
                      : 'border-transparent text-[#4A453E] hover:bg-[#FAF8F3]/60 hover:text-[#181615]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
