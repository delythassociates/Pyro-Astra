'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass,
  Navigation,
  Info,
  ExternalLink,
  Sliders,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import pathData from '../../../data/analysis/path.json';

export default function PathPage() {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(30); // Default around transit to Moon
  const steps = pathData.path_steps;
  const currentStep = steps[currentStepIdx] || steps[0];

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const maxDist = pathData.summary.max_documentation_distance.distance;

  // Generate SVG Points
  const pointsString = useMemo(() => {
    return steps
      .map((s, idx) => {
        const x = padLeft + (idx / (steps.length - 1)) * plotWidth;
        const y = padTop + plotHeight - (s.evidence_distance / maxDist) * plotHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }, [steps, plotWidth, plotHeight, maxDist]);

  const currentX = padLeft + (currentStepIdx / (steps.length - 1)) * plotWidth;
  const currentY = padTop + plotHeight - (currentStep.evidence_distance / maxDist) * plotHeight;

  // Waypoint positions on chart
  const issX = padLeft;
  const lunarX = padLeft + (50 / (steps.length - 1)) * plotWidth;
  const suitX = padLeft + plotWidth;

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
              Workstream K
            </span>
            <span className="px-2.5 py-1 text-xs font-mono tracking-wider uppercase bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
              defined by the PYRO-ASTRA team
            </span>
            <span className="px-2.5 py-1 text-xs font-mono tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
              illustrative, not a mission profile.
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-blue-400" />
            Exploration Transit Documentation Distance
          </h1>
          <p className="text-zinc-400 max-w-3xl">
            Tracing normalized documentation evidence-distance from existing NASA PSI test records along a transit trajectory:
            ISS Cabin &rarr; Lunar Habitat &rarr; Spacesuit EVA.
          </p>

          {/* Mandatory Disclaimers */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-300">
                Scientific Note: distance measures documentation distance, not hazard.
              </p>
              <p className="text-xs text-blue-200/80">
                A high documentation distance means flight-tested microgravity combustion data is lacking for that specific atmosphere; it is not a prediction of fire risk or material behavior. Normalized on axes (O2 / 100, pressure / 14.7 psi) per Section 8.
              </p>
              <p className="text-xs text-amber-300 font-mono pt-1 border-t border-blue-500/20">
                Fuel-Phase Segregation: No single combined distance. Distances cannot be combined across different fuel phases (liquid droplet combustion in FLEX-2 does not document solid polymer flammability in BASS-II). The only solid-fuel O2 values we could source are BASS-II Table 5.1 (20 flat-PMMA tests, 16.8-22.2% O2); BASS, SAFFIRE-II and SAME do not report O2 in the public metadata.
              </p>
            </div>
          </div>
        </div>

        {/* Waypoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {pathData.waypoints.map((wp, idx) => (
            <div
              key={wp.id}
              className={`p-4 rounded-lg border transition-all ${
                (idx === 0 && currentStepIdx === 0) ||
                (idx === 1 && currentStepIdx === 50) ||
                (idx === 2 && currentStepIdx === 100)
                  ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">WAYPOINT {idx + 1}</span>
                <button
                  onClick={() => setCurrentStepIdx(idx === 0 ? 0 : idx === 1 ? 50 : 100)}
                  className="text-blue-400 hover:underline text-[10px]"
                >
                  Jump here
                </button>
              </div>
              <div className="text-sm font-bold text-white mb-2">{wp.name}</div>
              <div className="space-y-1 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Oxygen:</span>
                  <span className="font-bold text-blue-400">{wp.o2_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pressure:</span>
                  <span className="font-bold text-blue-400">{wp.pressure_psi} psi</span>
                </div>
                <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/80">
                  {wp.source}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Chart Container */}
        <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Documentation Gap Curve
              </h2>
              <p className="text-xs text-zinc-400">
                Normalized Euclidean distance from nearest verified NASA PSI deep record
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Well Documented (Dist = 0)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Exploration Gap (Dist &gt; 0.3)</span>
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[300px] select-none"
            >
              {/* Background grid */}
              <line
                x1={padLeft}
                y1={padTop}
                x2={padLeft}
                y2={padTop + plotHeight}
                stroke="#27272a"
                strokeWidth="1"
              />
              <line
                x1={padLeft}
                y1={padTop + plotHeight}
                x2={padLeft + plotWidth}
                y2={padTop + plotHeight}
                stroke="#27272a"
                strokeWidth="1"
              />

              {/* Waypoint vertical dashed lines */}
              <line
                x1={issX}
                y1={padTop}
                x2={issX}
                y2={padTop + plotHeight}
                stroke="#3f3f46"
                strokeDasharray="4 4"
              />
              <line
                x1={lunarX}
                y1={padTop}
                x2={lunarX}
                y2={padTop + plotHeight}
                stroke="#3f3f46"
                strokeDasharray="4 4"
              />
              <line
                x1={suitX}
                y1={padTop}
                x2={suitX}
                y2={padTop + plotHeight}
                stroke="#3f3f46"
                strokeDasharray="4 4"
              />

              {/* Labels on waypoints */}
              <text x={issX + 4} y={padTop + 14} fill="#a1a1aa" fontSize="10" fontFamily="monospace">
                ISS
              </text>
              <text x={lunarX + 4} y={padTop + 14} fill="#a1a1aa" fontSize="10" fontFamily="monospace">
                LUNAR HABITAT
              </text>
              <text x={suitX - 65} y={padTop + 14} fill="#a1a1aa" fontSize="10" fontFamily="monospace">
                SPACESUIT
              </text>

              {/* Distance Line */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Current scrubber indicator line */}
              <line
                x1={currentX}
                y1={padTop}
                x2={currentX}
                y2={padTop + plotHeight}
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <circle cx={currentX} cy={currentY} r="5" fill="#f59e0b" stroke="#000" strokeWidth="2" />

              {/* Y-axis labels */}
              <text x={padLeft - 8} y={padTop + 6} fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">
                {maxDist.toFixed(2)}
              </text>
              <text x={padLeft - 8} y={padTop + plotHeight} fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">
                0.00
              </text>
            </svg>
          </div>

          {/* Interactive Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Transit Progress: {currentStep.path_fraction * 100}%
              </span>
              <span>{currentStep.segment}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentStepIdx}
              onChange={(e) => setCurrentStepIdx(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>Step 0 (ISS Cabin)</span>
              <span>Step 50 (Lunar Habitat)</span>
              <span>Step 100 (Spacesuit EVA)</span>
            </div>
          </div>
        </div>

        {/* Current State Inspector Card */}
        <div className="p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">STEP {currentStep.step} OF 100</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Current Environment:</span>
                <span className="text-blue-400 font-mono">{currentStep.o2_pct}% O2</span>
                <span className="text-zinc-500">·</span>
                <span className="text-blue-400 font-mono">{currentStep.pressure_psi} psi</span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">EVIDENCE DISTANCE</span>
              <span
                className={`text-2xl font-mono font-bold ${
                  currentStep.evidence_distance === 0
                    ? 'text-emerald-400'
                    : currentStep.evidence_distance > 0.3
                    ? 'text-amber-400'
                    : 'text-blue-400'
                }`}
              >
                {currentStep.evidence_distance.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nearest Record */}
            <div className="p-4 rounded bg-zinc-950 border border-zinc-800/80 space-y-2">
              <div className="text-xs font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>Nearest PSI Investigation</span>
                <span className="text-blue-400 font-bold">{currentStep.nearest_investigation.id}</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {currentStep.nearest_investigation.name} ({currentStep.nearest_investigation.acronym})
              </div>
              <div className="text-xs font-mono text-zinc-400 space-y-1">
                <div>
                  Tested Cabin O2: [{currentStep.nearest_investigation.tested_o2.min}%, {currentStep.nearest_investigation.tested_o2.max}%]
                </div>
                <div>
                  Tested Pressure: [{currentStep.nearest_investigation.tested_pressure_psi.min}, {currentStep.nearest_investigation.tested_pressure_psi.max}] psi
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={`https://doi.org/${currentStep.nearest_investigation.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                >
                  View NASA DOI: {currentStep.nearest_investigation.doi}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Gap Decomposition */}
            <div className="p-4 rounded bg-zinc-950 border border-zinc-800/80 space-y-2">
              <div className="text-xs font-mono text-zinc-500 uppercase">Normalized Distance Components</div>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Oxygen Axis (ΔO2 / 100):</span>
                    <span className="text-white font-bold">{currentStep.component_distances.normalized_d_o2}</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-400 h-full"
                      style={{ width: `${Math.min(100, (currentStep.component_distances.normalized_d_o2 / 0.8) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Pressure Axis (ΔP / 14.7 psi):</span>
                    <span className="text-white font-bold">{currentStep.component_distances.normalized_d_pressure}</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-400 h-full"
                      style={{ width: `${Math.min(100, (currentStep.component_distances.normalized_d_pressure / 0.8) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-800">
                  {currentStep.intersects_tested ? (
                    <span className="text-emerald-400 font-semibold">
                      ✓ Intersects verified PSI tested condition range.
                    </span>
                  ) : (
                    <span>Outside verified PSI tested conditions. Documentation distance = Euclidean norm.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-500">
          <div>PYRO-ASTRA Space Apps 2026 Challenge · Pre-registered Documentation Protocol</div>
          <div className="flex gap-4">
            <Link href="/readiness" className="text-blue-400 hover:underline">
              Readiness Check →
            </Link>
            <Link href="/functions" className="text-blue-400 hover:underline">
              Function Matrix →
            </Link>
            <Link href="/proposals" className="text-blue-400 hover:underline">
              Proposed Experiments →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
