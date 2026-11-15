'use client';

import React, { Suspense } from 'react';
import { InteractiveChartWorkspace } from '@/components/InteractiveChartWorkspace';
import { BarChart3, Sparkles } from 'lucide-react';

export default function ExplorerPage() {
  return (
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] py-8 px-4 sm:px-6 xl:px-10">
      <div className="w-full max-w-[1840px] mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-[#D5CFC2] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#1D4ED8] uppercase tracking-wider font-semibold">
              <BarChart3 className="w-4 h-4" />
              <span>Multi-Variable Spaceflight Flight Data Explorer · 80/20 Zoomable Canvas</span>
            </div>
            <h1 className="text-3xl font-black font-mono tracking-tight text-[#181615]">
              Interactive Experimental Charts &amp; Explorer
            </h1>
            <p className="text-sm text-[#5A544A] max-w-3xl leading-relaxed font-sans">
              Pan, wheel-zoom, and rubber-band box zoom across 1,815 authentic NASA PSI combustion runs. Dynamically inspect empirical outcomes, separate cabin air from burner streams, and audit SHA-256 and DOI provenance.
            </p>
          </div>

          <div className="text-right text-xs font-mono text-[#5A544A] shrink-0">
            <span className="block font-bold text-[#181615]">18 Investigations Audited</span>
            <span className="text-[11px] text-[#736B5E]">Strict Rule 2 Provenance Enforced</span>
          </div>
        </div>

        {/* 80/20 Chart Workspace wrapped in Suspense */}
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
      </div>
    </div>
  );
}
