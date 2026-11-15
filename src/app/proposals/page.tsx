'use client';

import React, { useState } from 'react';
import proposedData from '@/../data/analysis/proposed_experiments.json';
import { Sparkles, Info, ShieldAlert, ArrowRight, Layers } from 'lucide-react';

export default function ProposalsPage() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const runs = proposedData.runs;
  const anchorRun = runs.find((r) => r.is_anchor);
  const activeRun = runs.find((r) => r.run_id === selectedRunId) || anchorRun || runs[0];

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto">
      {/* Header with Mandatory Policy Labels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 font-bold">
            Proposed conditions to document. Not safety advice.
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
            Defined by PYRO-ASTRA Team
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Candidate Test Matrix Design
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Proposed Candidate Flight Experiment Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-4xl">
          A 12-run candidate test matrix systematically addressing the untested environmental gap between Earth/ISS normal atmosphere and the planned lunar exploration habitat (34% O₂, 8.2 psi from NASA NTRS-20210022143). Airflow bounds are restricted to the documented Table 5.1 range (2.0 to 21.0 cm/s) for flat PMMA. Contains <strong>ZERO predicted outcomes</strong>.
        </p>

        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs font-mono space-y-1">
          <p className="font-semibold text-amber-900">
            Protocol Derivation: Conditions were chosen by the team by hand around the planned lunar habitat (34% O₂, 8.2 psi) and Table 5.1 ranges (2.0 to 21.0 cm/s flow), and no computed gap analysis was performed.
          </p>
          <p className="text-slate-600 text-[11px]">
            Empirical Baseline: the only solid-fuel O₂ values we could source are BASS-II Table 5.1 (20 flat-PMMA tests, 16.8–22.2% O₂); BASS, SAFFIRE-II and SAME do not report O₂ in public metadata.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Target Exploration Envelope</span>
          <div className="text-xl font-bold font-mono text-sky-900">
            34% O₂ · 8.2 psi
          </div>
          <div className="text-[10px] text-slate-400">NASA NTRS-20210022143</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Airflow Restriction</span>
          <div className="text-xl font-bold font-mono text-emerald-800">
            2.0 – 21.0 cm/s
          </div>
          <div className="text-[10px] text-slate-400">NASA/TM-20210011385 Tab 5.1</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Total Proposed Matrix</span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {proposedData.total_runs} Runs Max
          </div>
          <div className="text-[10px] text-amber-800 font-semibold">1 Anchor + 11 Candidate Points</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Predicted Outcomes</span>
          <div className="text-xl font-bold font-mono text-slate-400">
            0 (Prohibited)
          </div>
          <div className="text-[10px] text-slate-400">Pure Sampling Matrix</div>
        </div>
      </div>

      {/* Interactive Run Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
            12-Run Proposed Test Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a candidate run to inspect rationale, parameter justification, and hardware feasibility.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="p-3 font-semibold">Run ID</th>
                <th className="p-3 font-semibold">Material</th>
                <th className="p-3 font-semibold">O₂ (%)</th>
                <th className="p-3 font-semibold">Pressure (psi)</th>
                <th className="p-3 font-semibold">Airflow (cm/s)</th>
                <th className="p-3 font-semibold">Anchor / Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((r) => {
                const isSelected = r.run_id === activeRun.run_id;
                return (
                  <tr
                    key={r.run_id}
                    onClick={() => setSelectedRunId(r.run_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3 font-bold text-sky-900">{r.run_id}</td>
                    <td className="p-3 text-slate-800">{r.material}</td>
                    <td className="p-3 text-slate-800">{r.o2_pct}%</td>
                    <td className="p-3 text-slate-800">{r.pressure_psi !== null ? `${r.pressure_psi} psi` : 'Not Reported'}</td>
                    <td className="p-3 text-slate-800">{r.airflow_speed_cm_s} cm/s</td>
                    <td className="p-3">
                      {r.is_anchor ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                          Anchor (Flight-Tested)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                          Candidate Gap Run
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Run Details */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              Candidate Test Run: {activeRun.run_id} ({activeRun.material})
            </span>
            <span className="text-slate-500">
              Hardware: {activeRun.nearest_investigation} derivative
            </span>
          </div>
          <p className="font-sans text-slate-700 leading-relaxed">
            {activeRun.why_chosen}
          </p>
        </div>
      </div>
    </div>
  );
}
