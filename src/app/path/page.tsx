'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Info,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import pathData from '../../../data/analysis/path.json';
import { NearestPathBridge } from '@/components/NearestPathBridge';
import { AtmosphereFlowController } from '@/components/AtmosphereFlowController';

export default function PathPage() {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(30); // Default transit step
  const steps = pathData.path_steps;
  const currentStep = steps[currentStepIdx] || steps[0];

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

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

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-10 max-w-[1840px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200 rounded">
            Exploration Transit Path
          </span>
          <span className="px-2.5 py-0.5 text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200 rounded">
            Defined by PYRO-ASTRA
          </span>
          <span className="px-2.5 py-0.5 text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
            Illustrative, not a flight trajectory
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-sky-700" />
          <span>Exploration Transit Documentation Distance</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-3xl">
          Tracing normalized documentation distance from existing NASA PSI test records along an exploration transit:
          <strong> ISS Cabin (21% O₂ / 14.7 psi) → Lunar Habitat (34% O₂ / 8.2 psi) → Spacesuit EVA (100% O₂ / 4.3 psi)</strong>.
        </p>

        {/* Mandatory Scientific Disclaimer */}
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 font-bold text-sky-900">
            <Info className="w-4 h-4 text-sky-700 shrink-0" />
            <span>Scientific Note: Distance measures documentation distance, not hazard.</span>
          </div>
          <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
            A high documentation distance means flight-tested microgravity combustion data is lacking for that specific atmosphere; it is never a prediction of fire risk. Distances are normalized across axes (O₂ / 100, pressure / 14.7 psi) per SPEC Section 8.
          </p>
        </div>
      </div>

      {/* GRAPH 5: Nearest-Evidence 2D Vector Bridge */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold font-mono text-slate-900">
            1. Nearest-Evidence Vector Bridge (Lunar & Spacesuit)
          </h2>
          <p className="text-xs text-slate-500">
            Breakdown of the parameter gap (ΔO₂, ΔPressure, and gravity) between exploration waypoints and nearest flight rows.
          </p>
        </div>
        <NearestPathBridge />
      </section>

      {/* Atmospheric Controller */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
          Flow Regime & Mission Atmosphere Simulator
        </h2>
        <AtmosphereFlowController />
      </section>

      {/* Waypoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {pathData.waypoints.map((wp: any) => (
          <div
            key={wp.id}
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5"
          >
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Waypoint: {wp.id}
            </div>
            <div className="font-bold text-slate-900 text-sm">{wp.name}</div>
            <div className="text-slate-700 font-medium">
              O₂: <strong className="text-slate-900">{wp.o2_pct}%</strong> · P: <strong className="text-slate-900">{wp.pressure_psi} psi</strong>
            </div>
            <p className="text-[11px] text-slate-500 font-sans pt-1 border-t border-slate-100">
              {wp.description}
            </p>
          </div>
        ))}
      </div>

      {/* 2. Continuous Trajectory Documentation Distance Curve */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-700" />
              <span>2. Continuous Transit Trajectory Distance Curve</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              101 discrete transit steps from ISS (Step 0) to Lunar Habitat (Step 50) to Spacesuit EVA (Step 100).
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
            Step {currentStepIdx} / 100 Selected
          </span>
        </div>

        {/* SVG Curve Canvas */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[640px] select-none">
            {/* Grid */}
            {[0, 0.2, 0.4, 0.6].map((dist) => {
              const y = padTop + plotHeight - (dist / maxDist) * plotHeight;
              return (
                <g key={`grid-${dist}`}>
                  <line x1={padLeft} y1={y} x2={padLeft + plotWidth} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={padLeft - 8} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                    {dist.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Waypoint Reference Dividers */}
            <line x1={padLeft + (50 / 100) * plotWidth} y1={padTop} x2={padLeft + (50 / 100) * plotWidth} y2={padTop + plotHeight} stroke="#cbd5e1" strokeDasharray="3 3" />
            <text x={padLeft + (50 / 100) * plotWidth} y={padTop - 8} textAnchor="middle" fill="#e11d48" fontSize="10" fontFamily="monospace" fontWeight="bold">
              Lunar Habitat (Step 50)
            </text>

            <text x={padLeft} y={padTop - 8} textAnchor="start" fill="#0284c7" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ISS Cabin (Step 0)
            </text>
            <text x={padLeft + plotWidth} y={padTop - 8} textAnchor="end" fill="#d97706" fontSize="10" fontFamily="monospace" fontWeight="bold">
              Spacesuit (Step 100)
            </text>

            {/* Distance Curve Line */}
            <polyline
              points={pointsString}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
            />

            {/* Current Step Crosshair Marker */}
            <line x1={currentX} y1={padTop} x2={currentX} y2={padTop + plotHeight} stroke="#94a3b8" strokeDasharray="2 2" />
            <circle cx={currentX} cy={currentY} r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          </svg>
        </div>

        {/* Step Scrubber Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-mono text-slate-600">
            <span>Step 0 (ISS Cabin)</span>
            <span className="font-bold text-sky-800">
              Trajectory Position: Step {currentStepIdx} ({currentStep.segment})
            </span>
            <span>Step 100 (Spacesuit)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentStepIdx}
            onChange={(e) => setCurrentStepIdx(parseInt(e.target.value, 10))}
            className="w-full accent-sky-700 cursor-pointer"
          />
        </div>

        {/* Step Inspector Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Atmosphere</span>
            <span className="font-bold text-slate-900">{currentStep.o2_pct.toFixed(1)}% O₂</span> · <span className="font-bold text-slate-900">{currentStep.pressure_psi.toFixed(1)} psi</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Evidence Distance</span>
            <span className="font-bold text-sky-900 text-sm">{currentStep.evidence_distance.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Nearest PSI Table</span>
            <span className="font-bold text-slate-900">{currentStep.nearest_investigation?.id ?? 'FLEX-2'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Segment</span>
            <span className="text-slate-700 truncate block">{currentStep.segment}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
