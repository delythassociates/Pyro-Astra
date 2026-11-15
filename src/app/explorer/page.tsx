'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/context/DashboardContext';
import { InteractiveChartWorkspace } from '@/components/InteractiveChartWorkspace';
import { HoverTitleExplanation } from '@/components/HoverTitleExplanation';
import { ReferencesCard } from '@/components/ReferencesCard';
import { AdvancedParameterWorkbench } from '@/components/AdvancedParameterWorkbench';
import { ArrowRight, Flame, Compass, Cpu, FileSpreadsheet } from 'lucide-react';

export default function ExplorerPage() {
  const { dashboardMode } = useDashboard();

  return (
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] py-8 px-4 sm:px-6 xl:px-10">
      <div className="w-full max-w-[1840px] mx-auto space-y-8">
        {/* Page Header with HoverTitleExplanation (Zero Static Subtitles) */}
        <div className="border-b border-[#D5CFC2] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#1D4ED8] uppercase tracking-wider font-semibold">
              <span>Multi-Variable Spaceflight Flight Data Explorer · 80/20 Zoomable Canvas</span>
              <span className="text-[#A8A296]">|</span>
              <span className="font-bold text-[#181615]">
                {dashboardMode === 'beginner' ? 'BEGINNER GUIDED WORKFLOW' : 'ADVANCED PARAMETRIC WORKBENCH'}
              </span>
            </div>
            <div>
              <HoverTitleExplanation
                title="Interactive Experimental Charts & Explorer"
                summary="Pan, wheel-zoom, and rubber-band box zoom across 1,815 authentic NASA PSI combustion runs. Dynamically inspect empirical outcomes, separate cabin air from burner streams, and audit SHA-256 and DOI provenance."
                badge="1,815 Runs"
              />
            </div>
          </div>

          <div className="text-right text-xs font-mono text-[#5A544A] shrink-0">
            <span className="block font-bold text-[#181615]">18 Investigations Audited</span>
            <span className="text-[11px] text-[#736B5E]">Strict Rule 2 Provenance Enforced</span>
          </div>
        </div>

        {/* BEGINNER MODE: Guided Presets & Inputs Bar */}
        {dashboardMode === 'beginner' && (
          <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
            <div className="border-b border-[#D5CFC2] pb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#181615] uppercase tracking-wider">
                Beginner Guided Presets &amp; Targets
              </span>
              <span className="text-[11px] font-mono text-[#5A544A]">
                2 Inputs: Environment Preset &amp; Material Filter
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#F4F1EA] border border-[#D5CFC2] space-y-1">
                <span className="text-[10px] text-[#C2410C] font-bold uppercase block">
                  Lunar Habitat Target (Gap)
                </span>
                <div className="font-bold text-sm text-[#181615]">34% O₂ · 8.2 psi</div>
                <p className="text-[11px] text-[#5A544A] font-sans">
                  Planned crew habitat standard (NASA NTRS-20210022143). 0 matching rows in archives.
                </p>
              </div>

              <div className="p-3 bg-[#F4F1EA] border border-[#D5CFC2] space-y-1">
                <span className="text-[10px] text-[#1D4ED8] font-bold uppercase block">
                  ISS Nominal Baseline
                </span>
                <div className="font-bold text-sm text-[#181615]">21% O₂ · 14.7 psi</div>
                <p className="text-[11px] text-[#5A544A] font-sans">
                  Standard sea-level air norm in microgravity (BASS, BASS-II, SAME).
                </p>
              </div>

              <div className="p-3 bg-[#F4F1EA] border border-[#D5CFC2] space-y-1">
                <span className="text-[10px] text-[#15803D] font-bold uppercase block">
                  Spacesuit EVA Standard
                </span>
                <div className="font-bold text-sm text-[#181615]">100% O₂ · 4.3 psi</div>
                <p className="text-[11px] text-[#5A544A] font-sans">
                  Pure oxygen extravehicular mobility unit atmosphere.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED MODE: Granular Parameter Workbench */}
        {dashboardMode === 'advanced' && (
          <div className="space-y-6">
            <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex items-center justify-between border-b border-[#D5CFC2] pb-2 text-xs font-mono">
                <span className="font-bold text-[#181615] uppercase tracking-wider">
                  Advanced Parametric Workbench (Continuous Sliders &amp; Search Radius)
                </span>
                <span className="text-[#1D4ED8] font-bold">SPEC Section 6 &amp; 8</span>
              </div>
              <AdvancedParameterWorkbench />
            </div>

            {/* Advanced Quick-Jump Module Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <Link
                href="/physics"
                className="p-3 bg-[#FAF8F3] hover:bg-[#EAE5DB] border border-[#D5CFC2] flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-[#181615] block">3D Flame Simulator</span>
                  <span className="text-[10px] text-[#5A544A]">WebGL 0g vs 1g Airflow</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/path"
                className="p-3 bg-[#FAF8F3] hover:bg-[#EAE5DB] border border-[#D5CFC2] flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-[#181615] block">Gap Finder Matrix</span>
                  <span className="text-[10px] text-[#5A544A]">Documentation Distance</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/proposals"
                className="p-3 bg-[#FAF8F3] hover:bg-[#EAE5DB] border border-[#D5CFC2] flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-[#181615] block">12-Run Flight Matrix</span>
                  <span className="text-[10px] text-[#5A544A]">Sampling Protocol</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/models"
                className="p-3 bg-[#FAF8F3] hover:bg-[#EAE5DB] border border-[#D5CFC2] flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-[#181615] block">Surrogate Safety Gate</span>
                  <span className="text-[10px] text-[#5A544A]">Convex Hull Refusals</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}

        {/* 80/20 Chart & Synced Data Table (Rendered in Both Modes) */}
        <Suspense
          fallback={
            <div className="p-12 text-center font-mono text-xs text-[#5A544A] bg-[#FAF8F3] border border-[#D5CFC2]">
              <span className="animate-spin text-lg mr-2 inline-block">◌</span>
              Initializing Interactive Chart Workspace...
            </div>
          }
        >
          <InteractiveChartWorkspace />
        </Suspense>

        {/* Bottom References & Lineage Card */}
        <ReferencesCard />
      </div>
    </div>
  );
}
