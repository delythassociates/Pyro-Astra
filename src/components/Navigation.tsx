'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, ShieldCheck, BookOpen } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

interface NavGroup {
  name: string;
  items: { href: string; label: string; desc: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    name: 'Overview & Gap',
    items: [
      { href: '/', label: 'Executive Dashboard', desc: 'Overview, core findings, and lunar gap' },
      { href: '/coverage', label: 'Parameter Coverage', desc: 'Envelopes, missing fields & data boundaries' },
      { href: '/surprises', label: 'Surprises & Anomalies', desc: 'Counter-intuitive microgravity behaviors' },
    ],
  },
  {
    name: 'Explorer & Flow Regimes',
    items: [
      { href: '/rank', label: 'Material Flammability', desc: 'Flow velocity vs spread rates' },
      { href: '/compare', label: 'Dual-Source Comparison', desc: 'Metadata claims vs table-listed rows' },
      { href: '/readiness', label: 'Habitat Safety Readiness', desc: '20 spacecraft fire safety criteria' },
      { href: '/functions', label: 'Function Matrix', desc: 'Analytical combustion relationships' },
    ],
  },
  {
    name: 'Evidence Path & Models',
    items: [
      { href: '/path', label: 'Nearest-Evidence Path', desc: 'Vector distance to lunar atmosphere' },
      { href: '/proposals', label: 'Proposed Experiments', desc: 'Flight campaigns to close the gap' },
      { href: '/models', label: 'Surrogate Models', desc: 'Pre-registered CV & 3-tier domain gate' },
      { href: '/ask', label: 'Ask ASTRA', desc: 'Grounded query agent with verifier' },
    ],
  },
  {
    name: 'Data & Audit',
    items: [
      { href: '/data', label: 'Data Center', desc: '18 investigations & verbatim quotes' },
      { href: '/data-quality', label: 'Evidence Funnel', desc: 'Audit funnel & provenance matrix' },
      { href: '/trust', label: 'Trust & Verification', desc: 'Ledger, checksums & reproducibility' },
    ],
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { openGuide } = useDashboard();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine which group is active
  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm" ref={navRef}>
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 xl:px-10">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Scientific Platform Title */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-md bg-sky-50 border border-sky-300 flex items-center justify-center font-mono font-bold text-sky-700 group-hover:bg-sky-100 group-hover:border-sky-400 transition-colors">
              Ψ
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                PYRO-ASTRA
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">
                NASA PSI Combustion Audit
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Dropdowns */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_GROUPS.map((group) => {
              const active = isGroupActive(group);
              const isOpen = openDropdown === group.name;

              return (
                <div key={group.name} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : group.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <span>{group.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute left-0 mt-1.5 w-64 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {group.items.map((item) => {
                        const itemActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`block px-3.5 py-2 text-xs transition-colors ${
                              itemActive
                                ? 'bg-sky-50 text-sky-900 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="font-medium">{item.label}</div>
                            <div className="text-[11px] text-slate-500 font-normal leading-normal">{item.desc}</div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Provenance Status Indicator & User Guide Button */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PSI Provenance: Active</span>
            </div>

            <button
              type="button"
              onClick={() => openGuide('quickstart')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-mono font-bold transition-all shadow-xs"
              aria-label="Open User Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-700" />
              <span>📖 User Guide</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg max-h-[85vh] overflow-y-auto">
          <div className="p-2 border-b border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openGuide('quickstart');
              }}
              className="w-full py-2 px-3 rounded-lg bg-sky-50 text-sky-800 border border-sky-300 text-xs font-mono font-bold flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-sky-700" />
              <span>📖 Open User Guide</span>
            </button>
          </div>
          {NAV_GROUPS.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-2 pt-2">
                {group.name}
              </div>
              {group.items.map((item) => {
                const itemActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-xs transition-colors ${
                      itemActive
                        ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.desc}</div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

export default Navigation;
