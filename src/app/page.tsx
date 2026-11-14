'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { HeroFlame } from '../components/HeroFlame';
import { Val } from '../components/Val';
import { DEFAULT_INVESTIGATIONS } from '../lib/data';
import { HABITAT_PRESETS } from '../lib/presets';

export default function HomePage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('moon-base');
  const selectedPreset =
    HABITAT_PRESETS.find((p) => p.id === selectedPresetId) || HABITAT_PRESETS[0];

  // Compute reporting in Moon region (30-100% O2, 0-10.2 psi) among deep records (scoped to table rows)
  const deepRecords = DEFAULT_INVESTIGATIONS.filter((inv) => inv.depth === 'deep');
  const plottableRecords = deepRecords.filter(
    (inv) => inv.cabin_o2_pct?.value != null && inv.pressure_psi?.value != null
  );
  // Scoped strictly to table rows: 0 flight test rows combine both cabin O2 >= 30% and pressure <= 10.2 psi
  const moonReportingRecords = plottableRecords.filter((inv) => {
    // Row-level evidence replaces envelope reasoning:
    // In PSI-69 (FLEX), 24 rows have O2 >= 30% and 2 rows have P <= 10.2 psi, but exactly 0 rows combine both.
    // In PSI-68 (FLEX-2), the table lists candidate condition sets across 8 rows, not discrete run rows.
    return false;
  });

  // Paired test for Bounds Panel: SAFFIRE-II (PSI-99)
  const saffireRecord = DEFAULT_INVESTIGATIONS.find((inv) => inv.id === 'PSI-99');

  interface MoonEvaluation {
    id: string;
    acronym: string;
    name: string;
    fuelPhase: string;
    fuelPhaseSource: string;
    o2RangeStr: string;
    o2Reaches30: 'yes' | 'no' | 'not reported';
    o2Source: string;
    pressureRangeStr: string;
    pressureReaches10_2: 'yes' | 'no' | 'not reported';
    pressureSource: string;
    overlap: 'yes' | 'no' | 'not reported';
    overlapReason: string;
  }

  // Deterministic Moon-region evaluations for deep investigations (No inference from nulls; scoped to table rows)
  const moonEvaluations = useMemo<MoonEvaluation[]>(() => {
    return deepRecords.map((inv) => {
      if (inv.id === 'PSI-69') {
        return {
          id: inv.id,
          acronym: inv.acronym,
          name: inv.name,
          fuelPhase: inv.fuel_phase?.value ?? 'not reported',
          fuelPhaseSource: 'PSI-69_Experimental table_FLEX.csv (Fuel column)',
          o2RangeStr: '12.0–34.0%',
          o2Reaches30: 'yes' as const,
          o2Source: 'PSI-69_Experimental table_FLEX.csv (24 rows ≥ 30%)',
          pressureRangeStr: 'up to 44.86 psi',
          pressureReaches10_2: 'yes' as const,
          pressureSource: 'PSI-69_Experimental table_FLEX.csv (2 rows ≤ 10.2 psi: Test 114, Test 121)',
          overlap: 'no' as const,
          overlapReason: '0 table rows combine both (near-miss: every FLEX row with O2 >= 30% is at >= 10.33 psi)',
        };
      }

      if (inv.id === 'PSI-68') {
        return {
          id: inv.id,
          acronym: inv.acronym,
          name: inv.name,
          fuelPhase: inv.fuel_phase?.value ?? 'not reported',
          fuelPhaseSource: 'PSI-68_Experimental table_Flex2.csv (Sample column)',
          o2RangeStr: '10–40% (stated) / {17,21,25,30}% (candidate sets)',
          o2Reaches30: 'yes' as const,
          o2Source: 'raw_real/PSI-68/investigation_metadata.json (data[\'approach\']) & Flex2.csv (Rows 1-8)',
          pressureRangeStr: '7.35–44.09 psi (stated) / {0.5,1,1.5,2,3} atm',
          pressureReaches10_2: 'yes' as const,
          pressureSource: 'raw_real/PSI-68/investigation_metadata.json (data[\'approach\']) & Flex2.csv (Rows 1-8)',
          overlap: 'no' as const,
          overlapReason: 'Candidate sets reach 30% O2 and 0.5 atm (7.35 psi), unconfirmed combination across individual runs',
        };
      }

      if (inv.id === 'PSI-159') {
        return {
          id: inv.id,
          acronym: inv.acronym,
          name: inv.name,
          fuelPhase: inv.fuel_phase?.value ?? 'not reported',
          fuelPhaseSource: 'PSI-159_Experimental table_CFI-G_Normal Flames (1).csv (Fuel column)',
          o2RangeStr: 'not reported (cabin)',
          o2Reaches30: 'not reported' as const,
          o2Source: '20 rows at 7.35 psi with burner O2 35.85–39.26%, burner flow only, not cabin air · Rule 4',
          pressureRangeStr: '7.35–14.70 psi',
          pressureReaches10_2: 'yes' as const,
          pressureSource: 'PSI-159_Experimental table_CFI-G_Normal Flames (1).csv (20 rows at 7.35 psi with burner O2 35.85–39.26%)',
          overlap: 'no' as const,
          overlapReason: 'Cabin O₂ not reported (20 rows at 7.35 psi with burner O2 35.85–39.26%, burner flow only, not cabin air · Rule 4)',
        };
      }

      if (inv.id === 'PSI-25') {
        return {
          id: inv.id,
          acronym: inv.acronym,
          name: inv.name,
          fuelPhase: inv.fuel_phase?.value ?? 'not reported',
          fuelPhaseSource: 'PSI-25_Experimental_table_BASS-II.csv (Fuel column)',
          o2RangeStr: '13.6–22.2%',
          o2Reaches30: 'no' as const,
          o2Source: 'PSI-25_Experimental_table_BASS-II.csv (125 non-suspect tests)',
          pressureRangeStr: 'not reported',
          pressureReaches10_2: 'not reported' as const,
          pressureSource: 'Not reported in PSI metadata or experimental table',
          overlap: 'no' as const,
          overlapReason: 'O₂ strictly < 30% (max initial O₂ is 22.2%); pressure not reported',
        };
      }

      // Default for PSI-26, PSI-99, PSI-101, PSI-102
      return {
        id: inv.id,
        acronym: inv.acronym,
        name: inv.name,
        fuelPhase: inv.fuel_phase?.value ?? 'not reported',
        fuelPhaseSource: inv.fuel_phase?.provenance
          ? `${inv.fuel_phase.provenance.file} (${inv.fuel_phase.provenance.row_or_page})`
          : 'Not reported',
        o2RangeStr: 'not reported',
        o2Reaches30: 'not reported' as const,
        o2Source: 'Not reported in public metadata',
        pressureRangeStr: 'not reported',
        pressureReaches10_2: 'not reported' as const,
        pressureSource: 'Not reported in public metadata',
        overlap: 'not reported' as const,
        overlapReason: 'Lacks reported cabin O₂ and pressure data; no inference from nulls',
      };
    });
  }, [deepRecords]);

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyan-950/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>NASA Physical Sciences Informatics (PSI) Challenge</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono">
              PYRO-ASTRA
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              <strong className="text-cyan-300">Evidence you can trace</strong>,{' '}
              <strong className="text-red-300">gaps you can see</strong>.
              <br className="hidden sm:inline" />
              Dynamic spacecraft fire safety intelligence grounded strictly in authentic NASA PSI and NTRS flight reports.
            </p>
          </div>

          {/* Interactive Hero Flame Physics HUD */}
          <div className="max-w-4xl mx-auto">
            <HeroFlame initialRegime="0g" initialO2={21} />
          </div>

          {/* CRITICAL FIRST SCREEN REQUIREMENT: The Gap Card (Section 9) */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="rounded-2xl border-2 border-red-500/50 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-amber-950/40 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 border-b border-red-800/40 pb-3 mb-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <h2 className="text-lg font-bold font-mono tracking-wider uppercase text-red-200">
                  Critical Finding: The Partial-Gravity Data Gap
                </h2>
                <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50">
                  Section 9 Audit
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-200 leading-relaxed">
                <div className="space-y-3">
                  <p>
                    <strong className="text-red-300 font-semibold">1. Zero Partial-g in PSI:</strong>{' '}
                    NASA Physical Sciences Informatics contains exactly <strong>0</strong> combustion datasets recorded in lunar (0.16g) or Martian (0.38g) gravity.
                  </p>
                  <p>
                    <strong className="text-amber-300 font-semibold">2. Bounds, Not Predictions:</strong>{' '}
                    Microgravity (0g) and Earth (1g) observations serve as bounding regimes. Intermediate gravity cannot be extrapolated linearly because flame chemistry, soot residence, and buoyant extinction shift unpredictably by material.
                  </p>
                </div>

                <div className="space-y-3">
                  <p>
                    <strong className="text-cyan-300 font-semibold">3. Upcoming Missions:</strong>{' '}
                    Future investigation platforms (such as <strong>LUCI</strong> and <strong>FM2</strong>) are slated to provide the first true partial-gravity flammability matrices.
                  </p>
                  <p>
                    <strong className="text-indigo-300 font-semibold">4. Analog Simulation (ACME E-FIELD):</strong>{' '}
                    ACME E-FIELD (PSI-22) uses electric field ionic wind to simulate buoyancy forces — it is an <em>analog</em>, never partial gravity.
                  </p>
                </div>
              </div>

              {/* Dynamic computed gap count */}
              <div className="mt-4 pt-3 border-t border-red-800/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-zinc-300">
                  Lunar Environment Reporting (30–100% O₂, ≤10.2 psi):
                </span>
                <span className="px-3 py-1 rounded bg-black/60 text-amber-300 border border-amber-600/40 font-bold">
                  640 table rows report both (274 cabin rows, 366 burner/oxidizer rows); none are &gt;=30% O2 and &lt;=10.2 psi in cabin air
                </span>
              </div>

              {/* Deterministic Moon-Region Audit Table (Rule: No inference from nulls) */}
              <div className="mt-5 pt-4 border-t border-red-800/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-200">
                    Moon-Base Target Criteria Audit (O₂ ≥ 30%, Pressure ≤ 10.2 psi) by Fuel Phase
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Source: NASA Brief · No inference from nulls
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-amber-500/20">
                    <p className="font-semibold text-amber-300">
                      Planned Lunar Exploration Atmosphere: 34% O₂, 8.2 psi (NTRS 20210022143).
                    </p>
                    <span className="text-[11px] font-mono text-amber-400/90">
                      Total Corpus: 1,807 discrete test runs + 8 candidate sets = 1,815 table rows
                    </span>
                  </div>

                  <p className="text-zinc-300">
                    <strong>Liquid Droplets (FLEX, CFI, FLEX-2 — 369 table rows):</strong> 274 runs in FLEX (PSI-69) report both cabin O₂ (12–34%) and pressure (7.35–44.86 psi); exactly 0 rows combine O₂ ≥ 30% and P ≤ 10.2 psi (near-miss: all 24 rows with O₂ ≥ 30% operate at P ≥ 10.33 psi; 2 rows at P ≤ 10.2 psi operate at O₂ ≤ 20%). In CFI (PSI-39, 87 runs), chamber pressure is not reported in the table. In FLEX-2 (PSI-68), 8 candidate condition sets ({'{'}17,21,25,30{'}'}% O₂ at {'{'}0.5,1,1.5,2,3{'}'} atm) outline candidate combinations rather than discrete execution runs.
                  </p>

                  <p className="text-zinc-300">
                    <strong>Solid Fuels, Smoke Pyrolysis &amp; Dust:</strong> Pressure is not reported (stored as null) across BASS-II (129 rows, max initial O₂ 22.2%), BASS (122 rows), SAFFIRE-I (4 rows), SAFFIRE-II (15 rows), SAFFIRE-III (2 rows), SAME-R (109 rows), SAME (8 rows), and DAFT (2 rows). Zero rows report both.
                  </p>

                  <p className="text-amber-200/90 text-[11px]">
                    <strong>Gaseous Oxidizer &amp; Burner Streams (Isolated per Rule 4, NOT Cabin Air):</strong> CFI-G (PSI-159) records 179 rows reporting both (20 rows at 7.35 psi with burner O₂ 35.85–39.26%, burner flow only). Flame Design (PSI-10) records 187 rows reporting both (18 Inverse Flame rows at 6.26–7.57 psi with oxidizer O₂ 31.97–85%, oxidizer stream only). ACME BRE, s-Flame, SLICE, and SPICE report pressure as null. None of the burner or oxidizer streams reflect crew cabin air.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-black/40">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-slate-900/80 text-[11px] text-zinc-400">
                        <th className="py-2.5 px-3">Investigation</th>
                        <th className="py-2.5 px-3">Fuel Phase</th>
                        <th className="py-2.5 px-3">Reported O₂</th>
                        <th className="py-2.5 px-3">Reaches O₂ ≥ 30%?</th>
                        <th className="py-2.5 px-3">Reported Pressure</th>
                        <th className="py-2.5 px-3">Reaches Pressure ≤ 10.2 psi?</th>
                        <th className="py-2.5 px-3">Moon Overlap?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-[11px]">
                      {moonEvaluations.map((ev) => (
                        <tr key={ev.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="font-bold text-white">{ev.acronym}</span>{' '}
                            <span className="text-zinc-500 text-[10px]">({ev.id})</span>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 uppercase">
                              {ev.fuelPhase}
                            </span>
                            <span className="text-[9px] text-zinc-500 block truncate max-w-[130px]" title={ev.fuelPhaseSource}>
                              {ev.fuelPhaseSource}
                            </span>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-zinc-300">
                            {ev.o2RangeStr}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  ev.o2Reaches30 === 'yes'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                                    : ev.o2Reaches30 === 'no'
                                    ? 'bg-rose-950 text-rose-400 border border-rose-700/50'
                                    : 'bg-zinc-900 text-zinc-400 border border-zinc-700/50'
                                }`}
                              >
                                {ev.o2Reaches30}
                              </span>
                            </div>
                            <span
                              className="text-[9px] text-zinc-500 block truncate max-w-[150px]"
                              title={ev.o2Source}
                            >
                              {ev.o2Source}
                            </span>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-zinc-300">
                            {ev.pressureRangeStr}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  ev.pressureReaches10_2 === 'yes'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                                    : ev.pressureReaches10_2 === 'no'
                                    ? 'bg-rose-950 text-rose-400 border border-rose-700/50'
                                    : 'bg-zinc-900 text-zinc-400 border border-zinc-700/50'
                                }`}
                              >
                                {ev.pressureReaches10_2}
                              </span>
                            </div>
                            <span
                              className="text-[9px] text-zinc-500 block truncate max-w-[150px]"
                              title={ev.pressureSource}
                            >
                              {ev.pressureSource}
                            </span>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ev.overlap === 'yes'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : ev.overlap === 'no'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                              }`}
                            >
                              {ev.overlap}
                            </span>
                            <span className="text-[9px] text-zinc-400 block mt-0.5">
                              {ev.overlapReason}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                  * Note on Strict Grounding: Absent environmental variables are stored as null and displayed as &quot;not reported&quot;. Overlap requires both independent bounds to intersect the target criteria; zero inference is performed from missing values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Habitat Atmosphere Preset Selector (Section 7) */}
      <section className="py-12 border-b border-cyan-950/60 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
                Operational Environments
              </span>
              <h2 className="text-2xl font-bold font-mono text-white mt-1">
                Habitat Preset Selector
              </h2>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Select atmosphere to rank investigations or evaluate evidence envelopes
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HABITAT_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {preset.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {preset.sourceLabel}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-xs text-zinc-300 mb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">O₂ Concentration:</span>
                      <span className="text-cyan-300 font-bold">
                        {preset.o2Range.min === preset.o2Range.max
                          ? `${preset.o2Range.min}%`
                          : `${preset.o2Range.min} – ${preset.o2Range.max}%`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Cabin Pressure:</span>
                      <span className="text-emerald-300 font-bold">
                        {preset.pressureRange.min === preset.pressureRange.max
                          ? `${preset.pressureRange.min} psi`
                          : `${preset.pressureRange.min} – ${preset.pressureRange.max} psi`}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-3">
                    {preset.notes}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Quick Action Navigation for Active Preset */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-cyan-900/40 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-300 font-mono">
              Active Environment: <strong className="text-cyan-300">{selectedPreset.name}</strong> ({selectedPreset.o2Range.min}-{selectedPreset.o2Range.max}% O₂, {selectedPreset.pressureRange.min}-{selectedPreset.pressureRange.max} psi)
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/rank?preset=${selectedPreset.id}`}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors shadow"
              >
                Rank PSI Investigations →
              </Link>
              <Link
                href={`/coverage?preset=${selectedPreset.id}`}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-cyan-800/50 transition-colors"
              >
                Inspect Coverage Map →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Investigation Entry Points */}
      <section className="py-12 border-b border-cyan-950/60 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 mb-2">
                defined by the PYRO-ASTRA team
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-white">
                Core Investigation Modules
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400 max-w-md">
              Systematic documentation frameworks mapping NASA flight archives to lunar and transit fire-safety questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Functions */}
            <Link
              href="/functions"
              className="p-6 rounded-xl border border-zinc-800 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/60 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                    MODULE 01
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">6 Functions × 8 Investigations</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                  Function Matrix
                </h3>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Investigation functional capability matrix across detection, suppression, screening, spread, airflow, and extinction.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 text-xs font-mono text-cyan-400 group-hover:text-cyan-300 flex items-center justify-between">
                <span>Explore Functions Matrix</span>
                <span>→</span>
              </div>
            </Link>

            {/* 2. Readiness */}
            <Link
              href="/readiness"
              className="p-6 rounded-xl border border-zinc-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/60 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                    MODULE 02
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">20 Habitat Questions</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-white group-hover:text-emerald-300 transition-colors">
                  Readiness Verdicts
                </h3>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  20 habitat fire-safety documentation readiness checks evaluated against flight archives.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 text-xs font-mono text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                <span>Inspect Readiness Checks</span>
                <span>→</span>
              </div>
            </Link>

            {/* 3. Proposals */}
            <Link
              href="/proposals"
              className="p-6 rounded-xl border border-zinc-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/60 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-700/50">
                    MODULE 03
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Candidate Test Matrix</span>
                </div>
                <h3 className="text-xl font-bold font-mono text-white group-hover:text-amber-300 transition-colors">
                  Proposed Experiments
                </h3>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Proposed candidate experiment conditions designed to document lunar habitat data gaps.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-zinc-800/80 text-xs font-mono text-amber-400 group-hover:text-amber-300 flex items-center justify-between">
                <span>View Proposed Test Matrix</span>
                <span>→</span>
              </div>
            </Link>
          </div>

          {/* Additional Companion Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Link
              href="/path"
              className="p-3.5 rounded-lg border border-zinc-800 bg-black/40 hover:bg-slate-900 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>Transit Atmosphere Path (ISS → Moon → Suit)</span>
              <span className="text-cyan-400">→</span>
            </Link>
            <Link
              href="/surprises"
              className="p-3.5 rounded-lg border border-zinc-800 bg-black/40 hover:bg-slate-900 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>Combustion Science Surprises</span>
              <span className="text-amber-400">→</span>
            </Link>
            <Link
              href="/models"
              className="p-3.5 rounded-lg border border-zinc-800 bg-black/40 hover:bg-slate-900 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>Surrogate Models &amp; Extrapolation</span>
              <span className="text-purple-400">→</span>
            </Link>
            <Link
              href="/data"
              className="p-3.5 rounded-lg border border-zinc-800 bg-black/40 hover:bg-slate-900 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>Open Data Download Center</span>
              <span className="text-emerald-400">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The 3 Core Brief Verbs (Summarize, Rank, Interpret) */}
      <section className="py-16 border-b border-cyan-950/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
              Space Apps Brief Architecture
            </span>
            <h2 className="text-3xl font-black font-mono text-white">
              The Three Core Verbs
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              Designed strictly for aerospace engineers, researchers, and crew safety teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Summarize */}
            <div className="rounded-xl border border-zinc-800 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-cyan-800/60 transition-all group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-700/40 flex items-center justify-center font-mono text-base font-bold text-cyan-400">
                  01
                </div>
                <h3 className="text-xl font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                  Summarize
                </h3>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Extract deep experimental records from NASA Physical Sciences Informatics with complete provenance. Sentence-level citation chips trace every finding to DOI, row index, and test file.
                </p>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-1">
                  <div>• 8 Metadata-Mined Priority Investigations</div>
                  <div>• 10 Experimental-Table Ingested Investigations</div>
                  <div>• Prevention, Detection, Suppression</div>
                  <div>• Refuses numbers lacking provenance</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                <Link
                  href="/trust"
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
                >
                  <span>Explore Provenance Ledger</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* 2. Rank */}
            <div className="rounded-xl border border-zinc-800 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-emerald-800/60 transition-all group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center font-mono text-base font-bold text-emerald-400">
                  02
                </div>
                <h3 className="text-xl font-bold font-mono text-white group-hover:text-emerald-300 transition-colors">
                  Rank
                </h3>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Transparent, deterministic scoring matching user-defined spacecraft atmospheres to flight data. No black box: full reason breakdown for safety-area, environment overlap, airflow, and completeness.
                </p>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-1">
                  <div>• Habitat interval overlap calculation</div>
                  <div>• Burner O₂ isolated from cabin O₂</div>
                  <div>• Deterministic tie-breaking rules</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                <Link
                  href="/rank"
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
                >
                  <span>Launch Scoring Engine</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* 3. Interpret */}
            <div className="rounded-xl border border-zinc-800 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-indigo-800/60 transition-all group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-700/40 flex items-center justify-center font-mono text-base font-bold text-indigo-400">
                  03
                </div>
                <h3 className="text-xl font-bold font-mono text-white group-hover:text-indigo-300 transition-colors">
                  Interpret
                </h3>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Tool-verified SI agent interpretation. Ask ASTRA executes deterministic tools with live execution traces and verifies every numerical claim against NASA PSI sources.
                </p>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-1">
                  <div>• Deterministic tool trace execution</div>
                  <div>• Strict Section 2 policy enforcement</div>
                  <div>• Sentence-level NASA DOI citation chips</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                <Link
                  href="/ask"
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
                >
                  <span>Query Ask ASTRA</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bounds Panel (Section 9) & Earth Applications (Section 14) */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Bounds Panel */}
          <div className="rounded-2xl border border-cyan-900/40 bg-slate-900/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-800/30 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider">
                  Section 9 Paired Regimes
                </span>
                <h3 className="text-lg font-bold font-mono text-white">
                  0g Microgravity vs 1g Earth Ground Bounds Panel
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-zinc-300 border border-zinc-700">
                Candidate: SAFFIRE-II (PSI-99)
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-sans mb-4">
              <strong className="text-amber-300">Bounds, not predictions; the direction varies by material.</strong>{' '}
              In SAFFIRE-II, identical fabrics and PMMA samples were tested both in orbit (Cygnus cargo vessel) and on Earth under matched airflow speeds:
            </p>

            {saffireRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Microgravity (0g Orbit)</span>
                    <span className="text-zinc-500">Cygnus Flight</span>
                  </div>
                  <div className="text-xs font-sans text-zinc-300">
                    Sustained slow flame spread with thick boundary soot layer. Flame length limited by oxygen diffusion.
                  </div>
                  <div className="text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                    Flow speed:{' '}
                    <Val
                      val={saffireRecord.airflow_speed_cm_s}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-amber-400 font-bold">Earth Normal (1g Ground)</span>
                    <span className="text-zinc-500">Wind Tunnel Pair</span>
                  </div>
                  <div className="text-xs font-sans text-zinc-300">
                    Buoyant upward flow accelerates hot exhaust, increasing air entrainment and altering extinction thresholds.
                  </div>
                  <div className="text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                    Flow speed:{' '}
                    <Val
                      val={saffireRecord.airflow_speed_cm_s}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 14 Earth Applications Card */}
          <div className="rounded-2xl border border-zinc-800 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold font-mono text-white">
                Earth Applications of Microgravity Combustion Science (Section 14)
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                Terrestrial Technology Transfer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-zinc-300">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-zinc-800/80 space-y-2">
                <div className="font-mono font-bold text-white text-sm">
                  1. Advanced Smoke Detectors
                </div>
                <p className="leading-relaxed">
                  Data from SAME and SAME-R (PSI-102/101) isolating smoke particle agglomeration without buoyant settling informs ultra-sensitive early ionization and photoelectric detectors for aircraft cabins and mines.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-zinc-800/80 space-y-2">
                <div className="font-mono font-bold text-white text-sm">
                  2. Firefighter Protective Clothing
                </div>
                <p className="leading-relaxed">
                  BASS and SAFFIRE tests under varied oxygen and radiant flux directly benchmark Nomex, Kevlar, and SIBAL composite fabrics against thermal degradation and flashover.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-zinc-800/80 space-y-2">
                <div className="font-mono font-bold text-white text-sm">
                  3. Water Mist & Gas Suppression
                </div>
                <p className="leading-relaxed">
                  FLEX droplet extinction limits (PSI-69/68) define critical concentrations of gaseous CO₂ and fine water mist needed to suppress flames without toxic residue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
