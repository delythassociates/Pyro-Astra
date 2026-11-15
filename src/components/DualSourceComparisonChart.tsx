'use client';

import React, { useState } from 'react';

interface ComparisonEntry {
  id: string;
  name: string;
  phase: string;
  metaO2: string;
  tableO2: string;
  o2Mismatch: boolean;
  metaP: string;
  tableP: string;
  pMismatch: boolean;
  metaAirflow: string;
  tableAirflow: string;
  airflowMismatch: boolean;
  notes: string;
}

export function DualSourceComparisonChart() {
  const [selectedAxis, setSelectedAxis] = useState<'o2' | 'pressure' | 'airflow'>('o2');

  const comparisons: ComparisonEntry[] = [
    {
      id: 'PSI-69',
      name: 'FLEX',
      phase: 'Liquid Droplet',
      metaO2: '18 – 40 %',
      tableO2: '12 – 40 % (274 runs)',
      o2Mismatch: false,
      metaP: '14.7 psi (1.0 atm)',
      tableP: '10.33 – 14.91 psi (534.3 – 770.6 mmHg)',
      pMismatch: true, // Disagreement in pressure range!
      metaAirflow: 'Quiescent (0 cm/s)',
      tableAirflow: 'Quiescent (0 cm/s)',
      airflowMismatch: false,
      notes: 'Table reveals varied pressure (10.33–14.91 psi) where metadata stated only nominal 1.0 atm.',
    },
    {
      id: 'PSI-68',
      name: 'FLEX-2',
      phase: 'Liquid Droplet',
      metaO2: '17, 21, 25, 30 %',
      tableO2: 'Lists candidate sets (8 rows)',
      o2Mismatch: true, // Candidate sets vs individual confirmed runs!
      metaP: '0.5 – 3.0 atm (7.35 – 44.1 psi)',
      tableP: 'Lists candidate sets (0.5 – 3.0 atm)',
      pMismatch: false,
      metaAirflow: 'Quiescent',
      tableAirflow: 'Quiescent',
      airflowMismatch: false,
      notes: 'Metadata lists candidate test matrix; experimental table reports parameter sets rather than per-run telemetry.',
    },
    {
      id: 'PSI-25',
      name: 'BASS-II',
      phase: 'Solid Fuel',
      metaO2: '13.6 – 22.2 %',
      tableO2: '13.6 – 22.2 % (Table 5.1 initial O₂)',
      o2Mismatch: false,
      metaP: 'Not Reported (null)',
      tableP: 'Not Reported (null across 129 runs)',
      pMismatch: false,
      metaAirflow: '0 – 55 dial units',
      tableAirflow: '1.0 – 20.0 cm/s for M1–M20 only; dial units elsewhere',
      airflowMismatch: true, // cm/s calibrated only for M1-M20
      notes: 'Chamber pressure not reported in table or metadata. Airflow calibrated in cm/s exclusively for flat slabs M1–M20.',
    },
    {
      id: 'PSI-99',
      name: 'SAFFIRE-II',
      phase: 'Solid Fuel',
      metaO2: '21 % (Nominal cabin)',
      tableO2: 'Not Reported in run rows',
      o2Mismatch: true,
      metaP: '14.7 psi',
      tableP: 'Not Reported in run rows',
      pMismatch: true,
      metaAirflow: '10 – 30 cm/s',
      tableAirflow: 'Discrete fan steps (10, 20 cm/s)',
      airflowMismatch: false,
      notes: 'Run table focuses on sample geometry and camera recordings; ambient pressure/O₂ not recorded per test row.',
    },
    {
      id: 'PSI-159',
      name: 'CFI-G',
      phase: 'Gas Flame',
      metaO2: '35.85 – 39.26 % (Burner)',
      tableO2: '35.85 – 39.26 % (Burner flow only)',
      o2Mismatch: false,
      metaP: '7.35 psi (0.5 atm)',
      tableP: '7.35 psi',
      pMismatch: false,
      metaAirflow: 'Burner co-flow velocity',
      tableAirflow: 'Burner co-flow velocity',
      airflowMismatch: false,
      notes: 'Rule 4 strictly applies: oxidizer stream is burner flow only; cabin ambient O₂ is not reported.',
    },
    {
      id: 'PSI-10',
      name: 'Flame Design',
      phase: 'Gas Flame',
      metaO2: '31.97 – 85.0 % (Oxidizer)',
      tableO2: '31.97 – 85.0 % (Reported mole fraction)',
      o2Mismatch: false,
      metaP: '6.26 – 7.57 psi',
      tableP: '6.26 – 7.57 psi',
      pMismatch: false,
      metaAirflow: 'Co-flow velocity',
      tableAirflow: 'Co-flow velocity',
      airflowMismatch: false,
      notes: 'Inverse flame configurations test up to 85% oxidizer in burner streams; ambient cabin air is not tested.',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-mono">
            Dual-Source Comparison: Stated Metadata vs. Table-Listed Rows
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifying claims in experiment metadata summaries against authentic row-by-row table extractions.
          </p>
        </div>

        {/* Axis Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectedAxis('o2')}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedAxis === 'o2'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Oxygen (O₂)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAxis('pressure')}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedAxis === 'pressure'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pressure (psi)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAxis('airflow')}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedAxis === 'airflow'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Airflow Velocity
          </button>
        </div>
      </div>

      {/* Comparison Rows */}
      <div className="space-y-4">
        {comparisons.map((row) => {
          let metaVal = '';
          let tableVal = '';
          let hasMismatch = false;

          if (selectedAxis === 'o2') {
            metaVal = row.metaO2;
            tableVal = row.tableO2;
            hasMismatch = row.o2Mismatch;
          } else if (selectedAxis === 'pressure') {
            metaVal = row.metaP;
            tableVal = row.tableP;
            hasMismatch = row.pMismatch;
          } else {
            metaVal = row.metaAirflow;
            tableVal = row.tableAirflow;
            hasMismatch = row.airflowMismatch;
          }

          return (
            <div
              key={row.id}
              className={`p-4 rounded-xl border transition-colors ${
                hasMismatch ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {row.id}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{row.name}</span>
                  <span className="text-xs text-slate-500 font-mono">({row.phase})</span>
                </div>

                {hasMismatch && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    ⚠ Source Discrepancy Flagged
                  </span>
                )}
              </div>

              {/* Side-by-Side Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono mb-2">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                    Stated in Metadata (investigations.json)
                  </span>
                  <span className="font-semibold text-slate-800">{metaVal}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                    Extracted from Flight Table Rows
                  </span>
                  <span className="font-semibold text-sky-800">{tableVal}</span>
                </div>
              </div>

              {/* Notes */}
              <p className="text-[11px] text-slate-600 font-sans italic">
                {row.notes}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DualSourceComparisonChart;
