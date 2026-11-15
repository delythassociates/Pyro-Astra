'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Info,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import pathData from '@/data/analysis/path.json';
import { NearestPathBridge } from '@/components/NearestPathBridge';
import { AtmosphereFlowController } from '@/components/AtmosphereFlowController';
import { HoverTitleExplanation } from '@/components/HoverTitleExplanation';

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
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto font-sans">
      {/* Header with HoverTitleExplanation (Zero Static Subtitles) */}
      <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#EAE5DB] text-[#181615] border border-[#D5CFC2]">
            Exploration Transit Path
          </span>
          <span className="px-2.5 py-0.5 text-xs font-mono bg-[#FAF8F3] text-[#5A544A] border border-[#D5CFC2]">
            SPEC Section 8
          </span>
          <span className="px-2.5 py-0.5 text-xs font-mono bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] font-bold">
            Illustrative Scientific Metric, Not a Flight Trajectory
          </span>
        </div>

        <div>
          <HoverTitleExplanation
            title="Mission Atmosphere Gap Finder (Exploration Transit Path)"
            summary="Future NASA Artemis lunar habitats are engineered to operate at 34% oxygen and 8.2 psi (lower total atmospheric pressure speeds up preparation for astronaut spacewalks, while higher oxygen ensures adequate blood oxygenation). However, across NASA's public flight combustion archives, exactly zero spaceflight tests combine O₂ ≥ 30% with pressure ≤ 10.2 psi. This documentation distance highlights an empirical gap where microgravity flight data has never been collected."
            badge="Artemis Lunar Gap"
          />
        </div>
      </div>

      {/* GRAPH 5: Nearest-Evidence 2D Vector Bridge */}
      <section className="space-y-4">
        <div className="border-b border-[#D5CFC2] pb-2">
          <h2 className="text-base font-bold font-mono text-[#181615]">
            1. Nearest-Evidence Vector Bridge (Lunar &amp; Spacesuit)
          </h2>
          <p className="text-xs text-[#5A544A]">
            Breakdown of the parameter gap (ΔO₂, ΔPressure, and gravity) between exploration waypoints and nearest flight rows.
          </p>
        </div>
        <NearestPathBridge />
      </section>

      {/* Atmospheric Controller */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#181615]">
          Flow Regime &amp; Mission Atmosphere Simulator
        </h2>
        <AtmosphereFlowController />
      </section>

      {/* Waypoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {pathData.waypoints.map((wp: any) => (
          <div
            key={wp.id}
            className="p-4 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1.5"
          >
            <div className="text-[10px] text-[#736B5E] uppercase tracking-wider font-bold">
              Waypoint: {wp.id}
            </div>
            <div className="font-bold text-[#181615] text-sm">{wp.name}</div>
            <div className="text-[#5A544A] font-medium">
              O₂: <strong className="text-[#181615]">{wp.o2_pct}%</strong> · P: <strong className="text-[#181615]">{wp.pressure_psi} psi</strong>
            </div>
            <p className="text-[11px] text-[#5A544A] font-sans pt-1 border-t border-[#D5CFC2]">
              {wp.description}
            </p>
          </div>
        ))}
      </div>

      {/* 2. Continuous Trajectory Documentation Distance Curve */}
      <section className="bg-[#FAF8F3] border border-[#D5CFC2] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5CFC2] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#181615] font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1D4ED8]" />
              <span>2. Continuous Transit Trajectory Distance Curve</span>
            </h3>
            <p className="text-xs text-[#5A544A] mt-0.5">
              101 discrete transit steps from ISS (Step 0) to Lunar Habitat (Step 50) to Spacesuit EVA (Step 100).
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#EAE5DB] text-[#181615] border border-[#D5CFC2]">
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
                  <line x1={padLeft} y1={y} x2={padLeft + plotWidth} y2={y} stroke="#EAE5DB" strokeWidth="1" />
                  <text x={padLeft - 8} y={y + 3} textAnchor="end" fill="#736B5E" fontSize="9" fontFamily="monospace">
                    {dist.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Waypoint Reference Dividers */}
            <line x1={padLeft + (50 / 100) * plotWidth} y1={padTop} x2={padLeft + (50 / 100) * plotWidth} y2={padTop + plotHeight} stroke="#D5CFC2" strokeDasharray="3 3" />
            <text x={padLeft + (50 / 100) * plotWidth} y={padTop - 8} textAnchor="middle" fill="#C2410C" fontSize="10" fontFamily="monospace" fontWeight="bold">
              Lunar Habitat (Step 50)
            </text>

            <text x={padLeft} y={padTop - 8} textAnchor="start" fill="#1D4ED8" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ISS Cabin (Step 0)
            </text>
            <text x={padLeft + plotWidth} y={padTop - 8} textAnchor="end" fill="#C2410C" fontSize="10" fontFamily="monospace" fontWeight="bold">
              Spacesuit (Step 100)
            </text>

            {/* Distance Curve Line */}
            <polyline
              points={pointsString}
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="2.5"
            />

            {/* Current Step Crosshair Marker */}
            <line x1={currentX} y1={padTop} x2={currentX} y2={padTop + plotHeight} stroke="#736B5E" strokeDasharray="2 2" />
            <circle cx={currentX} cy={currentY} r="6" fill="#1D4ED8" stroke="#FAF8F3" strokeWidth="2" />
          </svg>
        </div>

        {/* Step Scrubber Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-mono text-[#5A544A]">
            <span>Step 0 (ISS Cabin)</span>
            <span className="font-bold text-[#181615]">
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
            className="w-full accent-[#1D4ED8] cursor-pointer"
          />
        </div>

        {/* Step Inspector Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#F4F1EA] border border-[#D5CFC2] text-xs font-mono">
          <div>
            <span className="text-[#736B5E] block text-[10px] uppercase tracking-wider mb-0.5">Atmosphere</span>
            <span className="font-bold text-[#181615]">{currentStep.o2_pct.toFixed(1)}% O₂</span> · <span className="font-bold text-[#181615]">{currentStep.pressure_psi.toFixed(1)} psi</span>
          </div>
          <div>
            <span className="text-[#736B5E] block text-[10px] uppercase tracking-wider mb-0.5">Evidence Distance</span>
            <span className="font-bold text-[#1D4ED8] text-sm">{currentStep.evidence_distance.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-[#736B5E] block text-[10px] uppercase tracking-wider mb-0.5">Nearest PSI Table</span>
            <span className="font-bold text-[#181615]">{currentStep.nearest_investigation?.id ?? 'FLEX-2'}</span>
          </div>
          <div>
            <span className="text-[#736B5E] block text-[10px] uppercase tracking-wider mb-0.5">Segment</span>
            <span className="text-[#5A544A] truncate block">{currentStep.segment}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
