'use client';

import React, { useState } from 'react';
import pathData from '../../data/analysis/path.json';
import { Compass, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function NearestPathBridge() {
  const [selectedWaypoint, setSelectedWaypoint] = useState<'lunar' | 'spacesuit'>('lunar');

  const waypoints = (pathData as any).waypoints ?? [];
  const summary = (pathData as any).summary ?? {};

  // Vector analysis
  const targetO2 = selectedWaypoint === 'lunar' ? 34.0 : 100.0;
  const targetP = selectedWaypoint === 'lunar' ? 8.2 : 4.3;
  const targetName = selectedWaypoint === 'lunar' ? 'Lunar Habitat' : 'Spacesuit EVA';

  // Nearest measured boundary in authentic cabin air
  // FLEX closest cabin row with O2 >= 30% is at 10.33 psi (30.0% O2)
  const nearestCabinO2 = 30.0;
  const nearestCabinP = 10.33;

  const deltaO2 = targetO2 - nearestCabinO2;
  const deltaP = targetP - nearestCabinP;

  // Normalized distance: sqrt((dO2/100)^2 + (dP/14.7)^2)
  const normDist = Math.sqrt(
    Math.pow(deltaO2 / 100, 2) + Math.pow(deltaP / 14.7, 2)
  ).toFixed(4);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-700" />
            <span>Exploration Waypoint Nearest-Evidence Vector Bridge</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Documentation distance from planned exploration atmospheres to the nearest empirical NASA PSI table rows.
          </p>
        </div>

        {/* Waypoint Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectedWaypoint('lunar')}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedWaypoint === 'lunar'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lunar Habitat (34% / 8.2 psi)
          </button>
          <button
            type="button"
            onClick={() => setSelectedWaypoint('spacesuit')}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedWaypoint === 'spacesuit'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spacesuit EVA (100% / 4.3 psi)
          </button>
        </div>
      </div>

      {/* Vector Bridge Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Source: Target Exploration Point */}
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-rose-700 font-bold">
            Target Exploration Point
          </div>
          <div className="font-bold text-base text-rose-950 font-mono">
            {targetName}
          </div>
          <div className="text-xs font-mono text-rose-800 space-y-0.5">
            <div>Oxygen: <strong className="text-rose-950">{targetO2}% O₂</strong></div>
            <div>Pressure: <strong className="text-rose-950">{targetP} psi</strong> ({(targetP * 6.894757).toFixed(1)} kPa)</div>
            <div>Gravity: <strong className="text-rose-950">{selectedWaypoint === 'lunar' ? '0.16 g (Moon)' : '0g / 0.16g'}</strong></div>
          </div>
          <div className="text-[10px] text-rose-600 pt-1 border-t border-rose-200">
            Source: NASA NTRS-20210022143
          </div>
        </div>

        {/* Vector Bridge Discrepancy */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Parameter Gap Vector (Δ)
          </div>
          <div className="flex items-center gap-2 text-sky-800 font-mono font-bold text-sm">
            <span>Target</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span>PSI Nearest</span>
          </div>
          <div className="text-xs font-mono text-slate-700 space-y-1">
            <div className="bg-white px-2.5 py-1 rounded border border-slate-200">
              ΔO₂: <strong className="text-slate-900">{deltaO2 >= 0 ? `+${deltaO2.toFixed(1)}` : deltaO2.toFixed(1)}%</strong>
            </div>
            <div className="bg-white px-2.5 py-1 rounded border border-slate-200">
              ΔPressure: <strong className="text-slate-900">{deltaP >= 0 ? `+${deltaP.toFixed(2)}` : deltaP.toFixed(2)} psi</strong>
            </div>
            <div className="bg-white px-2.5 py-1 rounded border border-slate-200 text-rose-700 font-semibold">
              ΔGravity: Missing partial-g axis
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Normalized 2D Distance: <strong className="text-slate-900 font-bold">{normDist}</strong>
          </div>
        </div>

        {/* Destination: Nearest Measured Table Row */}
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-sky-700 font-bold">
            Nearest Measured Table Row
          </div>
          <div className="font-bold text-base text-sky-950 font-mono">
            FLEX (PSI-69) Test 24
          </div>
          <div className="text-xs font-mono text-sky-800 space-y-0.5">
            <div>Oxygen: <strong className="text-sky-950">30.0% O₂</strong></div>
            <div>Pressure: <strong className="text-sky-950">10.33 psi</strong> (534.3 mmHg)</div>
            <div>Gravity: <strong className="text-sky-950">Microgravity (~10⁻⁶ g)</strong></div>
          </div>
          <div className="text-[10px] text-sky-700 pt-1 border-t border-sky-200 font-mono truncate">
            DOI: 10.60555/flex-psi69 · Flight Table Row
          </div>
        </div>
      </div>

      {/* Scientific Refusal Banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 leading-relaxed flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block mb-0.5">Scientific Disclaimer (SPEC Section 8):</strong>
          Distance measures <em>documentation distance</em> across normalized parameter axes, not hazard severity. Because NASA PSI holds zero partial-gravity records, bridge extrapolation is deterministically refused.
        </div>
      </div>
    </div>
  );
}

export default NearestPathBridge;
