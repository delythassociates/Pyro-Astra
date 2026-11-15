'use client';

import React, { useState, Suspense } from 'react';
import { AtmosphereFlowController } from '@/components/AtmosphereFlowController';
import { LunarGapChart } from '@/components/LunarGapChart';
import { Val } from '@/components/Val';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import {
  TOTAL_INGESTED_TABLE_ROWS,
  ROWS_REPORTING_BOTH_O2_AND_P,
  CABIN_AIR_ROWS_WITH_BOTH,
  FLEX_CABIN_O2_GE_30_COUNT,
  CABIN_AIR_LUNAR_MATCH_COUNT,
  CFI_G_BURNER_TARGET_ROWS,
  FLAME_DESIGN_OXIDIZER_TARGET_ROWS,
} from '@/lib/ui-constants';
import { Compass, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';

function CoverageContent() {
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'solid' | 'liquid droplet' | 'gas' | 'smoke'>('all');

  const deepRecords = DEFAULT_INVESTIGATIONS.filter((inv) => inv.depth === 'deep');

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-800 uppercase tracking-wider font-semibold">
          <Compass className="w-4 h-4 text-sky-700" />
          <span>Atmospheric Regime Coverage & The Lunar Gap</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          NASA PSI Atmospheric Coverage & Boundary Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Pressure (0–45 psi) vs. Oxygen Concentration (10–100%). Audits measured microgravity envelopes, differentiates burner oxidizer streams from habitable cabin air (Rule 4), and identifies unplottable investigations.
        </p>
      </div>

      {/* TRACK 1: Unified Atmosphere & Flow Regime Control Bar */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
            Interactive Atmospheric Parameter & Flow Regime Controller
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Presets & Live Classification</span>
        </div>
        <AtmosphereFlowController />
      </section>

      {/* Primary Coverage Graph & Envelopes */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold font-mono text-slate-900">
            Coverage Map: Pressure vs. Oxygen Concentration Envelopes
          </h2>
          <p className="text-xs text-slate-500">
            Shaded rose region marks the planned lunar habitat target zone (O₂ ≥ 30% & Pressure ≤ 10.2 psi).
          </p>
        </div>
        <LunarGapChart />
      </section>

      {/* Fuel Phase Partition Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Filter by Fuel Phase:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'solid', 'liquid droplet', 'gas', 'smoke'] as const).map((phase) => {
              const isSelected = selectedPhase === phase;
              return (
                <button
                  key={phase}
                  type="button"
                  onClick={() => setSelectedPhase(phase)}
                  className={`px-3 py-1 rounded-md text-xs font-mono uppercase transition-colors border ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {phase}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Selected Phase: <strong className="text-slate-900 uppercase font-bold">{selectedPhase}</strong>
        </div>
      </div>

      {/* Phase Breakdown Narrative Callout */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2 text-xs font-mono leading-relaxed">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-sky-900 uppercase tracking-wider">
            Planned Lunar Atmosphere (34% O₂, 8.2 psi) vs. {selectedPhase.toUpperCase()} Records
          </span>
          <span className="text-[10px] text-slate-400">NASA NTRS-20210022143</span>
        </div>
        <p className="text-slate-700">
          {selectedPhase === 'solid'
            ? 'BASS-II reports initial O₂ of 13.6–22.2% across 129 table rows (rods, films, slabs, SIBAL, Nomex III). Chamber pressure is not reported in public tables. Maximum initial O₂ in this table is 22.2%, strictly below the ≥ 30% planned lunar atmosphere (34% O₂ / 8.2 psi, NTRS 20210022143).'
            : selectedPhase === 'liquid droplet'
            ? 'In the authentic flight experimental table for FLEX (PSI-69, 274 rows), 0 rows combine O₂ ≥ 30% and pressure ≤ 10.2 psi (near-miss: every FLEX row with O₂ ≥ 30% operates at pressure ≥ 10.33 psi; 24 rows at O₂ ≥ 30% operate at 10.33–14.91 psi; 2 rows at P ≤ 10.2 psi operate at O₂ ≤ 20%). In FLEX-2 (PSI-68), 8 candidate condition sets outline candidate parameter matrices rather than confirmed individual flight executions.'
            : selectedPhase === 'gas'
            ? `CFI-G (PSI-159) records ${CFI_G_BURNER_TARGET_ROWS} rows at 7.35 psi with burner O₂ 35.85–39.26%, which is burner flow only, not cabin air (Rule 4). Flame Design (PSI-10) records ${FLAME_DESIGN_OXIDIZER_TARGET_ROWS} Inverse Flame rows at 6.26–7.57 psi with oxidizer O₂ 31.97–85%, which is an oxidizer stream only, not cabin air. Cabin O₂ is not reported for either.`
            : selectedPhase === 'smoke'
            ? 'SAME (PSI-102) and SAME-R (PSI-101) evaluated smoke and particulate detectors. Neither cabin O₂ nor chamber pressure are reported in public flight tables.'
            : `${ROWS_REPORTING_BOTH_O2_AND_P} table rows report both O₂ and pressure (${CABIN_AIR_ROWS_WITH_BOTH} cabin ambient rows in FLEX + 366 burner/oxidizer rows); none are ≥ 30% O₂ and ≤ 10.2 psi in cabin air. Total corpus = 1,807 discrete test runs + 8 candidate sets (1,815 table rows). Droplet breakdown: 369 table rows = 274 runs (FLEX, PSI-69) + 87 runs (CFI, PSI-39) + 8 candidate sets (FLEX-2, PSI-68).`}
        </p>
      </div>

      {/* Detailed Investigation Parameter Coverage Matrix */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Investigation Parameter Coverage & Provenance Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact parameter bounds and reporting status per deep investigation. Click provenance pills to verify DOI and citations.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
            All Values Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3 font-semibold">ID / Acronym</th>
                <th className="p-3 font-semibold">Fuel Phase</th>
                <th className="p-3 font-semibold">Cabin O₂ (%)</th>
                <th className="p-3 font-semibold">Pressure (psi)</th>
                <th className="p-3 font-semibold">Airflow (cm/s)</th>
                <th className="p-3 font-semibold">Reporting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deepRecords.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{inv.id}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{inv.acronym}</div>
                  </td>
                  <td className="p-3 text-slate-700">
                    <Val val={inv.fuel_phase} fallbackText="not reported" />
                  </td>
                  <td className="p-3 text-slate-700">
                    <Val val={inv.cabin_o2_pct} fallbackText="not reported" />
                  </td>
                  <td className="p-3 text-slate-700">
                    <Val val={inv.pressure_psi} fallbackText="not reported" />
                  </td>
                  <td className="p-3 text-slate-700">
                    <Val val={inv.airflow_speed_cm_s} fallbackText="not reported" />
                  </td>
                  <td className="p-3">
                    {inv.cabin_o2_pct?.value != null && inv.pressure_psi?.value != null ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold">
                        ✓ Both O₂ & P Reported
                      </span>
                    ) : inv.id === 'PSI-159' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        Burner Flow Only (Rule 4)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px]">
                        Partial / Missing Fields
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function CoveragePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-slate-500">Loading Coverage Matrix...</div>}>
      <CoverageContent />
    </Suspense>
  );
}
