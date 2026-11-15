'use client';

import React from 'react';
import {
  TOTAL_INGESTED_TABLE_ROWS,
  ROWS_REPORTING_BOTH_O2_AND_P,
  CABIN_AIR_ROWS_WITH_BOTH,
  FLEX_CABIN_O2_GE_30_COUNT,
  CABIN_AIR_LUNAR_MATCH_COUNT,
} from '@/lib/ui-constants';

export function EvidenceFunnelChart() {
  const steps = [
    {
      level: 1,
      title: 'Total Ingested Table Rows',
      count: TOTAL_INGESTED_TABLE_ROWS,
      detail: '1,807 flight test runs + 8 FLEX-2 candidate parameter sets across 18 PSI investigations',
      color: 'bg-slate-200 border-slate-300 text-slate-800',
      barColor: 'bg-slate-300',
      widthPct: 100,
    },
    {
      level: 2,
      title: 'Rows Reporting Both O₂ & Pressure',
      count: ROWS_REPORTING_BOTH_O2_AND_P,
      detail: 'Tables reporting simultaneous oxygen and pressure (cabin ambient + burner streams)',
      color: 'bg-sky-50 border-sky-200 text-sky-900',
      barColor: 'bg-sky-400',
      widthPct: (ROWS_REPORTING_BOTH_O2_AND_P / TOTAL_INGESTED_TABLE_ROWS) * 100,
    },
    {
      level: 3,
      title: 'Ambient Cabin-Air Rows with Both',
      count: CABIN_AIR_ROWS_WITH_BOTH,
      detail: 'FLEX (PSI-69) liquid droplet tests in habitable ambient chamber atmospheres',
      color: 'bg-sky-100 border-sky-300 text-sky-900',
      barColor: 'bg-sky-600',
      widthPct: (CABIN_AIR_ROWS_WITH_BOTH / TOTAL_INGESTED_TABLE_ROWS) * 100,
    },
    {
      level: 4,
      title: 'Cabin-Air Rows with O₂ ≥ 30%',
      count: FLEX_CABIN_O2_GE_30_COUNT,
      detail: 'All sit at pressure ≥ 10.33 psi (534.3 to 770.6 mmHg) — above lunar pressure cutoff',
      color: 'bg-amber-50 border-amber-300 text-amber-900',
      barColor: 'bg-amber-500',
      widthPct: Math.max((FLEX_CABIN_O2_GE_30_COUNT / TOTAL_INGESTED_TABLE_ROWS) * 100, 6),
    },
    {
      level: 5,
      title: 'Cabin-Air Rows with O₂ ≥ 30% & Pressure ≤ 10.2 psi',
      count: CABIN_AIR_LUNAR_MATCH_COUNT,
      detail: 'The Lunar Habitat Gap (34% O₂ at 8.2 psi per NASA NTRS 20210022143)',
      color: 'bg-rose-50 border-rose-300 text-rose-950 font-bold',
      barColor: 'bg-rose-600',
      widthPct: 2,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-mono">
            Deterministic Evidence Funnel: The Lunar Atmosphere Gap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stepwise audit filtering 1,815 PSI rows down to the planned lunar habitat conditions.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Grounded Audit Result
        </span>
      </div>

      {/* Stepped Bars */}
      <div className="space-y-3 pt-1">
        {steps.map((step) => (
          <div key={step.level} className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-mono font-medium text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  {step.level}
                </span>
                <span>{step.title}</span>
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {step.count.toLocaleString()} <span className="text-[11px] font-normal text-slate-500">rows</span>
              </span>
            </div>

            {/* Visual Bar */}
            <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-md transition-all duration-300 flex items-center justify-end px-2 ${step.barColor}`}
                style={{ width: `${Math.max(step.widthPct, 1.5)}%` }}
              >
                {step.count === 0 && (
                  <span className="text-[10px] font-mono font-extrabold text-white uppercase tracking-wider">
                    0
                  </span>
                )}
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pl-7">
              {step.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Funnel Finding Callout */}
      <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 leading-relaxed font-mono flex items-start gap-2.5">
        <span className="font-bold text-rose-700 text-sm">∎</span>
        <div>
          <strong className="text-rose-950 font-bold block mb-0.5">
            Key Architecture Finding: Zero Empirical Lunar Rows
          </strong>
          Across the entire NASA PSI spacecraft combustion public record, exactly 0 table rows test ambient cabin air at O₂ ≥ 30% and pressure ≤ 10.2 psi. All surrogate predictions outside measured microgravity bounds are refused.
        </div>
      </div>
    </div>
  );
}

export default EvidenceFunnelChart;
