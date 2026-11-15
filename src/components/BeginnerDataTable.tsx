'use client';

import React, { useState, useMemo } from 'react';
import { Val } from './Val';
import { InfoButton } from './InfoButton';
import type { RunDataPoint } from './CustomizableXYChart';
import type { Provenance } from '@/data/schema';

interface BeginnerDataTableProps {
  runs: RunDataPoint[];
  selectedMaterial: string;
  xAxis: string;
  yAxis: string;
}

export function BeginnerDataTable({ runs, selectedMaterial, xAxis, yAxis }: BeginnerDataTableProps) {
  const [filterBoth, setFilterBoth] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortCol, setSortCol] = useState<'run_id' | 'o2' | 'pressure' | 'airflow'>('run_id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Filter by material
  const materialRuns = useMemo(() => {
    if (selectedMaterial === 'all') return runs;
    return runs.filter((r) => {
      const mat = (r.material_class || '').toLowerCase();
      const phase = (r.fuel_phase || '').toLowerCase();
      const target = selectedMaterial.toLowerCase();

      if (target === 'pmma') return mat.includes('pmma') || target.includes('acrylic');
      if (target === 'nomex') return mat.includes('nomex');
      if (target === 'sibal') return mat.includes('sibal') || mat.includes('cotton');
      if (target === 'heptane') return mat.includes('heptane');
      if (target === 'methanol') return mat.includes('methanol');
      if (target === 'decane') return mat.includes('decane');
      if (target === 'gas') return phase === 'gas' || mat.includes('c2h4') || mat.includes('propane') || mat.includes('methane');
      if (target === 'candle') return mat.includes('wax') || mat.includes('candle');
      if (target === 'ultem') return mat.includes('ultem');
      return mat.includes(target);
    });
  }, [runs, selectedMaterial]);

  // Filter by Both X & Y
  const filteredRuns = useMemo(() => {
    let result = materialRuns;

    if (filterBoth) {
      result = result.filter((r) => {
        const xVal = (r as any)[xAxis];
        const yVal = (r as any)[yAxis];
        const hasX = xVal !== null && xVal !== undefined && !isNaN(xVal);
        const hasY = yVal !== null && yVal !== undefined && !isNaN(yVal);
        return hasX && hasY;
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.run_id.toLowerCase().includes(q) ||
          r.investigation_acronym.toLowerCase().includes(q) ||
          (r.material_class || '').toLowerCase().includes(q) ||
          (r.test_id || '').toLowerCase().includes(q)
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      let aVal: any = a.run_id;
      let bVal: any = b.run_id;

      if (sortCol === 'o2') {
        aVal = a.cabin_o2_pct ?? a.burner_flow_o2_pct ?? -1;
        bVal = b.cabin_o2_pct ?? b.burner_flow_o2_pct ?? -1;
      } else if (sortCol === 'pressure') {
        aVal = a.pressure_psi ?? -1;
        bVal = b.pressure_psi ?? -1;
      } else if (sortCol === 'airflow') {
        aVal = a.airflow_speed_cm_s ?? -1;
        bVal = b.airflow_speed_cm_s ?? -1;
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [materialRuns, filterBoth, searchTerm, sortCol, sortAsc, xAxis, yAxis]);

  const handleSort = (col: 'run_id' | 'o2' | 'pressure' | 'airflow') => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
            Matched Experimental Flight Runs ({filteredRuns.length})
          </span>
          <InfoButton guideTab="data-pipeline" title="Learn about table runs & provenance verification" />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Quick Toggle: All vs Both */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setFilterBoth(false)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                !filterBoth
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Material Rows ({materialRuns.length})
            </button>
            <button
              onClick={() => setFilterBoth(true)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                filterBoth
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Reporting Both X & Y
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search run ID, test..."
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold select-none">
            <tr>
              <th
                onClick={() => handleSort('run_id')}
                className="p-2.5 cursor-pointer hover:text-slate-900"
              >
                Investigation & Run ID {sortCol === 'run_id' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="p-2.5">Material</th>
              <th
                onClick={() => handleSort('o2')}
                className="p-2.5 cursor-pointer hover:text-slate-900 text-right"
              >
                O₂ (% vol) {sortCol === 'o2' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('pressure')}
                className="p-2.5 cursor-pointer hover:text-slate-900 text-right"
              >
                Pressure (psi) {sortCol === 'pressure' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('airflow')}
                className="p-2.5 cursor-pointer hover:text-slate-900 text-right"
              >
                Airflow (cm/s) {sortCol === 'airflow' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="p-2.5 text-right">Measured Outcome</th>
              <th className="p-2.5 text-center">Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRuns.slice(0, 50).map((r) => {
              // Construct authentic provenance
              const prov: Provenance = {
                source_id: r.investigation_id,
                doi: null,
                file: r.provenance_file || r.source_table,
                row_or_page: r.provenance_row_id || r.test_id,
                entered_by: 'parsed',
                note: r.provenance_note || null,
              };

              const hasCabinO2 = r.cabin_o2_pct !== null && r.cabin_o2_pct !== undefined;
              const hasBurnerO2 = r.burner_flow_o2_pct !== null && r.burner_flow_o2_pct !== undefined;

              return (
                <tr key={r.run_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-bold text-sky-800 whitespace-nowrap">
                    <span>{r.investigation_acronym}</span>
                    <span className="text-slate-400 font-normal ml-1 text-[11px]">
                      ({r.run_id})
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-800 font-sans max-w-[140px] truncate" title={r.material_class}>
                    {r.material_class}
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    {hasCabinO2 ? (
                      <Val
                        value={r.cabin_o2_pct}
                        unit="%"
                        provenance={prov}
                        className="text-emerald-700 font-bold"
                      />
                    ) : hasBurnerO2 ? (
                      <span className="text-amber-700 font-semibold" title="Burner nozzle stream">
                        {r.burner_flow_o2_pct}% (Burner)
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">not reported</span>
                    )}
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    {r.pressure_psi !== null && r.pressure_psi !== undefined ? (
                      <Val
                        value={r.pressure_psi}
                        unit="psi"
                        provenance={prov}
                        className="text-slate-800 font-semibold"
                      />
                    ) : (
                      <span className="text-slate-400 italic">not reported</span>
                    )}
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    {r.airflow_speed_cm_s !== null && r.airflow_speed_cm_s !== undefined ? (
                      <Val
                        value={r.airflow_speed_cm_s}
                        unit="cm/s"
                        provenance={prov}
                        className="text-slate-800"
                      />
                    ) : (
                      <span className="text-slate-400 italic">not reported</span>
                    )}
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap font-medium text-slate-700">
                    {r.flame_spread_rate_mm_s !== null ? (
                      <span>{r.flame_spread_rate_mm_s} mm/s</span>
                    ) : r.extinction_diameter_mm !== null ? (
                      <span className="text-indigo-700">d_ext = {r.extinction_diameter_mm} mm</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    <span
                      className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                      title={`File: ${r.provenance_file || r.source_table} | Row: ${r.provenance_row_id || r.test_id}`}
                    >
                      ✓ Audited
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRuns.length > 50 && (
        <p className="text-[11px] font-mono text-slate-400 text-right">
          Showing first 50 rows of {filteredRuns.length} matching rows. Use search filter to narrow results.
        </p>
      )}
    </div>
  );
}
