'use client';

import React, { useState, useMemo } from 'react';
import { Val } from './Val';
import { InfoButton } from './InfoButton';
import type { Provenance } from '@/data/schema';
import {
  TrendingUp,
  BarChart3,
  Target,
  ArrowUpDown,
  Filter,
  Flame,
  Wind,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export interface RunDataPoint {
  run_id: string;
  investigation_id: string;
  investigation_acronym: string;
  source_table: string;
  test_id: string;
  material_class: string;
  fuel_phase: string;
  cabin_o2_pct: number | null;
  burner_flow_o2_pct: number | null;
  pressure_psi: number | null;
  airflow_speed_cm_s: number | null;
  sample_thickness_mm: number | null;
  sample_width_cm?: number | null;
  sample_length_cm?: number | null;
  initial_diameter_mm: number | null;
  flame_spread_rate_mm_s: number | null;
  extinction_diameter_mm: number | null;
  burn_duration_s?: number | null;
  calibrated_initial_o2_pct?: number | null;
  calibrated_final_o2_pct?: number | null;
  initial_co2_pct?: number | null;
  final_co2_pct?: number | null;
  initial_co_ppm?: number | null;
  final_co_ppm?: number | null;
  raw_data?: Record<string, any>;
  provenance_file: string;
  provenance_file_sha256: string;
  provenance_row_id: string;
  provenance_column?: string;
  provenance_note?: string;
}

export type VisualizerMode = 'scatter' | 'bars' | 'envelope';

export type NumericColumnKey =
  | 'flame_spread_rate_mm_s'
  | 'airflow_speed_cm_s'
  | 'cabin_o2_pct'
  | 'calibrated_final_o2_pct'
  | 'sample_thickness_mm'
  | 'initial_diameter_mm'
  | 'extinction_diameter_mm'
  | 'burn_duration_s'
  | 'pressure_psi';

interface ColumnMeta {
  key: NumericColumnKey;
  label: string;
  unit: string;
  defaultMin: number;
  defaultMax: number;
}

const NUMERIC_COLUMNS: ColumnMeta[] = [
  { key: 'flame_spread_rate_mm_s', label: 'Flame Spread Rate', unit: 'mm/s', defaultMin: 0, defaultMax: 0.1 },
  { key: 'airflow_speed_cm_s', label: 'Airflow Velocity', unit: 'cm/s', defaultMin: 0, defaultMax: 40 },
  { key: 'cabin_o2_pct', label: 'Initial Cabin Oxygen', unit: '% O₂', defaultMin: 10, defaultMax: 40 },
  { key: 'calibrated_final_o2_pct', label: 'Final Cabin Oxygen', unit: '% O₂', defaultMin: 10, defaultMax: 40 },
  { key: 'sample_thickness_mm', label: 'Fuel Thickness', unit: 'mm', defaultMin: 0, defaultMax: 6 },
  { key: 'initial_diameter_mm', label: 'Initial Droplet Diameter (D₀)', unit: 'mm', defaultMin: 0, defaultMax: 6 },
  { key: 'extinction_diameter_mm', label: 'Extinction Diameter (D_ext)', unit: 'mm', defaultMin: 0, defaultMax: 4 },
  { key: 'burn_duration_s', label: 'Burn Duration', unit: 's', defaultMin: 0, defaultMax: 600 },
  { key: 'pressure_psi', label: 'Chamber Pressure', unit: 'psi', defaultMin: 0, defaultMax: 20 },
];

interface MaterialOutcomeVisualizerProps {
  runs: RunDataPoint[];
  allRuns?: RunDataPoint[];
  selectedMaterial: string;
  selectedPreset: {
    id: string;
    name: string;
    o2: number;
    pressure: number;
    gravity: string;
  };
  selectedRunId?: string | null;
  hoveredRunId?: string | null;
  onSelectRun?: (runId: string) => void;
  onHoverRun?: (runId: string | null) => void;
}

export function MaterialOutcomeVisualizer({
  runs,
  allRuns = [],
  selectedMaterial,
  selectedPreset,
  selectedRunId,
  hoveredRunId,
  onSelectRun,
  onHoverRun,
}: MaterialOutcomeVisualizerProps) {
  // Visual Mode
  const [visualMode, setVisualMode] = useState<VisualizerMode>('scatter');

  // Mode 1 Dynamic Dropdowns
  const isDroplet = ['heptane', 'methanol', 'decane'].includes(selectedMaterial.toLowerCase());
  const [xAxisKey, setXAxisKey] = useState<NumericColumnKey>(
    isDroplet ? 'initial_diameter_mm' : 'airflow_speed_cm_s'
  );
  const [yAxisKey, setYAxisKey] = useState<NumericColumnKey>(
    isDroplet ? 'extinction_diameter_mm' : 'flame_spread_rate_mm_s'
  );
  const [colorByO2, setColorByO2] = useState<boolean>(true);

  // Mode 2 Sort Controls
  const [barSort, setBarSort] = useState<'rate' | 'airflow' | 'o2' | 'id'>('rate');

  // Compute non-null counts per column in the current material dataset
  const columnCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const col of NUMERIC_COLUMNS) {
      counts[col.key] = runs.filter((r) => {
        const val = (r as any)[col.key];
        return val !== null && val !== undefined && !isNaN(val);
      }).length;
    }
    return counts;
  }, [runs]);

  // Selected run point object
  const activeRun = useMemo(() => {
    if (!selectedRunId) return runs[0] || null;
    return runs.find((r) => r.run_id === selectedRunId) || runs[0] || null;
  }, [runs, selectedRunId]);

  // Plottable points for Mode 1
  const plottablePoints = useMemo(() => {
    return runs
      .map((r) => {
        const xRaw = (r as any)[xAxisKey];
        const yRaw = (r as any)[yAxisKey];
        if (xRaw === null || xRaw === undefined || isNaN(xRaw) || yRaw === null || yRaw === undefined || isNaN(yRaw)) {
          return null;
        }
        return {
          run: r,
          x: Number(xRaw),
          y: Number(yRaw),
          o2: r.cabin_o2_pct ?? r.calibrated_initial_o2_pct ?? 21,
          thickness: r.sample_thickness_mm ?? 1,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [runs, xAxisKey, yAxisKey]);

  // Dynamic X and Y bounds for Mode 1
  const xMeta = NUMERIC_COLUMNS.find((c) => c.key === xAxisKey) || NUMERIC_COLUMNS[1];
  const yMeta = NUMERIC_COLUMNS.find((c) => c.key === yAxisKey) || NUMERIC_COLUMNS[0];

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    if (plottablePoints.length === 0) {
      return {
        xMin: xMeta.defaultMin,
        xMax: xMeta.defaultMax,
        yMin: yMeta.defaultMin,
        yMax: yMeta.defaultMax,
      };
    }
    const xs = plottablePoints.map((p) => p.x);
    const ys = plottablePoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const xPadding = (maxX - minX) * 0.15 || 1;
    const yPadding = (maxY - minY) * 0.15 || 0.01;

    return {
      xMin: Math.max(0, minX - xPadding),
      xMax: maxX + xPadding,
      yMin: Math.max(0, minY - yPadding),
      yMax: maxY + yPadding,
    };
  }, [plottablePoints, xMeta, yMeta]);

  // Coordinate transformation helper
  const chartWidth = 560;
  const chartHeight = 320;
  const padding = { top: 25, right: 35, bottom: 45, left: 55 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const scaleX = (val: number) => {
    const range = xMax - xMin || 1;
    return padding.left + ((val - xMin) / range) * innerWidth;
  };

  const scaleY = (val: number) => {
    const range = yMax - yMin || 1;
    return padding.top + innerHeight - ((val - yMin) / range) * innerHeight;
  };

  // Color generator based on O2 concentration (13% - 35%)
  const getPointColor = (o2Val: number) => {
    if (o2Val >= 30) return '#e11d48'; // rose-600
    if (o2Val >= 25) return '#ea580c'; // orange-600
    if (o2Val >= 21) return '#0284c7'; // sky-600
    if (o2Val >= 18) return '#0d9488'; // teal-600
    return '#475569'; // slate-600
  };

  // Sorted runs for Mode 2
  const sortedBarRuns = useMemo(() => {
    const list = [...runs];
    if (barSort === 'rate') {
      list.sort((a, b) => {
        const aVal = a.flame_spread_rate_mm_s ?? a.extinction_diameter_mm ?? 0;
        const bVal = b.flame_spread_rate_mm_s ?? b.extinction_diameter_mm ?? 0;
        return bVal - aVal;
      });
    } else if (barSort === 'airflow') {
      list.sort((a, b) => (a.airflow_speed_cm_s ?? 0) - (b.airflow_speed_cm_s ?? 0));
    } else if (barSort === 'o2') {
      list.sort((a, b) => (a.cabin_o2_pct ?? 0) - (b.cabin_o2_pct ?? 0));
    } else {
      list.sort((a, b) => a.test_id.localeCompare(b.test_id));
    }
    return list;
  }, [runs, barSort]);

  // Mode 3 All Plottable Pressure vs O2 runs
  const mode3EnvelopeRuns = useMemo(() => {
    const dataset = allRuns.length > 0 ? allRuns : runs;
    return dataset.filter(
      (r) =>
        r.pressure_psi !== null &&
        !isNaN(r.pressure_psi) &&
        (r.cabin_o2_pct !== null || r.burner_flow_o2_pct !== null)
    );
  }, [allRuns, runs]);

  // Check if current material has O2 range but null pressure
  const materialO2Span = useMemo(() => {
    const validO2s = runs
      .map((r) => r.cabin_o2_pct ?? r.calibrated_initial_o2_pct)
      .filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
    const validP = runs.filter((r) => r.pressure_psi !== null && !isNaN(r.pressure_psi));

    if (validO2s.length > 0 && validP.length === 0) {
      return {
        min: Math.min(...validO2s),
        max: Math.max(...validO2s),
        count: validO2s.length,
      };
    }
    return null;
  }, [runs]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      {/* 1. TOP HEADER & SWITCHABLE 3-MODE TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse" />
            <h2 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider">
              Experimental Outcome Visualizer
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Directly plotting table measurements: flame spread rate, oxygen depletion, and droplet extinction.
          </p>
        </div>

        {/* 3 Switchable Mode Buttons */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 inline-flex items-center gap-1 shadow-xs">
          <button
            type="button"
            onClick={() => setVisualMode('scatter')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              visualMode === 'scatter'
                ? 'bg-white text-sky-800 shadow-sm border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. Outcome vs. Condition</span>
          </button>

          <button
            type="button"
            onClick={() => setVisualMode('bars')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              visualMode === 'bars'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>2. Run-by-Run Bars</span>
          </button>

          <button
            type="button"
            onClick={() => setVisualMode('envelope')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              visualMode === 'envelope'
                ? 'bg-white text-rose-800 shadow-sm border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>3. Atmosphere Target Map</span>
          </button>
        </div>
      </div>

      {/* 2. MODE 1: SMART OUTCOME VS. CONDITION SCATTER */}
      {visualMode === 'scatter' && (
        <div className="space-y-4">
          {/* Dynamic Column Selectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4">
              {/* Y Axis Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Y-Axis (Outcome):</span>
                <select
                  value={yAxisKey}
                  onChange={(e) => setYAxisKey(e.target.value as NumericColumnKey)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-bold focus:ring-1 focus:ring-sky-500"
                >
                  {NUMERIC_COLUMNS.map((col) => {
                    const count = columnCounts[col.key] || 0;
                    return (
                      <option key={col.key} value={col.key}>
                        {col.label} ({col.unit}) — {count}/{runs.length} rows {count === 0 ? '[Not Reported]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* X Axis Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">X-Axis (Condition):</span>
                <select
                  value={xAxisKey}
                  onChange={(e) => setXAxisKey(e.target.value as NumericColumnKey)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-bold focus:ring-1 focus:ring-sky-500"
                >
                  {NUMERIC_COLUMNS.map((col) => {
                    const count = columnCounts[col.key] || 0;
                    return (
                      <option key={col.key} value={col.key}>
                        {col.label} ({col.unit}) — {count}/{runs.length} rows {count === 0 ? '[Not Reported]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <span className="text-[11px] text-slate-500">
              Plotted: <strong className="text-sky-700">{plottablePoints.length}</strong> of {runs.length} rows
            </span>
          </div>

          {/* Physical Callout Banner */}
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs font-mono text-sky-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {selectedMaterial.toLowerCase().includes('pmma') ? (
                <span>
                  <strong>PMMA Solid Flame Spread:</strong> Measured flame spread rate (0.024–0.071 mm/s at 13.6%–22.2% O₂) plotted against airflow velocity. <strong>Gap Notice:</strong> Exactly 0 cabin-air PMMA rows in BASS-II were tested at the Lunar Habitat baseline (34% O₂, 8.2 psi).
                </span>
              ) : isDroplet ? (
                <span>
                  <strong>Liquid Droplet Combustion:</strong> Measured extinction diameter (D_ext) vs. initial droplet diameter (D₀) under microgravity diffusion.
                </span>
              ) : (
                <span>
                  <strong>Material Outcome Response:</strong> Plotting measured physical outcomes against experimental drivers. Hover any point to inspect row-level flight provenance.
                </span>
              )}
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto bg-slate-50 rounded-xl border border-slate-200 p-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto max-h-[380px] select-none"
            >
              {/* Axes Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                const y = padding.top + innerHeight * (1 - frac);
                const x = padding.left + innerWidth * frac;
                const yVal = yMin + (yMax - yMin) * frac;
                const xVal = xMin + (xMax - xMin) * frac;
                return (
                  <g key={frac}>
                    {/* Horizontal Grid */}
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + innerWidth}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {yVal.toFixed(yMax < 1 ? 3 : 1)}
                    </text>

                    {/* Vertical Grid */}
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={x}
                      y={padding.top + innerHeight + 15}
                      textAnchor="middle"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {xVal.toFixed(xMax < 1 ? 2 : 1)}
                    </text>
                  </g>
                );
              })}

              {/* Axis Labels */}
              <text
                x={padding.left + innerWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-slate-700 text-xs font-mono font-bold"
              >
                {xMeta.label} ({xMeta.unit})
              </text>

              <text
                x={-padding.top - innerHeight / 2}
                y={16}
                textAnchor="middle"
                transform="rotate(-90)"
                className="fill-slate-700 text-xs font-mono font-bold"
              >
                {yMeta.label} ({yMeta.unit})
              </text>

              {/* Plotted Points */}
              {plottablePoints.map((pt) => {
                const cx = scaleX(pt.x);
                const cy = scaleY(pt.y);
                const isSelected = selectedRunId === pt.run.run_id;
                const isHovered = hoveredRunId === pt.run.run_id;
                const ptColor = getPointColor(pt.o2);

                return (
                  <g
                    key={pt.run.run_id}
                    className="cursor-pointer transition-transform"
                    onClick={() => onSelectRun && onSelectRun(pt.run.run_id)}
                    onMouseEnter={() => onHoverRun && onHoverRun(pt.run.run_id)}
                    onMouseLeave={() => onHoverRun && onHoverRun(null)}
                  >
                    {/* Pulsing ring if selected or hovered */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={11}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth={2}
                        className="animate-ping opacity-75"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 7 : 5}
                      fill={ptColor}
                      stroke={isSelected ? '#0369a1' : '#ffffff'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* Point label badge */}
                    <text
                      x={cx + 8}
                      y={cy - 5}
                      className={`text-[9px] font-mono select-none ${
                        isSelected ? 'fill-sky-900 font-bold' : 'fill-slate-500'
                      }`}
                    >
                      {pt.run.test_id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 border-t border-slate-100 pt-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Point Color (O₂ %):</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span>&lt;18%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span>18–21%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span>21–25%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                <span>25–30%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>≥30% (FLEX / Habitats)</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-400">
              Click any point to inspect provenance and pulse table row.
            </span>
          </div>
        </div>
      )}

      {/* 3. MODE 2: RUN-BY-RUN DIRECT TABLE BARS */}
      {visualMode === 'bars' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 font-semibold">Sort Visual Tracks By:</span>
              <button
                type="button"
                onClick={() => setBarSort('rate')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  barSort === 'rate'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Spread / Consumption Rate
              </button>
              <button
                type="button"
                onClick={() => setBarSort('airflow')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  barSort === 'airflow'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Airflow Velocity
              </button>
              <button
                type="button"
                onClick={() => setBarSort('o2')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  barSort === 'o2'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Initial O₂
              </button>
              <button
                type="button"
                onClick={() => setBarSort('id')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  barSort === 'id'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Run ID
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              Showing <strong>{sortedBarRuns.length}</strong> physical tracks
            </span>
          </div>

          {/* List of Physical Run Tracks */}
          <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-1">
            {sortedBarRuns.map((r) => {
              const isSelected = selectedRunId === r.run_id;
              const isHovered = hoveredRunId === r.run_id;

              // Solid Flame Spread data
              const spreadRate = r.flame_spread_rate_mm_s;
              const maxExpectedRate = 0.08;
              const spreadPct = spreadRate ? Math.min(100, (spreadRate / maxExpectedRate) * 100) : 0;

              // Droplet Consumption data
              const d0 = r.initial_diameter_mm;
              const dext = r.extinction_diameter_mm;
              const hasDroplet = d0 !== null && dext !== null && d0 > 0;
              const pctConsumed = hasDroplet ? Math.max(0, Math.min(100, ((d0 - dext) / d0) * 100)) : 0;

              // O2 Depletion
              const o2Init = (r.calibrated_initial_o2_pct ?? r.cabin_o2_pct) ?? null;
              const o2Final = r.calibrated_final_o2_pct ?? null;
              const deltaO2 = o2Init !== null && o2Final !== null ? o2Final - o2Init : null;

              return (
                <div
                  key={r.run_id}
                  onClick={() => onSelectRun && onSelectRun(r.run_id)}
                  onMouseEnter={() => onHoverRun && onHoverRun(r.run_id)}
                  onMouseLeave={() => onHoverRun && onHoverRun(null)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer font-mono text-xs ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300 shadow-xs'
                      : isHovered
                      ? 'bg-slate-50 border-sky-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-bold text-[11px]">
                        {r.test_id || r.run_id}
                      </span>
                      <span className="font-bold text-slate-800">{r.material_class}</span>
                      <span className="text-[10px] text-slate-400">({r.investigation_acronym})</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {r.airflow_speed_cm_s !== null && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          Flow: {r.airflow_speed_cm_s} cm/s
                        </span>
                      )}
                      {r.sample_thickness_mm !== null && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          Thick: {r.sample_thickness_mm} mm
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Physical Visual Tracks */}
                  <div className="space-y-2">
                    {/* Track A: Flame Spread or Droplet Consumption Bar */}
                    {isDroplet && hasDroplet ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">
                            Droplet Consumed: Started at {d0} mm → Extinguished at {dext} mm
                          </span>
                          <span className="font-bold text-emerald-800">{pctConsumed.toFixed(1)}% Consumed</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                          <div
                            style={{ width: `${pctConsumed}%` }}
                            className="bg-emerald-500 h-full transition-all"
                            title={`Burned: ${pctConsumed.toFixed(1)}%`}
                          />
                          <div
                            style={{ width: `${100 - pctConsumed}%` }}
                            className="bg-amber-400 h-full transition-all"
                            title={`Extinguished Core: ${(100 - pctConsumed).toFixed(1)}%`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">
                            Measured Flame Spread Rate: {spreadRate !== null ? `${spreadRate} mm/s` : 'Not Reported'}
                          </span>
                          {r.burn_duration_s && (
                            <span className="text-slate-500">
                              Duration: {(r.burn_duration_s / 60).toFixed(1)} min ({r.burn_duration_s} s)
                            </span>
                          )}
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            style={{ width: `${spreadPct}%` }}
                            className="bg-sky-600 h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Track B: O2 Concentration & Depletion */}
                    {o2Init !== null && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span>Initial O₂: <strong className="text-slate-800">{o2Init}%</strong></span>
                          {o2Final !== null && (
                            <>
                              <span>→</span>
                              <span>Final O₂: <strong className="text-slate-800">{o2Final}%</strong></span>
                              {deltaO2 !== null && (
                                <span className={deltaO2 < 0 ? 'text-rose-700 font-semibold' : 'text-slate-600'}>
                                  (ΔO₂: {deltaO2 > 0 ? `+${deltaO2.toFixed(1)}` : deltaO2.toFixed(1)}%)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-slate-400">
                          Source: {r.provenance_row_id || r.test_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODE 3: PRESET ATMOSPHERE ENVELOPE (O2 VS PRESSURE WITH SHADED MATERIAL RANGE) */}
      {visualMode === 'envelope' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase">
                Atmospheric Envelope (O₂ % vs. Pressure psi)
              </span>
              <span className="text-sky-800 font-semibold">
                Target: {selectedPreset.name} ({selectedPreset.o2}% O₂, {selectedPreset.pressure} psi)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-sans">
              Mapping flight investigations against exploration baselines. Shaded horizontal bands show materials whose chamber pressure was not reported, but whose oxygen range was thoroughly characterized.
            </p>
          </div>

          {/* SVG Envelope Map */}
          <div className="w-full overflow-x-auto bg-slate-50 rounded-xl border border-slate-200 p-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto max-h-[380px] select-none"
            >
              {/* Target Exploration Box: Lunar Base (30–35% O2, 7.5–9.0 psi) */}
              <rect
                x={padding.left + (innerWidth * 7.5) / 20}
                y={padding.top + innerHeight * (1 - 35 / 100)}
                width={(innerWidth * 1.5) / 20}
                height={(innerHeight * 5) / 100}
                fill="#ffe4e6"
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <text
                x={padding.left + (innerWidth * 8.2) / 20}
                y={padding.top + innerHeight * (1 - 36 / 100)}
                textAnchor="middle"
                className="fill-rose-700 text-[10px] font-mono font-bold"
              >
                Lunar Base (34% O₂, 8.2 psi)
              </text>

              {/* Shaded Horizontal Band for BASS-II PMMA (13.6% - 22.2% O2 across all pressures) */}
              {materialO2Span && (
                <g>
                  <rect
                    x={padding.left}
                    y={padding.top + innerHeight * (1 - materialO2Span.max / 100)}
                    width={innerWidth}
                    height={(innerHeight * (materialO2Span.max - materialO2Span.min)) / 100}
                    fill="#e0f2fe"
                    fillOpacity={0.45}
                    stroke="#0284c7"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left + 15}
                    y={padding.top + innerHeight * (1 - materialO2Span.max / 100) + 14}
                    className="fill-sky-900 text-[10px] font-mono font-bold"
                  >
                    {selectedMaterial.toUpperCase()} Measured O₂ Range ({materialO2Span.min.toFixed(1)}% – {materialO2Span.max.toFixed(1)}% O₂ · Pressure = Not Reported)
                  </text>
                </g>
              )}

              {/* Grid Lines for O2 (0 - 100%) and Pressure (0 - 20 psi) */}
              {[0, 5, 10, 15, 20].map((psi) => {
                const x = padding.left + (innerWidth * psi) / 20;
                return (
                  <g key={psi}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="#e2e8f0"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={x}
                      y={padding.top + innerHeight + 15}
                      textAnchor="middle"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {psi} psi
                    </text>
                  </g>
                );
              })}

              {[0, 20, 40, 60, 80, 100].map((o2Val) => {
                const y = padding.top + innerHeight * (1 - o2Val / 100);
                return (
                  <g key={o2Val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + innerWidth}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {o2Val}%
                    </text>
                  </g>
                );
              })}

              {/* Axis Titles */}
              <text
                x={padding.left + innerWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-slate-700 text-xs font-mono font-bold"
              >
                Chamber Pressure (psi)
              </text>
              <text
                x={-padding.top - innerHeight / 2}
                y={16}
                textAnchor="middle"
                transform="rotate(-90)"
                className="fill-slate-700 text-xs font-mono font-bold"
              >
                Oxygen Concentration (% O₂)
              </text>

              {/* Plotted Rows with both O2 and Pressure */}
              {mode3EnvelopeRuns.slice(0, 300).map((r) => {
                const pVal = r.pressure_psi!;
                const o2Val = r.cabin_o2_pct ?? r.burner_flow_o2_pct ?? 21;
                const cx = padding.left + (innerWidth * Math.min(20, pVal)) / 20;
                const cy = padding.top + innerHeight * (1 - Math.min(100, o2Val) / 100);
                const isCabin = r.cabin_o2_pct !== null;

                return (
                  <circle
                    key={r.run_id}
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill={isCabin ? '#0284c7' : '#d97706'}
                    fillOpacity={0.7}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                );
              })}
            </svg>
          </div>

          {/* Envelope Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span>Cabin Air Rows (FLEX, SAFFIRE, BASS)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span>Burner Flow Streams (CFI-G, Flame Design)</span>
              </div>
            </div>
            <span className="text-rose-700 font-bold">
              0 Cabin-Air Rows Inside Target (34% O₂, 8.2 psi)
            </span>
          </div>
        </div>
      )}

      {/* 5. ACTIVE SELECTED POINT / PROVENANCE CARD */}
      {activeRun && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-900 text-sm">{activeRun.investigation_acronym}</span>
              <span className="text-slate-500">Run {activeRun.test_id || activeRun.run_id}</span>
              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">
                {activeRun.material_class}
              </span>
            </div>
            <span className="text-slate-500 text-[11px]">{activeRun.fuel_phase} fuel</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div>
              <span className="text-slate-500 block">Initial O₂:</span>
              <span className="font-bold text-slate-800">
                {activeRun.calibrated_initial_o2_pct ?? activeRun.cabin_o2_pct ?? 'Not reported'}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Flame Spread / Extinction:</span>
              <span className="font-bold text-slate-800">
                {activeRun.flame_spread_rate_mm_s !== null
                  ? `${activeRun.flame_spread_rate_mm_s} mm/s`
                  : activeRun.extinction_diameter_mm !== null
                  ? `${activeRun.extinction_diameter_mm} mm`
                  : 'Not reported'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Airflow Velocity:</span>
              <span className="font-bold text-slate-800">
                {activeRun.airflow_speed_cm_s !== null ? `${activeRun.airflow_speed_cm_s} cm/s` : 'Not reported'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Chamber Pressure:</span>
              <span className="font-bold text-slate-800">
                {activeRun.pressure_psi !== null ? `${activeRun.pressure_psi.toFixed(1)} psi` : 'Not reported'}
              </span>
            </div>
          </div>

          {/* Provenance Lineage */}
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span>
              Source File: <code className="text-slate-800 font-bold">{activeRun.provenance_file || activeRun.source_table}</code>
            </span>
            <span>
              Row/Page: <code className="text-slate-800 font-bold">{activeRun.provenance_row_id || activeRun.test_id}</code>
            </span>
            <span>
              SHA-256: <code className="text-slate-600">{activeRun.provenance_file_sha256?.slice(0, 12)}...</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
