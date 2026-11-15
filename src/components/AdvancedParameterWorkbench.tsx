'use client';

import React, { useState, useMemo } from 'react';
import { Val } from './Val';
import { InfoButton } from './InfoButton';
import type { RunDataPoint } from './CustomizableXYChart';
import type { Provenance } from '@/data/schema';

interface AdvancedParameterWorkbenchProps {
  runs: RunDataPoint[];
  o2: number;
  setO2: (val: number) => void;
  pressure: number;
  setPressure: (val: number) => void;
  gravity: '0g' | '0.16g' | '0.38g';
  setGravity: (g: '0g' | '0.16g' | '0.38g') => void;
  airflow: number;
  setAirflow: (v: number) => void;
  direction: 'opposed' | 'concurrent' | 'quiescent';
  setDirection: (d: 'opposed' | 'concurrent' | 'quiescent') => void;
  includeBurner: boolean;
  setIncludeBurner: (b: boolean) => void;
  o2Timing: 'initial' | 'final';
  setO2Timing: (t: 'initial' | 'final') => void;
  includeDialUnits: boolean;
  setIncludeDialUnits: (d: boolean) => void;
}

export function AdvancedParameterWorkbench({
  runs,
  o2,
  setO2,
  pressure,
  setPressure,
  gravity,
  setGravity,
  airflow,
  setAirflow,
  direction,
  setDirection,
  includeBurner,
  setIncludeBurner,
  o2Timing,
  setO2Timing,
  includeDialUnits,
  setIncludeDialUnits,
}: AdvancedParameterWorkbenchProps) {
  // Closeness Specification State
  const [closenessMode, setClosenessMode] = useState<'euclidean' | 'window'>('euclidean');
  const [distanceThreshold, setDistanceThreshold] = useState<number>(0.25);
  const [windowO2, setWindowO2] = useState<number>(3.0); // +/- %
  const [windowPsi, setWindowPsi] = useState<number>(1.5); // +/- psi

  // Unit conversions (Rule 3: exact formulas: 1 psi = 6.894757 kPa, 1 psi = 0.06894757 bar)
  const pressureKPa = (pressure * 6.894757).toFixed(1);
  const pressureBar = (pressure * 0.06894757).toFixed(3);

  // Compute nearest evidence rows based on current O2 & Pressure sliders
  const closestRows = useMemo(() => {
    const candidates: {
      run: RunDataPoint;
      runO2: number;
      runPsi: number;
      deltaO2: number;
      deltaPsi: number;
      distance: number;
      isInside: boolean;
    }[] = [];

    for (const r of runs) {
      let runO2Val = r.cabin_o2_pct;
      if (includeBurner && runO2Val === null && r.burner_flow_o2_pct !== null) {
        runO2Val = r.burner_flow_o2_pct;
      }
      const runPsiVal = r.pressure_psi;

      if (runO2Val !== null && runPsiVal !== null && !isNaN(runO2Val) && !isNaN(runPsiVal)) {
        const deltaO2 = runO2Val - o2;
        const deltaPsi = runPsiVal - pressure;
        // Standardized Euclidean distance on (O2/100, psi/14.7) from nearest.ts
        const normO2 = Math.abs(deltaO2) / 100.0;
        const normPsi = Math.abs(deltaPsi) / 14.7;
        const dist = Math.sqrt(normO2 * normO2 + normPsi * normPsi);

        let isInside = false;
        if (closenessMode === 'euclidean') {
          isInside = dist <= distanceThreshold;
        } else {
          isInside = Math.abs(deltaO2) <= windowO2 && Math.abs(deltaPsi) <= windowPsi;
        }

        candidates.push({
          run: r,
          runO2: runO2Val,
          runPsi: runPsiVal,
          deltaO2,
          deltaPsi,
          distance: dist,
          isInside,
        });
      }
    }

    // Sort by distance ascending
    candidates.sort((a, b) => a.distance - b.distance);

    return candidates.slice(0, 5);
  }, [runs, o2, pressure, includeBurner, closenessMode, distanceThreshold, windowO2, windowPsi]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
          <h2 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
            Parametric Workbench & Closeness Specification
          </h2>
        </div>
        <InfoButton guideTab="surrogate-models" title="Learn about parameter boundaries and nearest-evidence distance calculation" />
      </div>

      {/* Grid: 2 Columns of Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
        {/* LEFT COLUMN: Atmosphere & Gravity */}
        <div className="space-y-4">
          {/* 1. Oxygen Slider + Direct Input + Toggles */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Oxygen Concentration:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={o2}
                  onChange={(e) => setO2(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-16 px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold text-right"
                />
                <span className="text-slate-500">% O₂</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={o2}
              onChange={(e) => setO2(parseFloat(e.target.value))}
              className="w-full accent-sky-700 cursor-pointer"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={includeBurner}
                  onChange={(e) => setIncludeBurner(e.target.checked)}
                  className="rounded border-slate-300 text-sky-700"
                />
                <span>Include Burner Co-flow Streams (Rule 4)</span>
              </label>

              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400">Timing:</span>
                <button
                  type="button"
                  onClick={() => setO2Timing('initial')}
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    o2Timing === 'initial' ? 'bg-sky-100 text-sky-800' : 'text-slate-500'
                  }`}
                >
                  Initial O₂
                </button>
                <button
                  type="button"
                  onClick={() => setO2Timing('final')}
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    o2Timing === 'final' ? 'bg-sky-100 text-sky-800' : 'text-slate-500'
                  }`}
                >
                  Final O₂
                </button>
              </div>
            </div>
          </div>

          {/* 2. Atmospheric Pressure Slider + Unit Conversions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Atmospheric Pressure:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={pressure}
                  onChange={(e) => setPressure(Math.max(0, Math.min(20, parseFloat(e.target.value) || 0)))}
                  className="w-16 px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold text-right"
                />
                <span className="text-slate-500">psi</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={pressure}
              onChange={(e) => setPressure(parseFloat(e.target.value))}
              className="w-full accent-sky-700 cursor-pointer"
            />

            {/* Exact Unit Conversion Readout (Rule 3) */}
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Normalized Readout:</span>
              <span className="font-semibold text-slate-800">
                {pressure.toFixed(1)} psi = {pressureKPa} kPa = {pressureBar} bar
              </span>
            </div>
          </div>

          {/* 3. Microgravity / Gravity Level Segmented Selector */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Gravity Regime:</span>
              <span className="text-[10px] text-slate-400">SPEC Rule 5</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGravity('0g')}
                className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  gravity === '0g'
                    ? 'bg-sky-100 text-sky-900 border-sky-300 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Orbital μg</div>
                <div className="text-[10px] text-emerald-700 font-normal">Active (100% rows)</div>
              </button>

              <button
                type="button"
                onClick={() => setGravity('0.16g')}
                className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  gravity === '0.16g'
                    ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Lunar 0.16g</div>
                <div className="text-[10px] text-rose-700 font-normal">0 Rows (Unmeasured)</div>
              </button>

              <button
                type="button"
                onClick={() => setGravity('0.38g')}
                className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  gravity === '0.38g'
                    ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Martian 0.38g</div>
                <div className="text-[10px] text-rose-700 font-normal">0 Rows (Unmeasured)</div>
              </button>
            </div>

            {/* Instant Refusal Alert on Partial-G */}
            {gravity !== '0g' && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
                <strong>SPEC Rule 5 Refusal:</strong> NASA PSI holds 0 partial-gravity datasets. Predictions for {gravity} are prohibited; 0g and 1g serve strictly as bounds.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Airflow & Closeness Specification */}
        <div className="space-y-4">
          {/* 4. Airflow Velocity & Flow Direction */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Forced Airflow Velocity:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={airflow}
                  onChange={(e) => setAirflow(Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)))}
                  className="w-16 px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold text-right"
                />
                <span className="text-slate-500">cm/s</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={airflow}
              onChange={(e) => setAirflow(parseFloat(e.target.value))}
              className="w-full accent-sky-700 cursor-pointer"
            />

            {/* Flow Direction Selector */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] text-slate-500 font-semibold block">Flow Direction Orientation:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('opposed')}
                  className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-bold transition-all ${
                    direction === 'opposed'
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Opposed ⇄
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('concurrent')}
                  className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-bold transition-all ${
                    direction === 'concurrent'
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Concurrent ⇉
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('quiescent')}
                  className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-bold transition-all ${
                    direction === 'quiescent'
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Quiescent ◎
                </button>
              </div>
            </div>
          </div>

          {/* 5. Closeness / Nearest-Evidence Specification */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-800 font-bold">Target Closeness Search Radius:</span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setClosenessMode('euclidean')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    closenessMode === 'euclidean' ? 'bg-sky-100 text-sky-800' : 'text-slate-500'
                  }`}
                >
                  Euclidean Distance
                </button>
                <button
                  type="button"
                  onClick={() => setClosenessMode('window')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    closenessMode === 'window' ? 'bg-sky-100 text-sky-800' : 'text-slate-500'
                  }`}
                >
                  Explicit Window (±Δ)
                </button>
              </div>
            </div>

            {/* Tolerance Controls */}
            {closenessMode === 'euclidean' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Distance Tolerance (D_tol):</span>
                  <span className="font-bold text-slate-800">{distanceThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.01"
                  value={distanceThreshold}
                  onChange={(e) => setDistanceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-sky-700 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">
                  Formula: D = √[(ΔO₂/100)² + (ΔP/14.7)²] per nearest.ts
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block mb-1">Max ΔO₂ Tolerance:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={windowO2}
                      onChange={(e) => setWindowO2(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white rounded border border-slate-300 font-bold"
                    />
                    <span className="text-slate-500">±%</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Max ΔP Tolerance:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={windowPsi}
                      onChange={(e) => setWindowPsi(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white rounded border border-slate-300 font-bold"
                    />
                    <span className="text-slate-500">±psi</span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Closeness Readout Table */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Top Measured Runs Closest to Target ({o2}% O₂, {pressure} psi):
              </span>

              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-1.5">Run & Investigation</th>
                      <th className="p-1.5 text-right">O₂ / P Measured</th>
                      <th className="p-1.5 text-right">Gap (ΔO₂ / ΔP)</th>
                      <th className="p-1.5 text-center">Closeness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {closestRows.map((c) => (
                      <tr key={c.run.run_id} className="hover:bg-slate-50">
                        <td className="p-1.5 font-bold text-sky-800 whitespace-nowrap">
                          {c.run.investigation_acronym} <span className="text-slate-400 font-normal">({c.run.run_id})</span>
                        </td>
                        <td className="p-1.5 text-right whitespace-nowrap text-slate-800">
                          {c.runO2.toFixed(1)}% / {c.runPsi.toFixed(1)} psi
                        </td>
                        <td className="p-1.5 text-right whitespace-nowrap text-slate-500">
                          {c.deltaO2 >= 0 ? `+${c.deltaO2.toFixed(1)}` : c.deltaO2.toFixed(1)}% ·{' '}
                          {c.deltaPsi >= 0 ? `+${c.deltaPsi.toFixed(1)}` : c.deltaPsi.toFixed(1)} psi
                        </td>
                        <td className="p-1.5 text-center whitespace-nowrap">
                          {c.isInside ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              ✓ Inside (D={c.distance.toFixed(2)})
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                              D={c.distance.toFixed(2)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
