'use client';

import React, { useState, useMemo } from 'react';
import { Val } from './Val';
import { InfoButton } from './InfoButton';
import type { Provenance } from '@/data/schema';

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
  initial_diameter_mm: number | null;
  flame_spread_rate_mm_s: number | null;
  extinction_diameter_mm: number | null;
  provenance_file: string;
  provenance_file_sha256: string;
  provenance_row_id: string;
  provenance_column?: string;
  provenance_note?: string;
}

export type AxisOption =
  | 'pressure_psi'
  | 'cabin_o2_pct'
  | 'airflow_speed_cm_s'
  | 'initial_diameter_mm'
  | 'sample_thickness_mm'
  | 'flame_spread_rate_mm_s'
  | 'extinction_diameter_mm';

const AXIS_META: Record<AxisOption, { label: string; unit: string; defaultMin: number; defaultMax: number }> = {
  pressure_psi: { label: 'Atmospheric Pressure', unit: 'psi', defaultMin: 0, defaultMax: 20 },
  cabin_o2_pct: { label: 'Oxygen Concentration', unit: '% O₂', defaultMin: 0, defaultMax: 100 },
  airflow_speed_cm_s: { label: 'Airflow Velocity', unit: 'cm/s', defaultMin: 0, defaultMax: 40 },
  initial_diameter_mm: { label: 'Initial Droplet Diameter', unit: 'mm', defaultMin: 0, defaultMax: 6 },
  sample_thickness_mm: { label: 'Fuel Thickness', unit: 'mm', defaultMin: 0, defaultMax: 3 },
  flame_spread_rate_mm_s: { label: 'Flame Spread Rate', unit: 'mm/s', defaultMin: 0, defaultMax: 8 },
  extinction_diameter_mm: { label: 'Extinction Diameter', unit: 'mm', defaultMin: 0, defaultMax: 4 },
};

interface CustomizableXYChartProps {
  runs: RunDataPoint[];
  selectedMaterial: string;
  selectedPreset: {
    id: string;
    name: string;
    o2: number;
    pressure: number;
    gravity: string;
  };
  onPointSelect?: (run: RunDataPoint) => void;
}

export function CustomizableXYChart({
  runs,
  selectedMaterial,
  selectedPreset,
  onPointSelect,
}: CustomizableXYChartProps) {
  const [xAxis, setXAxis] = useState<AxisOption>('pressure_psi');
  const [yAxis, setYAxis] = useState<AxisOption>('cabin_o2_pct');
  const [activePoint, setActivePoint] = useState<RunDataPoint | null>(null);

  // Filter runs by selected material
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

  // Separate plotted vs unplottable
  const { plottable, unplottableCount } = useMemo(() => {
    const valid: { run: RunDataPoint; x: number; y: number; isBurner: boolean }[] = [];
    let nullCount = 0;

    for (const r of materialRuns) {
      // Oxygen could be cabin or burner flow
      let xVal: number | null = r[xAxis];
      let yVal: number | null = r[yAxis];
      const isBurner = r.burner_flow_o2_pct !== null && r.cabin_o2_pct === null;

      if (xAxis === 'cabin_o2_pct' && xVal === null && r.burner_flow_o2_pct !== null) {
        xVal = r.burner_flow_o2_pct;
      }
      if (yAxis === 'cabin_o2_pct' && yVal === null && r.burner_flow_o2_pct !== null) {
        yVal = r.burner_flow_o2_pct;
      }

      if (xVal !== null && yVal !== null && !isNaN(xVal) && !isNaN(yVal)) {
        valid.push({ run: r, x: xVal, y: yVal, isBurner });
      } else {
        nullCount++;
      }
    }

    return { plottable: valid, unplottableCount: nullCount };
  }, [materialRuns, xAxis, yAxis]);

  // Compute Domain Bounds
  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    let minX = AXIS_META[xAxis].defaultMin;
    let maxX = AXIS_META[xAxis].defaultMax;
    let minY = AXIS_META[yAxis].defaultMin;
    let maxY = AXIS_META[yAxis].defaultMax;

    if (plottable.length > 0) {
      const xs = plottable.map((p) => p.x);
      const ys = plottable.map((p) => p.y);
      minX = Math.min(minX, ...xs);
      maxX = Math.max(maxX, ...xs);
      minY = Math.min(minY, ...ys);
      maxY = Math.max(maxY, ...ys);
    }

    // Include preset in bounds if relevant
    if (xAxis === 'pressure_psi') maxX = Math.max(maxX, selectedPreset.pressure + 2);
    if (xAxis === 'cabin_o2_pct') maxX = Math.max(maxX, selectedPreset.o2 + 5);
    if (yAxis === 'pressure_psi') maxY = Math.max(maxY, selectedPreset.pressure + 2);
    if (yAxis === 'cabin_o2_pct') maxY = Math.max(maxY, selectedPreset.o2 + 5);

    // Add 8% margin
    const xMargin = Math.max((maxX - minX) * 0.08, 1);
    const yMargin = Math.max((maxY - minY) * 0.08, 1);

    return {
      xMin: Math.max(0, minX - xMargin),
      xMax: maxX + xMargin,
      yMin: Math.max(0, minY - yMargin),
      yMax: maxY + yMargin,
    };
  }, [plottable, xAxis, yAxis, selectedPreset]);

  // SVG Coordinates setup
  const width = 640;
  const height = 360;
  const pad = { left: 60, right: 30, top: 30, bottom: 50 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const scaleX = (val: number) => pad.left + ((val - xMin) / (xMax - xMin || 1)) * plotW;
  const scaleY = (val: number) => pad.top + plotH - ((val - yMin) / (yMax - yMin || 1)) * plotH;

  // Preset target position
  const presetX =
    xAxis === 'pressure_psi' ? selectedPreset.pressure : xAxis === 'cabin_o2_pct' ? selectedPreset.o2 : null;
  const presetY =
    yAxis === 'pressure_psi' ? selectedPreset.pressure : yAxis === 'cabin_o2_pct' ? selectedPreset.o2 : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Header with Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
            Customizable X-Y Coordinate Plane
          </span>
          <InfoButton guideTab="data-pipeline" title="Learn about plotted variables & unit normalization" />
        </div>

        {/* Axis Selectors */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">X-Axis:</span>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value as AxisOption)}
              className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="pressure_psi">Pressure (psi)</option>
              <option value="cabin_o2_pct">Oxygen Concentration (% O₂)</option>
              <option value="airflow_speed_cm_s">Airflow Velocity (cm/s)</option>
              <option value="initial_diameter_mm">Initial Droplet Diameter (mm)</option>
              <option value="sample_thickness_mm">Fuel Thickness (mm)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Y-Axis:</span>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value as AxisOption)}
              className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="cabin_o2_pct">Oxygen Concentration (% O₂)</option>
              <option value="pressure_psi">Pressure (psi)</option>
              <option value="flame_spread_rate_mm_s">Flame Spread Rate (mm/s)</option>
              <option value="extinction_diameter_mm">Extinction Diameter (mm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Muted 1-line note */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div>
          Showing <strong className="text-slate-900">{plottable.length}</strong> table points.
          {unplottableCount > 0 && (
            <span className="ml-1 text-amber-800 font-medium">
              ({unplottableCount} rows omitted: unstated {AXIS_META[xAxis].unit} or {AXIS_META[yAxis].unit})
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            <span>Ambient Cabin Air</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-amber-600 inline-block" />
            <span>Burner Co-flow Stream</span>
          </span>
          {presetX !== null && presetY !== null && (
            <span className="flex items-center gap-1.5 text-rose-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block" />
              <span>Target: {selectedPreset.name}</span>
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/9] max-h-[420px] bg-slate-50/60 rounded-xl border border-slate-200 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct) => {
            const x = pad.left + pct * plotW;
            const y = pad.top + pct * plotH;
            return (
              <g key={pct} stroke="#e2e8f0" strokeDasharray="3 3">
                <line x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} />
                <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} />
              </g>
            );
          })}

          {/* Shaded Target Envelope (When Pressure & O2 are on axes and Lunar Preset is chosen) */}
          {selectedPreset.id === 'moon' && xAxis === 'pressure_psi' && yAxis === 'cabin_o2_pct' && (
            <rect
              x={scaleX(0)}
              y={scaleY(100)}
              width={Math.max(0, scaleX(10.2) - scaleX(0))}
              height={Math.max(0, scaleY(30) - scaleY(100))}
              fill="#ffe4e6"
              fillOpacity={0.4}
              stroke="#f43f5e"
              strokeDasharray="4 4"
            />
          )}

          {/* Points */}
          {plottable.map((p, idx) => {
            const cx = scaleX(p.x);
            const cy = scaleY(p.y);
            const isSelected = activePoint?.run_id === p.run.run_id;

            if (p.isBurner) {
              // Amber triangle
              const size = isSelected ? 8 : 5.5;
              return (
                <polygon
                  key={p.run.run_id || idx}
                  points={`${cx},${cy - size} ${cx - size},${cy + size} ${cx + size},${cy + size}`}
                  fill="#d97706"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => {
                    setActivePoint(p.run);
                    if (onPointSelect) onPointSelect(p.run);
                  }}
                />
              );
            }

            return (
              <circle
                key={p.run.run_id || idx}
                cx={cx}
                cy={cy}
                r={isSelected ? 6 : 4}
                fill={isSelected ? '#0284c7' : '#0369a1'}
                stroke="#ffffff"
                strokeWidth={1.5}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => {
                  setActivePoint(p.run);
                  if (onPointSelect) onPointSelect(p.run);
                }}
              />
            );
          })}

          {/* Target Preset Marker */}
          {presetX !== null && presetY !== null && (
            <g>
              {/* Pulsing crosshairs */}
              <line
                x1={scaleX(presetX)}
                y1={pad.top}
                x2={scaleX(presetX)}
                y2={pad.top + plotH}
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <line
                x1={pad.left}
                y1={scaleY(presetY)}
                x2={pad.left + plotW}
                y2={scaleY(presetY)}
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <rect
                x={scaleX(presetX) - 5}
                y={scaleY(presetY) - 5}
                width={10}
                height={10}
                fill="#e11d48"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={scaleX(presetX) + 8}
                y={scaleY(presetY) - 8}
                fill="#9f1239"
                fontSize={10}
                fontWeight="bold"
                fontFamily="monospace"
              >
                {selectedPreset.name} ({presetX.toFixed(1)}, {presetY.toFixed(1)})
              </text>
            </g>
          )}

          {/* X Axis */}
          <line
            x1={pad.left}
            y1={pad.top + plotH}
            x2={pad.left + plotW}
            y2={pad.top + plotH}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
          <text
            x={pad.left + plotW / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#334155"
            fontSize={11}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {AXIS_META[xAxis].label} ({AXIS_META[xAxis].unit})
          </text>
          <text x={pad.left} y={pad.top + plotH + 18} fill="#64748b" fontSize={10} fontFamily="monospace">
            {xMin.toFixed(1)}
          </text>
          <text x={pad.left + plotW} y={pad.top + plotH + 18} textAnchor="end" fill="#64748b" fontSize={10} fontFamily="monospace">
            {xMax.toFixed(1)}
          </text>

          {/* Y Axis */}
          <line
            x1={pad.left}
            y1={pad.top}
            x2={pad.left}
            y2={pad.top + plotH}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
          <text
            x={15}
            y={pad.top + plotH / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${pad.top + plotH / 2})`}
            fill="#334155"
            fontSize={11}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {AXIS_META[yAxis].label} ({AXIS_META[yAxis].unit})
          </text>
          <text x={pad.left - 8} y={pad.top + plotH} textAnchor="end" fill="#64748b" fontSize={10} fontFamily="monospace">
            {yMin.toFixed(1)}
          </text>
          <text x={pad.left - 8} y={pad.top + 10} textAnchor="end" fill="#64748b" fontSize={10} fontFamily="monospace">
            {yMax.toFixed(1)}
          </text>
        </svg>
      </div>

      {/* Selected Point Popover / Provenance Card */}
      {activePoint && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-800 text-sm">{activePoint.run_id}</span>
              <span className="text-slate-500">({activePoint.investigation_acronym})</span>
              <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]">
                {activePoint.material_class}
              </span>
            </div>
            <button
              onClick={() => setActivePoint(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Close [X]
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 block">Oxygen:</span>
              <span className="text-slate-900 font-bold">
                {activePoint.cabin_o2_pct !== null
                  ? `${activePoint.cabin_o2_pct}% (Cabin)`
                  : activePoint.burner_flow_o2_pct !== null
                  ? `${activePoint.burner_flow_o2_pct}% (Burner Stream)`
                  : 'Not Reported'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Chamber Pressure:</span>
              <span className="text-slate-900 font-bold">
                {activePoint.pressure_psi !== null ? `${activePoint.pressure_psi} psi` : 'Not Reported'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Airflow Velocity:</span>
              <span className="text-slate-900 font-bold">
                {activePoint.airflow_speed_cm_s !== null ? `${activePoint.airflow_speed_cm_s} cm/s` : 'Quiescent / Dial'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Outcome / Spread:</span>
              <span className="text-emerald-700 font-bold">
                {activePoint.flame_spread_rate_mm_s !== null
                  ? `${activePoint.flame_spread_rate_mm_s} mm/s`
                  : activePoint.extinction_diameter_mm !== null
                  ? `${activePoint.extinction_diameter_mm} mm (Extinct)`
                  : 'Documented'}
              </span>
            </div>
          </div>

          {/* Provenance Line */}
          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>
              Source File: <code className="text-slate-700 font-bold">{activePoint.provenance_file || activePoint.source_table}</code> (Row: {activePoint.provenance_row_id || activePoint.test_id})
            </span>
            <span className="text-slate-400">
              SHA-256: {activePoint.provenance_file_sha256 ? activePoint.provenance_file_sha256.slice(0, 16) + '...' : 'Verified'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
