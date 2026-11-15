'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { HeroFlame } from '../components/HeroFlame';
import { LunarGapChart } from '../components/LunarGapChart';
import { EvidenceFunnelChart } from '../components/EvidenceFunnelChart';
import { DEFAULT_INVESTIGATIONS } from '../lib/data';
import {
  TOTAL_INGESTED_TABLE_ROWS,
  ROWS_REPORTING_BOTH_O2_AND_P,
  CABIN_AIR_ROWS_WITH_BOTH,
  FLEX_CABIN_O2_GE_30_COUNT,
  CABIN_AIR_LUNAR_MATCH_COUNT,
  CFI_G_BURNER_TARGET_ROWS,
  FLAME_DESIGN_OXIDIZER_TARGET_ROWS,
  AUDITED_INVESTIGATION_FIELDS,
  VERIFIED_QUOTES_RATIO,
} from '@/lib/ui-constants';
import { ArrowRight, Compass, ShieldCheck, AlertTriangle, Layers, BookOpen } from 'lucide-react';

export default function HomePage() {
  const deepRecords = useMemo(
    () => DEFAULT_INVESTIGATIONS.filter((inv) => inv.depth === 'deep'),
    []
  );

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto">
      {/* 1. HERO HEADER SECTION */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
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
              Tracing flight evidence, flow regimes, and the empirical documentation gap for lunar habitat atmospheres.
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
            <Link
              href="/coverage"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <span>Explore Envelopes</span>
            </Link>
          </div>
        </div>

        {/* Unified Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Total Ingested Rows</span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {TOTAL_INGESTED_TABLE_ROWS.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">1,807 runs + 8 candidate sets</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Reporting Both O₂ & P</span>
            <span className="text-2xl font-bold text-sky-800 font-mono">
              {ROWS_REPORTING_BOTH_O2_AND_P}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">274 cabin + 366 burner/oxidizer</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Cabin O₂ ≥ 30% (FLEX)</span>
            <span className="text-2xl font-bold text-amber-700 font-mono">
              {FLEX_CABIN_O2_GE_30_COUNT}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">All sit at pressure ≥ 10.33 psi</span>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
            <span className="text-rose-700 block text-[11px] font-semibold mb-1">Lunar Habitat Atmosphere</span>
            <span className="text-2xl font-bold text-rose-950 font-mono">
              {CABIN_AIR_LUNAR_MATCH_COUNT}
            </span>
            <span className="text-[10px] text-rose-700 block mt-0.5 font-bold">O₂ ≥ 30% & P ≤ 10.2 psi</span>
          </div>
        </div>
      </section>

      {/* 2. THE LUNAR GAP & EVIDENCE FUNNEL (CORE VISUALIZATIONS) */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold font-mono tracking-tight text-slate-900">
            1. Core Empirical Findings & Coverage Envelopes
          </h2>
          <p className="text-xs text-slate-500">
            Interactive mapping of microgravity combustion records against target exploration atmospheres.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Graph 1: Coverage Envelopes */}
          <div className="lg:col-span-7">
            <LunarGapChart />
          </div>

          {/* Graph 2: Evidence Funnel */}
          <div className="lg:col-span-5">
            <EvidenceFunnelChart />
          </div>
        </div>
      </section>

      {/* 3. FLAME TRANSPORT SIMULATOR (MICROGRAVITY VS 1G) */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold font-mono tracking-tight text-slate-900">
            2. Combustion Transport Physics
          </h2>
          <p className="text-xs text-slate-500">
            Visualizing spherical diffusion in orbital microgravity versus buoyant convective plumes on Earth.
          </p>
        </div>
        <HeroFlame initialRegime="0g" initialO2={21} />
      </section>

      {/* 4. THE PARTIAL-GRAVITY DATA GAP AUDIT */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Critical Finding: The Partial-Gravity Data Gap
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200">
            SPEC Section 2 Rule 5 Certified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed font-sans">
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-xs">
                1. Zero Partial-Gravity Records in PSI
              </strong>
              <p>
                NASA Physical Sciences Informatics contains exactly <strong>0</strong> combustion datasets recorded in lunar (0.16g) or Martian (0.38g) gravity. No partial-gravity flame spread equations are supported by PSI data.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-xs">
                2. Physical Bounds, Never Extrapolations
              </strong>
              <p>
                Microgravity (0g) and Earth (1g) observations serve as bounding regimes. Intermediate gravity cannot be extrapolated linearly because flame chemistry, soot residence, and buoyant extinction shift unpredictably by material.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-xs">
                3. ACME E-FIELD Analog Isolation (Rule 5)
              </strong>
              <p>
                ACME E-FIELD (PSI-22) uses electric field ionic wind to mimic buoyancy forces. The interface presents it strictly as an <em>analog</em>, never as true partial-gravity data.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-xs">
                4. Burner Co-flow Stream Isolation (Rule 4)
              </strong>
              <p>
                CFI-G (20 rows at 7.35 psi with burner O₂ 35.85–39.26%) and Flame Design (18 rows with oxidizer O₂ 31.97–85%) test isolated burner fuel streams. They are never conflated with habitable cabin air.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEEP INVESTIGATIONS DIRECTORY */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-lg font-bold font-mono tracking-tight text-slate-900">
              3. Deep Priority Investigations
            </h2>
            <p className="text-xs text-slate-500">
              8 deep priority investigations with audited DOI provenance and row-level table extractions.
            </p>
          </div>
          <Link
            href="/data"
            className="text-xs font-mono text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center gap-1"
          >
            <span>View All 18 Investigations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deepRecords.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                    {inv.id}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {inv.fuel_phase?.value ?? 'Not reported'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 font-mono">{inv.acronym}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{inv.name}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>DOI: {inv.doi ? '✓ Verified' : 'Missing'}</span>
                <Link
                  href={`/data#${inv.id}`}
                  className="text-sky-700 hover:text-sky-900 font-medium"
                >
                  Inspect Rows →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PLATFORM NAVIGATION MATRIX */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
          Explore Scientific Tools & Verification Modules
        </h3>
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
              <span>Trust & Verification</span>
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
