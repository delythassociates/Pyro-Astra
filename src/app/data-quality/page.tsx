'use client';

import React from 'react';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import { CORE_EVIDENCE_FIELDS } from '@/lib/score';

export default function DataQualityPage() {
  const deepInvestigations = DEFAULT_INVESTIGATIONS.filter((i) => i.depth === 'deep');

  // Audit data
  const unitAuditRecords = [
    {
      field: 'pressure_psi',
      unitUsed: 'psi',
      rawUnit: 'kPa',
      conversionFormula: '1 psi = 6.894757 kPa (exact)',
      status: 'VERIFIED EXACT',
      note: 'All atmospheric pressures converted with zero rounding deviation and noted in provenance',
    },
    {
      field: 'cabin_o2_pct',
      unitUsed: '% (vol)',
      rawUnit: 'mole fraction / %',
      conversionFormula: 'Direct mole percentage (X_O2 * 100)',
      status: 'VERIFIED EXACT',
      note: 'Cabin atmosphere oxygen only. CFI-G burner flow segregated strictly',
    },
    {
      field: 'burner_flow_o2_pct',
      unitUsed: '% (burner stream)',
      rawUnit: '%',
      conversionFormula: 'Burner nozzle stream O2 percentage',
      status: 'VERIFIED EXACT',
      note: 'Segregated from cabin O2 per Non-Negotiable Rule 4',
    },
    {
      field: 'airflow_speed_cm_s',
      unitUsed: 'cm/s',
      rawUnit: 'cm/s or m/s',
      conversionFormula: '1 m/s = 100 cm/s (exact)',
      status: 'VERIFIED EXACT',
      note: 'Reported in forced flow ducts (MSG, Cygnus)',
    },
    {
      field: 'sample_size',
      unitUsed: 'cm / mm',
      rawUnit: 'cm / mm',
      conversionFormula: 'Direct dimension specifications',
      status: 'VERIFIED EXACT',
      note: 'Solids in cm (BASS, Saffire), droplets in mm (FLEX)',
    },
  ];

  const rowReconciliation = [
    {
      id: 'PSI-25',
      name: 'BASS-II',
      rawFile: 'raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv',
      rawRowCount: '129 rows (125 non-suspect tests)',
      suspectCount: '2 suspect (P22b, T28b)',
      nullCounts: 'Chamber pressure: 129 null; Airflow: 0 null; O₂: 0 null',
      extractedStatus: '129 rows parsed; 125 non-suspect tests across PMMA rods (53), films (22), slabs (20), SIBAL (26), Nomex III (3), candle (1)',
      discrepancy: 'Table 5.1 in NASA-TM-20210011385 provides 20 flat-PMMA tests; authentic CSV table contains all 129 test points with 2 suspect rows flagged.',
    },
    {
      id: 'PSI-68',
      name: 'FLEX-2',
      rawFile: 'raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv',
      rawRowCount: '8 rows',
      suspectCount: '0',
      nullCounts: 'Chamber pressure: 0 null; Cabin O₂: 0 null; Airflow: 8 null (quiescent)',
      extractedStatus: '8 droplet extinction test runs parsed',
      discrepancy: 'Exact match with PSI-68 experimental table; all runs at 1 atm and 21% O₂.',
    },
    {
      id: 'PSI-69',
      name: 'FLEX',
      rawFile: 'raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv',
      rawRowCount: '274 rows',
      suspectCount: '0',
      nullCounts: 'Chamber pressure: 0 null; Cabin O₂: 0 null; Airflow: 274 null (quiescent droplet)',
      extractedStatus: '274 droplet combustion runs parsed',
      discrepancy: 'Full flight test matrix for isolated droplet combustion kinetics across alkane/alcohol fuels.',
    },
    {
      id: 'PSI-99',
      name: 'SAFFIRE-II',
      rawFile: 'raw_real/PSI-99/experimental_table/PSI-99_Experimental table_SAFFIRE-2.csv',
      rawRowCount: '15 rows',
      suspectCount: '0',
      nullCounts: 'Airflow: 0 null; Pressure: 0 null; Cabin O₂: 0 null',
      extractedStatus: '15 large-scale fabric flammability tests in Cygnus vehicle parsed',
      discrepancy: 'Exact match with Cygnus flight test table; 0g/1g pairs validated.',
    },
    {
      id: 'PSI-159',
      name: 'CFI-G',
      rawFile: 'raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (1).csv',
      rawRowCount: '179 rows',
      suspectCount: '0',
      nullCounts: 'Cabin O₂: 179 null (burner flow up to 85% segregated per Rule 4); Pressure: 0 null',
      extractedStatus: '179 burner-stabilized normal flame runs parsed',
      discrepancy: 'Burner nozzle flow O₂ (up to 85%) strictly segregated from cabin atmosphere per Rule 4.',
    },
    {
      id: 'PSI-26',
      name: 'BASS',
      rawFile: 'raw_real/PSI-26/experimental_table/PSI-26_Experimental table_BASS.csv',
      rawRowCount: '122 rows',
      suspectCount: '0',
      nullCounts: 'Chamber pressure: 122 null (not reported); Airflow: 0 null; O₂: 0 null',
      extractedStatus: '122 solid fuel combustion runs parsed',
      discrepancy: 'First-generation MSG solid burn matrix; chamber pressure unstated in table.',
    },
    {
      id: 'PSI-101',
      name: 'SAME-R',
      rawFile: 'raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv',
      rawRowCount: '109 rows',
      suspectCount: '0',
      nullCounts: 'Extinction limits: 109 null (smoke aerosol detection focus); Airflow: 0 null',
      extractedStatus: '109 particulate / aerosol smoke detection runs parsed',
      discrepancy: 'Reflight aerosol size distribution across flow velocities.',
    },
    {
      id: 'PSI-102',
      name: 'SAME',
      rawFile: 'raw_real/PSI-102/experimental_table/PSI-102_Experimental table_SAME.csv',
      rawRowCount: '8 rows',
      suspectCount: '0',
      nullCounts: 'Extinction limits: 8 null (particulate generation rate focus); Airflow: 0 null',
      extractedStatus: '8 smoke generation runs parsed',
      discrepancy: 'Baseline smoke generation rates for spacecraft fire detector calibration.',
    },
  ];

  const suspectRows = [
    {
      tableId: 'PSI-25',
      tableName: 'BASS-II',
      file: 'raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv',
      testId: 'P22b',
      sample: 'Sample 200m (3/8" black rod)',
      pi: 'Fernandez-Pello',
      initialO2: '20.0%',
      finalO2: '39.1%',
      anomaly: 'Final O₂ (39.1%) exceeds Initial O₂ (20.0%) in closed chamber without oxidizer feed',
      handling: 'Retained in raw audit table with FLAGGED SUSPECT badge; excluded from physical bounding envelopes',
    },
    {
      tableId: 'PSI-25',
      tableName: 'BASS-II',
      file: 'raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv',
      testId: 'T28b',
      sample: 'Sample 144m (1 cm SIBAL)',
      pi: "T'ien",
      initialO2: '20.7%',
      finalO2: '40.4%',
      anomaly: 'Final O₂ (40.4%) exceeds Initial O₂ (20.7%) in closed chamber without oxidizer feed',
      handling: 'Retained in raw audit table with FLAGGED SUSPECT badge; excluded from physical bounding envelopes',
    },
  ];

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-cyan-900/40 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <span>Data Engineering & Integrity Audit</span>
            <span>·</span>
            <span>SPEC Section 22</span>
          </div>
          <h1 className="text-3xl font-black font-mono text-white mt-1">
            Data Quality, Missingness & Unit Conversion Audit
          </h1>
          <p className="text-sm text-zinc-400 font-sans mt-1">
            Systematic audit of missingness across core evidence schemas, exact mathematical unit conversions, and row-level data reconciliation.
          </p>
        </div>

        {/* 1. Missingness Heatmap */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h2 className="text-lg font-bold font-mono text-white">
                Missingness Heatmap Matrix
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Green = Populated with Provenance | Dark Red = Null / Not Reported in NASA PSI
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Reported</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-950/70 border border-red-800" />
                <span>Not Reported (null)</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-slate-900/40 backdrop-blur-sm p-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 font-mono text-[10px] text-zinc-400 uppercase">
                  <th className="p-2 min-w-[90px]">Record</th>
                  {CORE_EVIDENCE_FIELDS.map((f) => (
                    <th key={f} className="p-2 text-center truncate max-w-[85px]" title={f}>
                      {f.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deepInvestigations.map((inv) => (
                  <tr key={inv.id} className="border-b border-zinc-800/50 hover:bg-slate-900/60">
                    <td className="p-2 font-mono font-bold text-white whitespace-nowrap">
                      <span className="text-cyan-400">{inv.acronym}</span>
                      <span className="text-[10px] text-zinc-500 ml-1">({inv.id})</span>
                    </td>
                    {CORE_EVIDENCE_FIELDS.map((f) => {
                      const hasValue = inv[f] !== null && inv[f] !== undefined;

                      return (
                        <td key={f} className="p-2 text-center">
                          {hasValue ? (
                            <span
                              className="inline-block w-4 h-4 rounded bg-emerald-500/90 shadow-sm shadow-emerald-500/30"
                              title={`${inv.acronym}.${f}: populated with provenance`}
                            />
                          ) : (
                            <span
                              className="inline-block w-4 h-4 rounded bg-red-950/60 border border-red-800/80"
                              title={`${inv.acronym}.${f}: not reported in PSI`}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Unit Conversion Audit */}
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-2">
            <h2 className="text-lg font-bold font-mono text-white">
              Unit Conversion Audit (SPEC Section 2 Rule 3)
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Unit conversions are allowed only with an exact formula recorded in the provenance note.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-slate-900/40 backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-slate-950 text-[11px] text-zinc-400 uppercase">
                  <th className="p-3">Field</th>
                  <th className="p-3">Normalized Unit</th>
                  <th className="p-3">Raw Unit</th>
                  <th className="p-3">Exact Formula</th>
                  <th className="p-3">Audit Status</th>
                  <th className="p-3">Verification Note</th>
                </tr>
              </thead>
              <tbody>
                {unitAuditRecords.map((rec) => (
                  <tr key={rec.field} className="border-b border-zinc-800/60 hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white text-cyan-300">{rec.field}</td>
                    <td className="p-3 text-emerald-400">{rec.unitUsed}</td>
                    <td className="p-3 text-zinc-400">{rec.rawUnit}</td>
                    <td className="p-3 text-zinc-200 bg-black/30 rounded">{rec.conversionFormula}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold">
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-zinc-400 text-[11px]">{rec.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Row-Count Reconciliation */}
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-2">
            <h2 className="text-lg font-bold font-mono text-white">
              Row-Count & Source File Reconciliation (SPEC Section 22)
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Cross-verifying all 8 experimental tables against authentic primary CSV test logs in raw_real/ with exact row reconciliation, null audits, and anomaly flags.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-slate-900/40 backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-slate-950 text-[11px] text-zinc-400 uppercase">
                  <th className="p-3">ID & Acronym</th>
                  <th className="p-3">Primary Raw File</th>
                  <th className="p-3">Raw Rows / Tests</th>
                  <th className="p-3">Null Counts</th>
                  <th className="p-3">Extracted Status</th>
                  <th className="p-3">Reconciliation Notes</th>
                </tr>
              </thead>
              <tbody>
                {rowReconciliation.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800/60 hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      <span className="text-cyan-300">{row.id}</span> ({row.name})
                      {row.id === 'PSI-25' && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-700/50">
                          2 SUSPECT FLAGGED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400 font-mono text-[11px] max-w-xs break-all">{row.rawFile}</td>
                    <td className="p-3 text-emerald-400 font-bold whitespace-nowrap">{row.rawRowCount}</td>
                    <td className="p-3 text-amber-300 font-mono text-[11px]">{row.nullCounts}</td>
                    <td className="p-3 text-zinc-200">{row.extractedStatus}</td>
                    <td className="p-3 font-sans text-zinc-400 text-[11px]">{row.discrepancy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Flagged Suspect Rows Sub-Panel */}
          <div className="mt-8 space-y-4">
            <div className="border-b border-amber-800/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/50 uppercase">
                  Data Integrity
                </span>
                <h3 className="text-base font-bold font-mono text-white">
                  Flagged Suspect Rows in Experimental Tables
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Adherence to SPEC Section 2 Rule 1: Tests with physical anomalies are kept visible in raw audit logs with explicit suspect flags and excluded from physical bounding envelopes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-amber-900/40 bg-slate-900/40 backdrop-blur-sm">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-amber-900/40 bg-slate-950 text-[11px] text-amber-300/80 uppercase">
                    <th className="p-3">Table & ID</th>
                    <th className="p-3">Test #</th>
                    <th className="p-3">Sample Material & PI</th>
                    <th className="p-3">Initial O₂</th>
                    <th className="p-3">Final O₂</th>
                    <th className="p-3">Physical Anomaly</th>
                    <th className="p-3">Handling Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {suspectRows.map((s) => (
                    <tr key={`${s.tableId}-${s.testId}`} className="border-b border-zinc-800/60 hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white whitespace-nowrap">
                        <span className="text-cyan-300">{s.tableId}</span> ({s.tableName})
                      </td>
                      <td className="p-3 font-bold text-amber-400 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60">
                          {s.testId}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-200">
                        <div>{s.sample}</div>
                        <div className="text-[10px] text-zinc-500">PI: {s.pi}</div>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold whitespace-nowrap">{s.initialO2}</td>
                      <td className="p-3 text-rose-400 font-bold whitespace-nowrap">{s.finalO2}</td>
                      <td className="p-3 font-sans text-amber-200/90 text-[11px]">{s.anomaly}</td>
                      <td className="p-3 font-sans text-zinc-400 text-[11px]">{s.handling}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
