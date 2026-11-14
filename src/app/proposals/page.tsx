'use client';

import React, { useState } from 'react';
import proposedData from '@/../data/analysis/proposed_experiments.json';

export default function ProposalsPage() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const runs = proposedData.runs;
  const anchorRun = runs.find((r) => r.is_anchor);
  const activeRun = runs.find((r) => r.run_id === selectedRunId) || anchorRun || runs[0];

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Mandatory Policy Labels */}
        <div className="border-b border-cyan-900/40 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-700/50 font-bold">
              Proposed conditions to document. Not safety advice.
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              defined by the PYRO-ASTRA team
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Workstream L · Candidate Test Matrix Design
            </span>
          </div>

          <h1 className="text-3xl font-black font-mono text-white">
            Proposed Candidate Experiment Matrix
          </h1>
          <p className="text-sm text-zinc-300 font-sans max-w-4xl leading-relaxed">
            A 12-run candidate test matrix systematically addressing the untested environmental gap between Earth/ISS normal atmosphere and the planned lunar exploration habitat (34% O₂, 8.2 psi from NASA NTRS-20210022143). Airflow bounds are restricted to the documented Table 5.1 range (2.0 to 21.0 cm/s) for flat PMMA. Contains <strong>ZERO predicted outcomes</strong>.
          </p>
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <p className="font-semibold text-amber-300">
              Protocol Derivation: Conditions were chosen by the team by hand around the planned lunar habitat (34% O₂, 8.2 psi) and Table 5.1 ranges (2.0 to 21.0 cm/s flow), and no computed gap analysis was performed.
            </p>
            <p className="font-mono text-zinc-300">
              Empirical Baseline: the only solid-fuel O2 values we could source are BASS-II Table 5.1 (20 flat-PMMA tests, 16.8-22.2% O2); BASS, SAFFIRE-II and SAME do not report O2 in the public metadata.
            </p>
          </div>
        </div>

        {/* High-Level Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Exploration Envelope</span>
            <div className="text-xl font-bold font-mono text-cyan-300">
              34% O₂ · 8.2 psi
            </div>
            <div className="text-[11px] font-mono text-zinc-400">Source: NTRS-20210022143</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Airflow Restriction</span>
            <div className="text-xl font-bold font-mono text-emerald-300">
              2.0 – 21.0 cm/s
            </div>
            <div className="text-[11px] font-mono text-zinc-400">NASA/TM-20210011385 Tab 5.1</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Total Proposed Matrix</span>
            <div className="text-xl font-bold font-mono text-white">
              {proposedData.total_runs} Runs Max
            </div>
            <div className="text-[11px] font-mono text-amber-300">1 Documented Anchor + 11 Candidate Test Points</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Predicted Outcomes</span>
            <div className="text-xl font-bold font-mono text-zinc-400">
              0 (Prohibited)
            </div>
            <div className="text-[11px] font-mono text-zinc-500">Pure Empirical Sampling Matrix</div>
          </div>
        </div>

        {/* Future Partial-Gravity Platforms Notice (Rule 5 Compliance) */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-700/40 text-xs font-sans text-indigo-200 space-y-1.5">
          <div className="font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <span>Future Partial-Gravity Flight Programs: LUCI & FM2</span>
            <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
              No Predictions Made
            </span>
          </div>
          <p className="leading-relaxed text-zinc-300">
            {proposedData.partial_gravity_note}
            Planned tests can be conducted in orbital microgravity facilities (e.g. CIR/MSG) or companion 1g ground rigs to establish physical bounds. True partial-gravity validation requires the upcoming <strong>LUCI</strong> (Lunar Combustion Investigation) and <strong>FM2</strong> (Flammability of Materials on the Moon) payload series.
          </p>
        </div>

        {/* Candidate Design Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h2 className="text-lg font-bold font-mono text-white">
                Proposed Test Matrix (Fixed Seed: {proposedData.fixed_seed})
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Material: {proposedData.material_class} · {proposedData.sample_dimensions}
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Click a row to inspect justification
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-slate-900/40 backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-slate-950 text-[11px] text-zinc-400 uppercase">
                  <th className="p-3">Run ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Oxygen (% O₂)</th>
                  <th className="p-3">Pressure (psi)</th>
                  <th className="p-3">Airflow (cm/s)</th>
                  <th className="p-3">Target Regimes</th>
                  <th className="p-3">Nearest Experiment</th>
                  <th className="p-3">Gap Distance</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const isSelected = run.run_id === activeRun.run_id;
                  return (
                    <tr
                      key={run.run_id}
                      onClick={() => setSelectedRunId(run.run_id)}
                      className={`border-b border-zinc-800/60 cursor-pointer transition-colors ${
                        run.is_anchor
                          ? 'bg-amber-950/30 hover:bg-amber-950/40'
                          : isSelected
                          ? 'bg-cyan-950/40 hover:bg-cyan-950/50'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        {run.is_anchor ? (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        )}
                        <span>{run.run_id}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                            run.is_anchor
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {run.is_anchor ? 'Anchor (Table 5.1)' : 'Candidate Point'}
                        </span>
                      </td>
                      <td className="p-3 text-cyan-300 font-bold">{run.o2_pct}%</td>
                      <td className="p-3 text-emerald-300 font-bold">
                        {run.pressure_psi !== null ? `${run.pressure_psi} psi` : <span className="text-zinc-500 italic">not reported</span>}
                      </td>
                      <td className="p-3 text-zinc-200">{run.airflow_speed_cm_s} cm/s</td>
                      <td className="p-3 text-zinc-400">
                        {run.target_gravity_regimes.join(' & ')}
                      </td>
                      <td className="p-3 text-zinc-300">{run.nearest_investigation}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            run.is_anchor ? 'text-zinc-500' : 'text-amber-400'
                          }`}
                        >
                          {run.gap_distance_normalized.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Run Deep-Dive Card */}
        {activeRun && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-cyan-800/40 space-y-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  {activeRun.run_id} Detailed Specification
                </span>
                {activeRun.is_anchor ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-700/60 font-bold">
                    Documented Baseline Anchor
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold">
                    Exploration Atmosphere Test Point
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-zinc-400">
                Nearest Documented Dataset: <strong className="text-white">{activeRun.nearest_investigation}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block mb-1">Atmospheric Parameters:</span>
                <div className="text-cyan-300 font-bold text-sm">
                  {activeRun.o2_pct}% O₂ @ {activeRun.pressure_psi !== null ? `${activeRun.pressure_psi} psi` : 'not reported (Table 5.1)'}
                </div>
                <div className="text-zinc-400 text-[11px] mt-0.5">
                  Ventilation: {activeRun.airflow_speed_cm_s} cm/s
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block mb-1">Test Specimen Geometry:</span>
                <div className="text-white font-bold">{activeRun.material}</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">{activeRun.sample_geometry}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block mb-1">Normalized Gap Distance:</span>
                <div className="text-amber-300 font-bold text-sm">
                  {activeRun.gap_distance_normalized.toFixed(4)}
                </div>
                <div className="text-zinc-500 text-[10px] mt-0.5">
                  Axes: (ΔO₂/100, Δp/14.7, Δv/60)
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider block font-bold">
                Why Chosen & Experimental Objective:
              </span>
              <p className="text-xs font-sans text-zinc-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-zinc-800/80">
                {activeRun.why_chosen}
              </p>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800 flex flex-wrap justify-between gap-2">
              <span>Documentation Source: {activeRun.documentation_source}</span>
              <span className="text-amber-400/80">No predicted outcomes or flame spread values stored</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
