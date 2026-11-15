'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, MoreVertical, X } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

interface ModuleItem {
  id: string;
  href: string;
  code: string;
  title: string;
  subtitle: string;
}

const MODULE_ITEMS: ModuleItem[] = [
  {
    id: 'home',
    href: '/',
    code: '01',
    title: 'Ask ASTRA (AI Home)',
    subtitle: 'Conversational spaceflight safety intelligence',
  },
  {
    id: 'explorer',
    href: '/explorer',
    code: '02',
    title: 'Interactive Charts & Material Explorer',
    subtitle: '80/20 coordinate canvas and 1,815 flight runs',
  },
  {
    id: 'physics',
    href: '/physics',
    code: '03',
    title: '3D Combustion & Airflow Physics',
    subtitle: 'Three.js 0g vs 1g simulation and ventilation regimes',
  },
  {
    id: 'path',
    href: '/path',
    code: '04',
    title: 'Mission Atmosphere Gap Finder',
    subtitle: 'Lunar exploration transit documentation distance',
  },
  {
    id: 'proposals',
    href: '/proposals',
    code: '05',
    title: 'Recommended 12-Run Flight Matrix',
    subtitle: 'Target candidate flight experiments for lunar gap',
  },
  {
    id: 'models',
    href: '/models',
    code: '06',
    title: 'AI Surrogate 3-Tier Safety Gate',
    subtitle: 'Convex hull gating and droplet extinction limits',
  },
  {
    id: 'trust',
    href: '/trust',
    code: '07',
    title: 'Trust, Provenance & Data Ledger',
    subtitle: '100% NASA DOI and SHA-256 provenance ledger',
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dashboardMode, setDashboardMode, openGuide } = useDashboard();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#EAE5DB] border-b border-[#D5CFC2] h-16 shadow-2xs">
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 xl:px-10 h-full">
        <div className="flex h-full items-center justify-between gap-4">
          {/* LEFT: Brand Title & 3-Dot Dropdown Menu Button */}
          <div className="flex items-center gap-4 shrink-0" ref={dropdownRef}>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-[#FAF8F3] border border-[#D5CFC2] flex items-center justify-center font-mono font-bold text-[#1D4ED8] group-hover:border-[#1D4ED8] transition-colors text-sm shadow-2xs">
                PSI
              </div>
              <span className="font-mono text-base font-black tracking-tight text-[#181615] group-hover:text-[#1D4ED8] transition-colors leading-none">
                PYRO-ASTRA
              </span>
            </Link>

            {/* 3-Dot Dropdown Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border transition-colors ${
                  dropdownOpen
                    ? 'bg-[#181615] text-[#FAF8F3] border-[#181615]'
                    : 'bg-[#FAF8F3] hover:bg-[#D5CFC2]/40 text-[#181615] border-[#D5CFC2]'
                }`}
                aria-expanded={dropdownOpen}
                aria-label="Toggle Navigation Modules Menu"
              >
                <MoreVertical className="w-3.5 h-3.5" />
                <span>MODULES</span>
              </button>

              {/* 3-Dot Dropdown Menu Panel */}
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-84 bg-[#FAF8F3] border-2 border-[#181615] shadow-2xl z-50 divide-y divide-[#D5CFC2] text-xs font-mono">
                  <div className="p-3 bg-[#EAE5DB] flex items-center justify-between">
                    <span className="font-bold text-[#181615] uppercase tracking-wider text-[11px]">
                      Navigation Modules
                    </span>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(false)}
                      className="text-[#5A544A] hover:text-[#181615]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="py-1">
                    {MODULE_ITEMS.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href === '/explorer' && pathname === '/coverage');

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`p-3 block transition-colors ${
                            isActive
                              ? 'bg-[#181615] text-[#FAF8F3]'
                              : 'hover:bg-[#EAE5DB] text-[#181615]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-[11px] ${
                                isActive ? 'text-[#93C5FD]' : 'text-[#1D4ED8]'
                              }`}
                            >
                              {item.code}
                            </span>
                            <span className="font-bold">{item.title}</span>
                          </div>
                          <p
                            className={`text-[10px] mt-0.5 font-sans line-clamp-1 ${
                              isActive ? 'text-[#D5CFC2]' : 'text-[#5A544A]'
                            }`}
                          >
                            {item.subtitle}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Persistent Beginner vs Advanced Mode Toggle (Text-Only, No Emojis) */}
          <div className="flex items-center">
            <div className="inline-flex p-1 bg-[#FAF8F3] border border-[#D5CFC2] shadow-2xs font-mono text-xs">
              <button
                type="button"
                onClick={() => setDashboardMode('beginner')}
                className={`px-3 py-1 text-xs transition-all ${
                  dashboardMode === 'beginner'
                    ? 'bg-[#181615] text-[#FAF8F3] font-bold shadow-xs'
                    : 'bg-[#FAF8F3] text-[#5A544A] hover:text-[#181615] hover:bg-[#D5CFC2]/40 font-medium'
                }`}
                aria-pressed={dashboardMode === 'beginner'}
              >
                BEGINNER MODE
              </button>
              <button
                type="button"
                onClick={() => setDashboardMode('advanced')}
                className={`px-3 py-1 text-xs transition-all ${
                  dashboardMode === 'advanced'
                    ? 'bg-[#181615] text-[#FAF8F3] font-bold shadow-xs'
                    : 'bg-[#FAF8F3] text-[#5A544A] hover:text-[#181615] hover:bg-[#D5CFC2]/40 font-medium'
                }`}
                aria-pressed={dashboardMode === 'advanced'}
              >
                ADVANCED MODE
              </button>
            </div>
          </div>

          {/* RIGHT: Status Badge & User Guide Trigger (Strictly Text-Only) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F3] border border-[#D5CFC2] text-[10px] font-mono text-[#15803D] font-bold shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-[#15803D]" />
              <span>PSI PROVENANCE: ACTIVE</span>
            </div>

            <button
              type="button"
              onClick={() => openGuide('quickstart')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F3] hover:bg-white text-[#181615] border border-[#D5CFC2] text-xs font-mono font-bold transition-all shadow-2xs"
              aria-label="Open User Guide"
            >
              <span>USER GUIDE</span>
              <span className="text-[10px] text-[#5A544A]">[?]</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
