'use client';

import React, { useState } from 'react';
import proposedData from '../../../data/analysis/proposed_experiments.json';
import { Sparkles, Info, ShieldAlert, ArrowRight, Layers, FileSpreadsheet } from 'lucide-react';
import HoverTitleExplanation from '@/components/HoverTitleExplanation';

export default function ProposalsPage() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const runs = proposedData.runs;
  const anchorRun = runs.find((r) => r.is_anchor);
  const activeRun = runs.find((r) => r.run_id === selectedRunId) || anchorRun || runs[0];

  return (
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto font-sans">
      {/* Header with Mandatory Policy Labels */}
      <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] font-bold">
            Proposed conditions to document. Not safety advice.
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 bg-[#EAE5DB] text-[#181615] border border-[#D5CFC2] font-semibold">
            Candidate Test Matrix Design
          </span>
          <span className="text-[11px] font-mono text-[#5A544A]">
            SPEC Section 11
          </span>
        </div>

        <HoverTitleExplanation
          title="Recommended Next Spaceflight Experiments (12-Test Matrix)"
          summary="Rather than using ungrounded guesses or computer models to assume how materials burn in a lunar base atmosphere, space agencies must fly targeted experiments to measure it directly. This 12-test candidate flight matrix specifies the exact airflow speeds (2.0 to 21.0 cm/s), oxygen levels (up to 34%), and sample thicknesses needed to close the documentation gap aboard the ISS or Gateway—with zero invented predictions."
          badge="Candidate Test Matrix"
        />

        <div className="p-3 bg-[#EAE5DB] border border-[#D5CFC2] text-xs font-mono space-y-1">
          <p className="font-semibold text-[#181615]">
            Protocol Derivation: Conditions were chosen by the team by hand around the planned lunar habitat (34% O₂, 8.2 psi) and Table 5.1 ranges (2.0 to 21.0 cm/s flow), and no computed gap analysis was performed.
          </p>
          <p className="text-[#5A544A] text-[11px] font-sans">
            Empirical Baseline: the only solid-fuel O₂ values we could source are BASS-II Table 5.1 (20 flat-PMMA tests, 16.8–22.2% O₂); BASS, SAFFIRE-II and SAME do not report O₂ in public metadata.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[10px] text-[#736B5E] uppercase font-bold block">Target Exploration Envelope</span>
          <div className="text-xl font-bold font-mono text-[#1D4ED8]">
            34% O₂ · 8.2 psi
          </div>
          <div className="text-[10px] text-[#5A544A]">NASA NTRS-20210022143</div>
        </div>

        <div className="p-4 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[10px] text-[#736B5E] uppercase font-bold block">Airflow Restriction</span>
          <div className="text-xl font-bold font-mono text-[#15803D]">
            2.0 – 21.0 cm/s
          </div>
          <div className="text-[10px] text-[#5A544A]">NASA/TM-20210011385 Tab 5.1</div>
        </div>

        <div className="p-4 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[10px] text-[#736B5E] uppercase font-bold block">Total Proposed Matrix</span>
          <div className="text-xl font-bold font-mono text-[#181615]">
            {proposedData.total_runs} Runs Max
          </div>
          <div className="text-[10px] text-[#C2410C] font-semibold">1 Anchor + 11 Candidate Points</div>
        </div>

        <div className="p-4 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[10px] text-[#736B5E] uppercase font-bold block">Predicted Outcomes</span>
          <div className="text-xl font-bold font-mono text-[#736B5E]">
            0 (Prohibited)
          </div>
          <div className="text-[10px] text-[#5A544A]">Pure Sampling Matrix</div>
        </div>
      </div>

      {/* Interactive Run Table */}
      <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="border-b border-[#D5CFC2] pb-3">
          <h3 className="text-sm font-bold text-[#181615] font-mono uppercase tracking-wider">
            12-Run Proposed Test Matrix
          </h3>
          <p className="text-xs text-[#5A544A] mt-0.5">
            Select a candidate run to inspect rationale, parameter justification, and hardware feasibility.
          </p>
        </div>

        <div className="overflow-x-auto border border-[#D5CFC2]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#EAE5DB] text-[#181615] border-b border-[#D5CFC2]">
              <tr>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Run ID</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Material</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">O₂ (%)</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Pressure (psi)</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Airflow (cm/s)</th>
                <th className="p-3 font-bold">Anchor / Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CFC2] bg-[#FAF8F3]">
              {runs.map((r) => {
                const isSelected = r.run_id === activeRun.run_id;
                return (
                  <tr
                    key={r.run_id}
                    onClick={() => setSelectedRunId(r.run_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EAE5DB] font-bold'
                        : 'hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <td className="p-3 border-r border-[#D5CFC2] font-bold text-[#1D4ED8]">{r.run_id}</td>
                    <td className="p-3 border-r border-[#D5CFC2] text-[#181615]">{r.material}</td>
                    <td className="p-3 border-r border-[#D5CFC2] text-[#181615]">{r.o2_pct}%</td>
                    <td className="p-3 border-r border-[#D5CFC2] text-[#181615]">{r.pressure_psi !== null ? `${r.pressure_psi} psi` : 'Not Reported'}</td>
                    <td className="p-3 border-r border-[#D5CFC2] text-[#181615]">{r.airflow_speed_cm_s} cm/s</td>
                    <td className="p-3">
                      {r.is_anchor ? (
                        <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] text-[10px] font-bold">
                          Anchor (Flight-Tested)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#EAE5DB] text-[#5A544A] border border-[#D5CFC2] text-[10px]">
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
        <div className="p-4 bg-[#F4F1EA] border border-[#D5CFC2] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#D5CFC2] pb-2">
            <span className="font-bold text-[#181615] text-sm">
              Candidate Test Run: {activeRun.run_id} ({activeRun.material})
            </span>
            <span className="text-[#5A544A]">
              Hardware: {activeRun.nearest_investigation} derivative
            </span>
          </div>
          <p className="font-sans text-[#5A544A] leading-relaxed">
            {activeRun.why_chosen}
          </p>
        </div>
      </div>
    </div>
  );
}
