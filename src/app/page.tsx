'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboard } from '../context/DashboardContext';
import { BeginnerModeView } from '../components/BeginnerModeView';
import { AdvancedModeView } from '../components/AdvancedModeView';
import { HeroFlame } from '../components/HeroFlame';
import { InfoButton } from '../components/InfoButton';
import {
  TOTAL_INGESTED_TABLE_ROWS,
  ROWS_REPORTING_BOTH_O2_AND_P,
  FLEX_CABIN_O2_GE_30_COUNT,
  CABIN_AIR_LUNAR_MATCH_COUNT,
} from '@/lib/ui-constants';
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  Layers,
  BookOpen,
  Flame,
  HelpCircle,
} from 'lucide-react';

export default function HomePage() {
  const { dashboardMode, setDashboardMode, openGuide } = useDashboard();

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto">
      {/* 1. HERO HEADER SECTION */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
              <span>NASA Physical Sciences Informatics (PSI) Challenge · Flame in Freefall</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 font-mono">
              PYRO-ASTRA
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Daylight-first scientific audit of the NASA Physical Sciences Informatics combustion record.
              Auditing empirical evidence, flow regimes, and the documentation gap for lunar habitat atmospheres.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <Link
              href="/ask"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 text-white font-mono text-xs font-bold hover:bg-sky-800 transition-colors shadow-xs"
            >
              <span>Ask ASTRA Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => openGuide('quickstart')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Open User Guide</span>
            </button>
          </div>
        </div>

        {/* Unified Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
              <span>Total Ingested Rows</span>
              <InfoButton tab="data-pipeline" tooltip="Click to view data ingestion pipeline in User Guide" />
            </div>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {TOTAL_INGESTED_TABLE_ROWS.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">1,807 runs + 8 candidate sets</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
              <span>Reporting Both O₂ &amp; P</span>
              <InfoButton tab="oxygen-isolation" tooltip="Cabin air vs burner stream separation" />
            </div>
            <span className="text-2xl font-bold text-sky-800 font-mono">
              {ROWS_REPORTING_BOTH_O2_AND_P}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">274 cabin + 366 burner/oxidizer</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
              <span>Cabin O₂ ≥ 30% (FLEX)</span>
              <InfoButton tab="oxygen-isolation" tooltip="FLEX cabin runs detail" />
            </div>
            <span className="text-2xl font-bold text-amber-700 font-mono">
              {FLEX_CABIN_O2_GE_30_COUNT}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">All sit at pressure ≥ 10.33 psi</span>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
            <div className="flex items-center justify-between text-rose-700 text-[11px] font-semibold mb-1">
              <span>Lunar Habitat Atmosphere</span>
              <InfoButton tab="surrogate-models" tooltip="Rule 5 Partial-gravity gap" />
            </div>
            <span className="text-2xl font-bold text-rose-950 font-mono">
              {CABIN_AIR_LUNAR_MATCH_COUNT}
            </span>
            <span className="text-[10px] text-rose-700 block mt-0.5 font-bold">O₂ ≥ 30% &amp; P ≤ 10.2 psi</span>
          </div>
        </div>
      </section>

      {/* 2. GLOBAL WORKFLOW MODE SWITCHER */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Workflow Mode:
          </span>
          <InfoButton tab="quickstart" tooltip="Learn about Beginner vs Advanced modes" />
        </div>

        <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 inline-flex items-center gap-1.5 shadow-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setDashboardMode('beginner')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              dashboardMode === 'beginner'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Beginner Mode (Presets &amp; Material Explorer)</span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardMode('advanced')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              dashboardMode === 'advanced'
                ? 'bg-white text-sky-800 shadow-sm border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>Advanced Mode (Sliders, Regimes &amp; Closeness)</span>
          </button>
        </div>
      </section>

      {/* 3. DUAL-MODE VIEWPORT */}
      <section className="transition-all duration-200">
        {dashboardMode === 'beginner' ? <BeginnerModeView /> : <AdvancedModeView />}
      </section>

      {/* 4. FLAME TRANSPORT SIMULATOR (MICROGRAVITY VS 1G) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold font-mono tracking-tight text-slate-900">
                Combustion Transport Physics Preview
              </h2>
              <p className="text-xs text-slate-500">
                Visualizing spherical diffusion in orbital microgravity (0g) versus buoyant convective plumes on Earth (1g).
              </p>
            </div>
          </div>
          <InfoButton tab="flow-regimes" tooltip="Read about transport regimes in User Guide" />
        </div>
        <HeroFlame initialRegime="0g" initialO2={21} />
      </section>

      {/* 5. SCIENTIFIC PLATFORM NAVIGATION MATRIX */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
            Explore Scientific Modules &amp; Verification
          </h3>
          <Link
            href="/guide"
            className="text-xs font-mono text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center gap-1"
          >
            <span>Full Documentation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <Link
            href="/coverage"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-sky-800 mb-1 flex items-center justify-between">
              <span>Coverage Matrix</span>
              <Compass className="w-4 h-4 text-slate-400 group-hover:text-sky-700" />
            </div>
            <p className="text-slate-500 font-sans text-[11px]">
              Explore O₂, pressure, and airflow envelopes across fuel phases.
            </p>
          </Link>

          <Link
            href="/rank"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-sky-800 mb-1 flex items-center justify-between">
              <span>Material Flammability</span>
              <Layers className="w-4 h-4 text-slate-400 group-hover:text-sky-700" />
            </div>
            <p className="text-slate-500 font-sans text-[11px]">
              BASS-II flow speed vs. spread rates and material flammability ranks.
            </p>
          </Link>

          <Link
            href="/models"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-sky-800 mb-1 flex items-center justify-between">
              <span>Surrogate Models</span>
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-sky-700" />
            </div>
            <p className="text-slate-500 font-sans text-[11px]">
              Pre-registered CV evaluation and interactive 3-tier domain gate.
            </p>
          </Link>

          <Link
            href="/trust"
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-sky-800 mb-1 flex items-center justify-between">
              <span>Trust &amp; Verification</span>
              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-sky-700" />
            </div>
            <p className="text-slate-500 font-sans text-[11px]">
              Automated audit ledger, SHA-256 manifests, and 130-probe benchmark.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
