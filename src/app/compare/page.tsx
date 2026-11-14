'use client';

import React, { useState } from 'react';
import { Val } from '@/components/Val';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import type { Investigation } from '@/data/schema';

export default function ComparePage() {
  const deepInvestigations = DEFAULT_INVESTIGATIONS.filter((i) => i.depth === 'deep');

  // Select 2 or 3 investigations
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
        // Replace the last item
        setSelectedIds([selectedIds[0], selectedIds[1], id]);
      }
    }
  };

  const selectedRecords = selectedIds
    .map((id) => DEFAULT_INVESTIGATIONS.find((i) => i.id === id))
    .filter((i): i is Investigation => i !== undefined);

  // Schema comparison fields definition
  interface FieldRow {
    label: string;
    key: keyof Investigation;
    render: (inv: Investigation) => React.ReactNode;
    compareDiff: (records: Investigation[]) => boolean;
  }

  const comparisonFields: FieldRow[] = [
    {
      label: 'Acronym & Full Name',
      key: 'name',
      render: (inv) => (
        <div>
          <strong className="text-white font-mono">{inv.acronym}</strong>
          <div className="text-[11px] text-zinc-400 font-sans">{inv.name}</div>
        </div>
      ),
      compareDiff: () => true,
    },
    {
      label: 'Safety Areas',
      key: 'safety_areas',
      render: (inv) => (
        <span className="font-mono uppercase text-xs text-cyan-300">
          {inv.safety_areas.join(', ')}
        </span>
      ),
      compareDiff: (records) => {
        const first = records[0]?.safety_areas.join(',');
        return records.some((r) => r.safety_areas.join(',') !== first);
      },
    },
    {
      label: 'Gravity Regimes',
      key: 'gravity_regimes',
      render: (inv) => (
        <span className="font-mono text-xs text-amber-300">
          {inv.gravity_regimes.join(', ')}
        </span>
      ),
      compareDiff: (records) => {
        const first = records[0]?.gravity_regimes.join(',');
        return records.some((r) => r.gravity_regimes.join(',') !== first);
      },
    },
    {
      label: 'Flight Hardware',
      key: 'hardware',
      render: (inv) => <Val val={inv.hardware} />,
      compareDiff: (records) => {
        const first = records[0]?.hardware?.value;
        return records.some((r) => r.hardware?.value !== first);
      },
    },
    {
      label: 'Primary Objectives',
      key: 'objectives',
      render: (inv) => <Val val={inv.objectives} className="font-sans text-xs" />,
      compareDiff: () => true,
    },
    {
      label: 'Fuels & Materials',
      key: 'fuels',
      render: (inv) => {
        if (inv.id === 'PSI-159') {
          return (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                  table-listed (179 rows):
                </span>
                <Val val={inv.fuels} />
              </div>
              <div className="pt-1.5 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  stated in metadata:
                </span>
                <Val
                  val={{
                    value: ['propane', 'n-butane', 'n-pentane'],
                    unit: null,
                    provenance: {
                      source_id: 'PSI-159',
                      doi: '10.60555/cyt1-kh64',
                      file: 'raw_real/PSI-159/investigation_metadata.json',
                      row_or_page: "data['objective'] (point 2) & data['hypothesis'] (point 2)",
                      entered_by: 'parsed',
                      note: 'Cool diffusion flame fuels stated in objective and hypothesis text',
                    },
                  }}
                />
              </div>
            </div>
          );
        }
        return <Val val={inv.fuels} />;
      },
      compareDiff: () => true,
    },
    {
      label: 'Sample Shape',
      key: 'sample_shape',
      render: (inv) => <Val val={inv.sample_shape} />,
      compareDiff: (records) => {
        const first = records[0]?.sample_shape?.value;
        return records.some((r) => r.sample_shape?.value !== first);
      },
    },
    {
      label: 'Sample Size',
      key: 'sample_size',
      render: (inv) => <Val val={inv.sample_size} />,
      compareDiff: (records) => {
        const first = records[0]?.sample_size?.value;
        return records.some((r) => r.sample_size?.value !== first);
      },
    },
    {
      label: 'Cabin O₂ Conc (% O₂)',
      key: 'cabin_o2_pct',
      render: (inv) => {
        if (inv.id === 'PSI-68') {
          return (
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  stated in metadata:
                </span>
                <Val val={inv.cabin_o2_pct} />
              </div>
              <div className="pt-1 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                  table-listed (8 rows):
                </span>
                <Val
                  val={{
                    value: [17, 21, 25, 30],
                    unit: '% (discrete candidate sets)',
                    provenance: {
                      source_id: 'PSI-68',
                      doi: '10.60555/byp8-h018',
                      file: 'raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv',
                      row_or_page: 'Oxygen Mole Fraction column, Rows 1-8',
                      entered_by: 'parsed',
                      note: 'Discrete oxygen concentrations 0.17, 0.21, 0.25, 0.30 mole fraction reported across 8 fuel rows',
                    },
                  }}
                />
              </div>
            </div>
          );
        }
        return <Val val={inv.cabin_o2_pct} />;
      },
      compareDiff: (records) => {
        const first = JSON.stringify(records[0]?.cabin_o2_pct?.value);
        return records.some((r) => JSON.stringify(r.cabin_o2_pct?.value) !== first);
      },
    },
    {
      label: 'Burner Flow O₂ Conc (% O₂)',
      key: 'burner_flow_o2_pct',
      render: (inv) => <Val val={inv.burner_flow_o2_pct} fallbackText="none (not burner flow)" />,
      compareDiff: (records) => {
        const first = JSON.stringify(records[0]?.burner_flow_o2_pct?.value);
        return records.some((r) => JSON.stringify(r.burner_flow_o2_pct?.value) !== first);
      },
    },
    {
      label: 'Pressure (psi)',
      key: 'pressure_psi',
      render: (inv) => {
        if (inv.id === 'PSI-69') {
          return (
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  stated in metadata:
                </span>
                <Val
                  val={{
                    value: { min: null, max: 22.04 },
                    unit: 'psi',
                    provenance: {
                      source_id: 'PSI-69',
                      doi: '10.60555/mbq8-0451',
                      file: 'raw_real/PSI-69/investigation_metadata.json',
                      row_or_page: "data['approach']",
                      entered_by: 'parsed',
                      note: 'Chamber pressure stated up to 1.5 atm (22.04 psi) in metadata approach',
                    },
                  }}
                />
              </div>
              <div className="pt-1 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                  table-listed (274 rows):
                </span>
                <Val val={inv.pressure_psi} />
              </div>
            </div>
          );
        }
        if (inv.id === 'PSI-68') {
          return (
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  stated in metadata:
                </span>
                <Val val={inv.pressure_psi} />
              </div>
              <div className="pt-1 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                  table-listed (8 rows):
                </span>
                <Val
                  val={{
                    value: [7.35, 14.70, 22.04, 29.39, 44.09],
                    unit: 'psi (0.5, 1.0, 1.5, 2.0, 3.0 atm)',
                    provenance: {
                      source_id: 'PSI-68',
                      doi: '10.60555/byp8-h018',
                      file: 'raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv',
                      row_or_page: 'Ambient Pressure (atm) column, Rows 1-8',
                      entered_by: 'parsed',
                      note: 'Candidate pressure levels 0.5, 1.0, 1.5, 2.0, 3.0 atm converted via 1 atm = 14.6959 psi',
                    },
                  }}
                />
              </div>
            </div>
          );
        }
        return <Val val={inv.pressure_psi} />;
      },
      compareDiff: (records) => {
        const first = JSON.stringify(records[0]?.pressure_psi?.value);
        return records.some((r) => JSON.stringify(r.pressure_psi?.value) !== first);
      },
    },
    {
      label: 'Airflow Speed (cm/s)',
      key: 'airflow_speed_cm_s',
      render: (inv) => {
        if (inv.id === 'PSI-99') {
          return (
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  stated in metadata:
                </span>
                <Val
                  val={{
                    value: { min: 20.0, max: 30.0, discrete_values: [20.0, 30.0] },
                    unit: 'cm/s',
                    provenance: {
                      source_id: 'PSI-99',
                      doi: '10.60555/2chp-m469',
                      file: 'raw_real/PSI-99/investigation_metadata.json',
                      row_or_page: "data['approach']",
                      entered_by: 'parsed',
                      note: 'Nominal forced test velocities of 20 and 30 cm/s stated in approach',
                    },
                  }}
                />
              </div>
              <div className="pt-1 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                  table-listed (15 rows):
                </span>
                <Val
                  val={{
                    value: 20.0,
                    unit: 'cm/s (9 of 15 rows; 6 unlisted)',
                    provenance: {
                      source_id: 'PSI-99',
                      doi: '10.60555/2chp-m469',
                      file: 'raw_real/PSI-99/experimental_table/PSI-99_Experimental table_SAFFIRE-2.csv',
                      row_or_page: 'Air Flow Speed (cm/s) column',
                      entered_by: 'parsed',
                      note: 'Airflow speed of 20 cm/s recorded for 9 samples; remaining 6 rows unlisted/blank',
                    },
                  }}
                />
              </div>
            </div>
          );
        }
        return <Val val={inv.airflow_speed_cm_s} />;
      },
      compareDiff: (records) => {
        const first = JSON.stringify(records[0]?.airflow_speed_cm_s?.value);
        return records.some((r) => JSON.stringify(r.airflow_speed_cm_s?.value) !== first);
      },
    },
    {
      label: 'Sensors & Diagnostics',
      key: 'sensors',
      render: (inv) => <Val val={inv.sensors} />,
      compareDiff: () => true,
    },
    {
      label: 'Number of Tests / Samples',
      key: 'n_tests',
      render: (inv) => <Val val={inv.n_tests} />,
      compareDiff: (records) => {
        const first = records[0]?.n_tests?.value;
        return records.some((r) => r.n_tests?.value !== first);
      },
    },
  ];

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-cyan-900/40 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <span>Side-by-Side Schema Evaluation</span>
            <span>·</span>
            <span>SPEC Section 11</span>
          </div>
          <h1 className="text-3xl font-black font-mono text-white mt-1">
            Investigation Multi-Comparison (2-Up / 3-Up)
          </h1>
          <p className="text-sm text-zinc-400 font-sans mt-1">
            Select 2 or 3 investigations to contrast test parameters, hardware, and physical variables. Differences between records are highlighted.
          </p>
        </div>

        {/* Selection Bar */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-cyan-900/40 space-y-3">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>Choose investigations to compare (2 to 3 active):</span>
            <span className="text-cyan-400 font-bold">{selectedIds.length} / 3 selected</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {deepInvestigations.map((inv) => {
              const isSelected = selectedIds.includes(inv.id);
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => handleToggleSelect(inv.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-cyan-600 text-white font-bold shadow'
                      : 'bg-slate-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <span>{inv.acronym}</span>
                  <span className="text-[10px] opacity-75">({inv.id})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-slate-900/40 backdrop-blur-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-slate-950">
                <th className="p-4 font-mono font-bold text-zinc-400 w-1/4 uppercase tracking-wider text-[11px]">
                  Schema Field
                </th>
                {selectedRecords.map((inv) => (
                  <th
                    key={inv.id}
                    className="p-4 font-mono font-bold text-white w-1/4 border-l border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base text-cyan-300">{inv.acronym}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-zinc-400 font-normal">
                        {inv.id}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field) => {
                const isDifferent = field.compareDiff(selectedRecords);

                return (
                  <tr
                    key={String(field.key)}
                    className={`border-b border-zinc-800/80 transition-colors ${
                      isDifferent ? 'bg-cyan-950/20 hover:bg-cyan-950/30' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-4 font-mono text-zinc-300 font-semibold align-top">
                      <div className="flex items-center gap-2">
                        {isDifferent && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-amber-400"
                            title="Values differ across records"
                          />
                        )}
                        <span>{field.label}</span>
                      </div>
                    </td>
                    {selectedRecords.map((inv) => (
                      <td
                        key={inv.id}
                        className="p-4 border-l border-zinc-800/80 align-top text-zinc-200"
                      >
                        {field.render(inv)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Internal Investigation Test Variability (SPEC Section 11) */}
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-2">
            <h2 className="text-lg font-bold font-mono text-white">
              Internal Test Variability within Each Investigation
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              SPEC Section 11: Which variables differed between tests within each investigation, and which stayed constant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedRecords.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-xl bg-slate-900/50 border border-zinc-800 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2 font-mono">
                  <span className="font-bold text-cyan-300">{inv.acronym}</span>
                  <span className="text-xs text-zinc-500">{inv.id}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                    Varied Variables (Within Investigation):
                  </span>
                  <div className="p-2.5 rounded bg-black/40 border border-zinc-800 text-xs font-mono">
                    <Val val={inv.varied_variables} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Constant Variables (Held Invariant):
                  </span>
                  <div className="p-2.5 rounded bg-black/40 border border-zinc-800 text-xs font-mono">
                    <Val val={inv.constant_variables} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
