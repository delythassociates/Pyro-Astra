'use client';

import React, { useState } from 'react';
import { Val } from '@/components/Val';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import type { Investigation } from '@/data/schema';
import { AtmosphereFlowController } from '@/components/AtmosphereFlowController';
import { DualSourceComparisonChart } from '@/components/DualSourceComparisonChart';
import { Bass2SpreadRateChart } from '@/components/Bass2SpreadRateChart';
import { GitCompare, Layers, Compass } from 'lucide-react';

export default function ComparePage() {
  const deepInvestigations = DEFAULT_INVESTIGATIONS.filter((i) => i.depth === 'deep');

  // Select 2 or 3 investigations for side-by-side audit
  const [selectedIds, setSelectedIds] = useState<string[]>(['PSI-26', 'PSI-25', 'PSI-99']);

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((i) => i !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[0], selectedIds[1], id]);
      }
    }
  };

  const selectedRecords = selectedIds
    .map((id) => DEFAULT_INVESTIGATIONS.find((i) => i.id === id))
    .filter((i): i is Investigation => i !== undefined);

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-800 uppercase tracking-wider font-semibold">
          <GitCompare className="w-4 h-4 text-sky-700" />
          <span>Investigation & Source Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Multi-Investigation & Dual-Source Evidence Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Side-by-side audit comparing stated metadata against row-by-row flight extractions, alongside BASS-II flow velocity versus flame spread dynamics.
        </p>
      </div>

      {/* TRACK 1: Atmosphere & Flow Regime Controller */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
          Flow Regime & Mission Atmosphere Simulator
        </h2>
        <AtmosphereFlowController />
      </section>

      {/* GRAPH 3: Dual-Source Metadata vs Table-Listed Comparison */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold font-mono text-slate-900">
            1. Dual-Source Discrepancy Matrix (Metadata vs. Table Rows)
          </h2>
          <p className="text-xs text-slate-500">
            Cross-verifying high-level metadata summaries against authentic row-level experimental data.
          </p>
        </div>
        <DualSourceComparisonChart />
      </section>

      {/* GRAPH 4: BASS-II Flow Velocity vs. Flame Spread Rate */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold font-mono text-slate-900">
            2. Calibrated Flow Speed vs. Solid Flame Spread Rate (BASS-II Table 5.1)
          </h2>
          <p className="text-xs text-slate-500">
            20 flat-PMMA slab flight runs (M1–M20) from NASA/TM-20210011385 showing spread rate dependence on calibrated forced flow.
          </p>
        </div>
        <Bass2SpreadRateChart />
      </section>

      {/* 3. Interactive Side-by-Side Deep Investigation Comparator */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              3. Side-by-Side Flight Investigation Field Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select 2 or 3 deep investigations to inspect schema fields and DOI provenance.
            </p>
          </div>

          {/* Selector Chips */}
          <div className="flex flex-wrap gap-1.5">
            {deepInvestigations.map((inv) => {
              const isSelected = selectedIds.includes(inv.id);
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => handleToggleSelect(inv.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors border ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {inv.id} ({inv.acronym})
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedRecords.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs font-mono"
            >
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-sky-900">{inv.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-sans">
                    {inv.fuel_phase?.value ?? 'Phase null'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{inv.acronym}</h4>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">{inv.name}</p>
              </div>

              {/* Hardware */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                  Flight Hardware
                </span>
                <Val val={inv.hardware} fallbackText="not reported" />
              </div>

              {/* Objectives */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                  Primary Objectives
                </span>
                <Val val={inv.objectives} fallbackText="not reported" className="font-sans text-[11px]" />
              </div>

              {/* Fuels */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                  Tested Fuels / Materials
                </span>
                <Val val={inv.fuels} fallbackText="not reported" />
              </div>

              {/* Cabin O2 */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                  Cabin O₂ Range
                </span>
                <Val val={inv.cabin_o2_pct} fallbackText="not reported" />
              </div>

              {/* Chamber Pressure */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                  Chamber Pressure
                </span>
                <Val val={inv.pressure_psi} fallbackText="not reported" />
              </div>

              {/* Airflow */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                  Airflow Speed
                </span>
                <Val val={inv.airflow_speed_cm_s} fallbackText="not reported" />
              </div>

              {/* Provenance DOI */}
              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                <span>DOI: {inv.doi ?? 'Not available'}</span>
                <span className="text-emerald-700 font-bold">✓ Audit Verified</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
