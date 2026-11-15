'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Val } from './Val';
import { InfoButton } from './InfoButton';
import type { RunDataPoint } from './MaterialOutcomeVisualizer';
import type { Provenance } from '@/data/schema';
import { ChevronDown, ChevronRight, Eye, ShieldCheck } from 'lucide-react';

interface BeginnerDataTableProps {
  runs: RunDataPoint[];
  selectedMaterial: string;
  selectedRunId?: string | null;
  hoveredRunId?: string | null;
  onSelectRun?: (runId: string) => void;
  onHoverRun?: (runId: string | null) => void;
  xAxis?: string;
  yAxis?: string;
}

export function BeginnerDataTable({
  runs,
  selectedMaterial,
  selectedRunId,
  hoveredRunId,
  onSelectRun,
  onHoverRun,
}: BeginnerDataTableProps) {
  const [filterBoth, setFilterBoth] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortCol, setSortCol] = useState<'run_id' | 'o2' | 'pressure' | 'airflow' | 'outcome'>('run_id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  // References to table rows for auto-scroll synchronization
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // Auto-scroll selected row into view
  useEffect(() => {
    if (selectedRunId && rowRefs.current[selectedRunId]) {
      rowRefs.current[selectedRunId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedRunId]);

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

  // Filter by search and non-null outcomes
  const filteredRuns = useMemo(() => {
    let result = materialRuns;

    if (filterBoth) {
      result = result.filter(
        (r) =>
          (r.flame_spread_rate_mm_s !== null || r.extinction_diameter_mm !== null) &&
          (r.cabin_o2_pct !== null || r.calibrated_initial_o2_pct !== null)
      );
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
        aVal = a.cabin_o2_pct ?? a.calibrated_initial_o2_pct ?? -1;
        bVal = b.cabin_o2_pct ?? b.calibrated_initial_o2_pct ?? -1;
      } else if (sortCol === 'pressure') {
        aVal = a.pressure_psi ?? -1;
        bVal = b.pressure_psi ?? -1;
      } else if (sortCol === 'airflow') {
        aVal = a.airflow_speed_cm_s ?? -1;
        bVal = b.airflow_speed_cm_s ?? -1;
      } else if (sortCol === 'outcome') {
        aVal = a.flame_spread_rate_mm_s ?? a.extinction_diameter_mm ?? -1;
        bVal = b.flame_spread_rate_mm_s ?? b.extinction_diameter_mm ?? -1;
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [materialRuns, filterBoth, searchTerm, sortCol, sortAsc]);

  const handleSort = (col: 'run_id' | 'o2' | 'pressure' | 'airflow' | 'outcome') => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col h-full">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
            Experimental Data Table ({filteredRuns.length})
          </span>
          <InfoButton guideTab="data-pipeline" title="Learn about table runs & provenance verification" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Quick Toggle: All vs Plotted */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterBoth(false)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                !filterBoth
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Rows ({materialRuns.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterBoth(true)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                filterBoth
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Rows with Outcomes
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search run ID, test..."
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 w-36 sm:w-44"
          />
        </div>
      </div>

      {/* Table Container with Controlled Height to Match Graph */}
      <div className="overflow-x-auto max-h-[580px] border border-slate-200 rounded-xl overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold select-none shadow-xs">
            <tr>
              <th className="p-2.5 text-center w-8">#</th>
              <th
                onClick={() => handleSort('run_id')}
                className="p-2.5 cursor-pointer hover:text-slate-900"
              >
                Run ID {sortCol === 'run_id' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="p-2.5">Material</th>
              <th
                onClick={() => handleSort('o2')}
                className="p-2.5 cursor-pointer hover:text-slate-900 text-right"
              >
                O₂ (Init / Fin) {sortCol === 'o2' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('airflow')}
                className="p-2.5 cursor-pointer hover:text-slate-900 text-right"
              >
                Airflow {sortCol === 'airflow' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('outcome')}
                className="p-2.5 cursor-pointer hover:text-slate-900 text-right"
              >
                Measured Outcome {sortCol === 'outcome' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('pressure')}
                className="p-2.5 cursor-pointer hover:text-slate-900 text-right"
              >
                Pressure {sortCol === 'pressure' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="p-2.5 text-center">Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRuns.slice(0, 100).map((r) => {
              const isSelected = selectedRunId === r.run_id;
              const isHovered = hoveredRunId === r.run_id;
              const isExpanded = expandedRunId === r.run_id;

              // Construct authentic provenance object
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
              const finalO2 = r.calibrated_final_o2_pct;

              return (
                <React.Fragment key={r.run_id}>
                  <tr
                    ref={(el) => {
                      rowRefs.current[r.run_id] = el;
                    }}
                    onClick={() => {
                      if (onSelectRun) onSelectRun(r.run_id);
                    }}
                    onMouseEnter={() => {
                      if (onHoverRun) onHoverRun(r.run_id);
                    }}
                    onMouseLeave={() => {
                      if (onHoverRun) onHoverRun(null);
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-l-4 border-sky-600 font-semibold'
                        : isHovered
                        ? 'bg-slate-50 border-l-4 border-sky-300'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Expand Toggle */}
                    <td
                      className="p-2 text-center text-slate-400 hover:text-sky-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRunId(isExpanded ? null : r.run_id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 inline" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 inline" />
                      )}
                    </td>

                    {/* Run ID & Acronym */}
                    <td className="p-2.5 font-bold text-sky-800 whitespace-nowrap">
                      <span>{r.test_id || r.run_id}</span>
                      <span className="text-slate-400 font-normal ml-1 text-[10px]">
                        ({r.investigation_acronym})
                      </span>
                    </td>

                    {/* Material */}
                    <td className="p-2.5 text-slate-800 font-sans max-w-[120px] truncate" title={r.material_class}>
                      {r.material_class}
                    </td>

                    {/* O2 Concentration (Initial -> Final) */}
                    <td className="p-2.5 text-right whitespace-nowrap">
                      {hasCabinO2 ? (
                        <div className="flex flex-col items-end">
                          <Val
                            value={r.cabin_o2_pct}
                            unit="%"
                            provenance={prov}
                            className="text-emerald-700 font-bold"
                          />
                          {finalO2 !== null && finalO2 !== r.cabin_o2_pct && (
                            <span className="text-[10px] text-slate-400">
                              → {finalO2}%
                            </span>
                          )}
                        </div>
                      ) : hasBurnerO2 ? (
                        <span className="text-amber-700 font-semibold" title="Burner nozzle stream">
                          {r.burner_flow_o2_pct}% (Burner)
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">not reported</span>
                      )}
                    </td>

                    {/* Airflow Velocity */}
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

                    {/* Measured Outcome (Spread rate, extinction, duration) */}
                    <td className="p-2.5 text-right whitespace-nowrap font-medium text-slate-700">
                      {r.flame_spread_rate_mm_s !== null ? (
                        <span className="font-bold text-sky-900">
                          {r.flame_spread_rate_mm_s} mm/s
                        </span>
                      ) : r.extinction_diameter_mm !== null ? (
                        <span className="font-bold text-indigo-700">
                          D_ext: {r.extinction_diameter_mm} mm
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">not reported</span>
                      )}
                    </td>

                    {/* Pressure (psi) */}
                    <td className="p-2.5 text-right whitespace-nowrap">
                      {r.pressure_psi !== null && r.pressure_psi !== undefined ? (
                        <Val
                          value={Number(r.pressure_psi.toFixed(1))}
                          unit="psi"
                          provenance={prov}
                          className="text-slate-800 font-semibold"
                        />
                      ) : (
                        <span className="text-slate-400 italic">not reported</span>
                      )}
                    </td>

                    {/* Provenance Badge */}
                    <td className="p-2.5 text-center">
                      <span
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1"
                        title={`Audited: ${r.provenance_file || r.source_table} [Row ${r.provenance_row_id || r.test_id}]`}
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Audited</span>
                      </span>
                    </td>
                  </tr>

                  {/* Expandable Accordion: All Raw Cell Values */}
                  {isExpanded && (
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <td colSpan={8} className="p-3 text-[11px] font-mono">
                        <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                              Raw Flight Measurements: {r.test_id || r.run_id} ({r.investigation_acronym})
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              File: {r.provenance_file || r.source_table}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Sample Thickness:</span>
                              <span className="font-semibold">{r.sample_thickness_mm ?? 'Not reported'} mm</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Sample Width / Length:</span>
                              <span className="font-semibold">
                                {r.sample_width_cm ?? '—'} cm × {r.sample_length_cm ?? '—'} cm
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Burn Duration:</span>
                              <span className="font-semibold">
                                {r.burn_duration_s ? `${r.burn_duration_s} s (${(r.burn_duration_s / 60).toFixed(1)} min)` : 'Not reported'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Initial / Final CO₂:</span>
                              <span className="font-semibold">
                                {r.initial_co2_pct ?? '—'}% / {r.final_co2_pct ?? '—'}%
                              </span>
                            </div>
                          </div>

                          {r.provenance_note && (
                            <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                              Note: {r.provenance_note}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRuns.length > 100 && (
        <p className="text-[11px] font-mono text-slate-400 text-right">
          Showing first 100 of {filteredRuns.length} matching rows. Use search to filter specific test IDs.
        </p>
      )}
    </div>
  );
}
