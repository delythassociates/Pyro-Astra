'use client';

import React from 'react';
import { InfoButton } from './InfoButton';

interface IntuitiveFlowRegimeBarProps {
  airflowSpeed: number;
  flowDirection: 'opposed' | 'concurrent' | 'quiescent';
  gravityRegime: '0g' | '0.16g' | '0.38g';
}

export function IntuitiveFlowRegimeBar({
  airflowSpeed,
  flowDirection,
  gravityRegime,
}: IntuitiveFlowRegimeBarProps) {
  const isPartialG = gravityRegime === '0.16g' || gravityRegime === '0.38g';

  // Determine current active zone
  let activeZone: 'diffusive' | 'ventilated' | 'blowoff' | 'partial_g' = 'diffusive';
  if (isPartialG) {
    activeZone = 'partial_g';
  } else if (flowDirection === 'quiescent' || airflowSpeed < 0.1) {
    activeZone = 'diffusive';
  } else if (airflowSpeed <= 12) {
    activeZone = 'ventilated';
  } else {
    activeZone = 'blowoff';
  }

  // Position on spectrum bar (0 to 30 cm/s mapped to 0 to 100%)
  const pinPercent = Math.min(100, Math.max(0, (airflowSpeed / 30) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
            Interactive Flow Regime Spectrum & Vector Dynamics
          </span>
          <InfoButton guideTab="flow-regimes" title="Learn about diffusive, low-velocity ventilated, and blowoff regimes" />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">Airflow:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {flowDirection === 'quiescent' ? '0.0 cm/s (Quiescent)' : `${airflowSpeed.toFixed(1)} cm/s`}
          </span>
        </div>
      </div>

      {/* Main Grid: Gauge Spectrum on Left, Vector Mini-Diagram on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Horizontal Regime Spectrum Bar (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Active Regime Status Badge */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 uppercase font-semibold">Active Combustion Regime:</span>
            {activeZone === 'partial_g' ? (
              <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                ⚠️ Buoyancy-Coupled Partial Gravity ({gravityRegime}) — Unmeasured in PSI
              </span>
            ) : activeZone === 'diffusive' ? (
              <span className="px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 font-bold">
                Zone 1: Purely Diffusive Regime (Molecular D ≈ 0.2 cm²/s)
              </span>
            ) : activeZone === 'ventilated' ? (
              <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">
                Zone 2: Low-Velocity Ventilated Regime (Peak Microgravity Hazard)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300 font-bold">
                Zone 3: High-Velocity Convective / Blowoff Regime
              </span>
            )}
          </div>

          {/* Color Segmented Spectrum Bar */}
          <div className="relative pt-6 pb-2">
            {/* Live Animated Cursor Pin */}
            <div
              className="absolute top-0 transform -translate-x-1/2 transition-all duration-150 flex flex-col items-center"
              style={{ left: `${pinPercent}%` }}
            >
              <span className="font-mono text-[10px] font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-300 shadow-xs whitespace-nowrap">
                {flowDirection === 'quiescent' ? '0 cm/s' : `${airflowSpeed.toFixed(1)} cm/s`}
              </span>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-800" />
            </div>

            {/* Segmented Bar Track */}
            <div className="h-5 w-full rounded-xl overflow-hidden flex border border-slate-300 shadow-inner">
              {isPartialG ? (
                <div className="w-full h-full bg-gradient-to-r from-amber-400 via-rose-400 to-rose-600 flex items-center justify-center text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  Partial Gravity Buoyancy Override Active (0 PSI records)
                </div>
              ) : (
                <>
                  {/* Zone 1: Diffusive (0 to 1 cm/s -> ~5%) */}
                  <div
                    className={`h-full transition-opacity ${
                      activeZone === 'diffusive' ? 'bg-sky-500 opacity-100' : 'bg-sky-400 opacity-50'
                    }`}
                    style={{ width: '8%' }}
                    title="Zone 1: Purely Diffusive (~0 cm/s)"
                  />
                  {/* Zone 2: Ventilated Peak Hazard (1 to 12 cm/s -> ~35%) */}
                  <div
                    className={`h-full transition-opacity ${
                      activeZone === 'ventilated'
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500 opacity-100'
                        : 'bg-amber-300 opacity-40'
                    }`}
                    style={{ width: '37%' }}
                    title="Zone 2: Low-Velocity Ventilated (0.1 - 12 cm/s) - Peak Microgravity Hazard"
                  />
                  {/* Zone 3: High Velocity (12 to 30+ cm/s -> ~55%) */}
                  <div
                    className={`h-full transition-opacity ${
                      activeZone === 'blowoff' ? 'bg-slate-600 opacity-100' : 'bg-slate-300 opacity-40'
                    }`}
                    style={{ width: '55%' }}
                    title="Zone 3: Convective Cooling / Blowoff (> 12 cm/s)"
                  />
                </>
              )}
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0 cm/s (Quiescent)</span>
              <span>~5 cm/s (BASS-II Range)</span>
              <span>12 cm/s</span>
              <span>20 cm/s (ISS Cabin)</span>
              <span>30+ cm/s (Blowoff)</span>
            </div>
          </div>

          {/* 1-Line Technical Explanation */}
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            {activeZone === 'partial_g' ? (
              <span>
                Natural buoyant convection decouples in partial gravity. NASA PSI contains <strong>zero lunar (0.16g) or Martian (0.38g) records</strong>; 0g and 1g serve as physical bounds.
              </span>
            ) : activeZone === 'diffusive' ? (
              <span>
                Quiescent microgravity: fresh oxidizer arrives strictly via molecular diffusion. Flames form symmetric spherical reaction zones with slow burning rates.
              </span>
            ) : activeZone === 'ventilated' ? (
              <span>
                <strong>Spacecraft Cabin Hazard:</strong> Gentle forced ventilation supplies oxygen faster than diffusion without stripping heat from the reaction zone, enabling persistent flame spread.
              </span>
            ) : (
              <span>
                High-speed forced convection: airflow removes heat from the flame base faster than chemical heat release can sustain combustion, approaching convective blowoff.
              </span>
            )}
          </p>
        </div>

        {/* Right: Side-by-Side Vector Mini-Diagram (SVG 180x90px) (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500 uppercase font-semibold">
            <span>Vector Schematic</span>
            <span className="text-sky-800 font-bold capitalize">{flowDirection}</span>
          </div>

          <div className="w-[180px] h-[90px] bg-white rounded-lg border border-slate-200 relative overflow-hidden flex items-center justify-center shadow-2xs">
            <svg viewBox="0 0 180 90" className="w-full h-full">
              {/* Solid Fuel Slab */}
              <rect x="20" y="55" width="140" height="15" fill="#94a3b8" rx="2" />
              <text x="90" y="66" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                Fuel Surface
              </text>

              {/* Direction Specific Schematic */}
              {flowDirection === 'quiescent' ? (
                // Quiescent: Radial diffusion rings
                <g>
                  <circle cx="90" cy="40" r="18" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
                  <circle cx="90" cy="40" r="28" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                  <circle cx="90" cy="40" r="8" fill="#f59e0b" opacity="0.8" />
                  <text x="90" y="42" fill="#78350f" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    0g Spherical
                  </text>
                </g>
              ) : flowDirection === 'opposed' ? (
                // Opposed: Flame spread Right ->, Oxidizer Flow Left <-
                <g>
                  {/* Oxidizer Flow Arrows pointing LEFT */}
                  <g stroke="#0284c7" strokeWidth="2" fill="none">
                    <line x1="160" y1="25" x2="115" y2="25" markerEnd="url(#arrow-blue)" />
                    <line x1="160" y1="40" x2="125" y2="40" markerEnd="url(#arrow-blue)" />
                  </g>
                  {/* Flame shape tilted toward incoming flow */}
                  <path d="M 65 55 Q 75 25 90 28 Q 85 45 95 55 Z" fill="#f59e0b" opacity="0.85" />
                  <path d="M 72 55 Q 78 35 86 37 Q 83 48 89 55 Z" fill="#ef4444" opacity="0.9" />
                  {/* Flame Spread Arrow pointing RIGHT */}
                  <g stroke="#e11d48" strokeWidth="2" fill="none">
                    <line x1="40" y1="45" x2="65" y2="45" />
                    <polygon points="65,42 72,45 65,48" fill="#e11d48" />
                  </g>
                  <text x="45" y="38" fill="#be123c" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    Spread ➔
                  </text>
                  <text x="145" y="18" fill="#0369a1" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    Flow ⬅
                  </text>
                </g>
              ) : (
                // Concurrent: Flame spread Right ->, Oxidizer Flow Right ->
                <g>
                  {/* Oxidizer Flow Arrows pointing RIGHT */}
                  <g stroke="#0284c7" strokeWidth="2" fill="none">
                    <line x1="25" y1="25" x2="70" y2="25" />
                    <polygon points="70,22 77,25 70,28" fill="#0284c7" />
                    <line x1="25" y1="38" x2="60" y2="38" />
                    <polygon points="60,35 67,38 60,41" fill="#0284c7" />
                  </g>
                  {/* Flame shape stretched forward downstream */}
                  <path d="M 65 55 Q 90 20 135 35 Q 110 50 120 55 Z" fill="#f59e0b" opacity="0.85" />
                  <path d="M 72 55 Q 92 30 115 42 Q 100 52 105 55 Z" fill="#ef4444" opacity="0.9" />
                  {/* Concurrent Spread text */}
                  <text x="45" y="18" fill="#0369a1" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    Flow ➔
                  </text>
                  <text x="135" y="28" fill="#be123c" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    Accelerating ➔
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-center">
            {flowDirection === 'opposed'
              ? 'Opposed: Oxidizer opposes spread vector'
              : flowDirection === 'concurrent'
              ? 'Concurrent: Oxidizer preheats downstream'
              : 'Quiescent: Radial diffusion envelope'}
          </div>
        </div>
      </div>
    </div>
  );
}
