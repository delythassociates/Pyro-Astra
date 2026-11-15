'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, Wind, Compass, Sparkles } from 'lucide-react';

export type GravityRegime = 'microgravity' | 'lunar' | 'martian';
export type FlowDirection = 'concurrent' | 'opposed' | 'quiescent';
export type OxidizerContext = 'cabin' | 'burner';

export interface AtmosphereState {
  o2Pct: number;
  pressurePsi: number;
  gravity: GravityRegime;
  flowDirection: FlowDirection;
  flowVelocity: number; // cm/s
  oxidizerContext: OxidizerContext;
  timingContext: 'initial' | 'final';
}

export interface AtmosphereFlowControllerProps {
  state?: AtmosphereState;
  onChange?: (state: AtmosphereState) => void;
  className?: string;
  showPresets?: boolean;
}

export function FlowRegimeDisplay({
  gravity,
  flowVelocity,
  flowDirection,
}: {
  gravity: GravityRegime;
  flowVelocity: number;
  flowDirection: FlowDirection;
}) {
  // Determine Flow Regime
  let regimeName = '';
  let regimeBadgeClass = '';
  let regimeDescription = '';
  let diagramType: 'diffusive' | 'concurrent' | 'opposed' | 'buoyant' = 'diffusive';

  if (gravity === 'lunar' || gravity === 'martian') {
    regimeName = 'Buoyancy-Coupled Regime (Unmeasured in Partial-G)';
    regimeBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300';
    regimeDescription =
      `Natural buoyant plume entrainment at ${gravity === 'lunar' ? '0.16 g' : '0.38 g'} is completely absent from NASA PSI tables. No validated partial-g combustion equations exist in the dataset.`;
    diagramType = 'buoyant';
  } else if (flowDirection === 'quiescent' || flowVelocity === 0) {
    regimeName = 'Purely Diffusive Regime (v ≈ 0 cm/s in μg)';
    regimeBadgeClass = 'bg-sky-50 text-sky-800 border-sky-300';
    regimeDescription =
      'Natural buoyancy is absent in microgravity. Transport of oxidizer occurs strictly via molecular diffusion, resulting in spherical flame envelopes and soot buildup (e.g. FLEX droplets).';
    diagramType = 'diffusive';
  } else if (flowVelocity <= 10) {
    regimeName = 'Low-Velocity Ventilated / Mixed Convective-Diffusive Regime (0.1 – 10 cm/s)';
    regimeBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    regimeDescription =
      'Slow forced cabin airflow supplies fresh oxidizer without inducing blowoff. This represents the peak spacecraft fire hazard explored in BASS-II and SAFFIRE where flame spread can exceed 1g rates.';
    diagramType = flowDirection === 'concurrent' ? 'concurrent' : 'opposed';
  } else {
    regimeName = 'Forced Convective / Blowoff-Dominated Regime (v > 15 cm/s)';
    regimeBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
    regimeDescription =
      'Higher ventilation speeds accelerate convective heat removal from the fuel pyrolysis zone, approaching thermal blowoff or stabilization limits depending on O₂ concentration.';
    diagramType = flowDirection === 'concurrent' ? 'concurrent' : 'opposed';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-700" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
            Physical Flow Regime Classification
          </h4>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${regimeBadgeClass}`}>
          {regimeName}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* SVG Schematic Diagram */}
        <div className="md:col-span-1 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Transport Schematic
          </div>
          <svg viewBox="0 0 200 100" className="w-full max-w-[180px] h-20 overflow-visible">
            {diagramType === 'diffusive' && (
              <g>
                {/* Fuel Droplet */}
                <circle cx="100" cy="50" r="14" fill="#0284c7" opacity="0.3" stroke="#0284c7" strokeWidth="1.5" />
                <circle cx="100" cy="50" r="5" fill="#0284c7" />
                {/* Radial diffusion arrows */}
                <path d="M 100 20 L 100 28" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow)" />
                <path d="M 100 80 L 100 72" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow)" />
                <path d="M 70 50 L 78 50" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow)" />
                <path d="M 130 50 L 122 50" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow)" />
                <text x="100" y="96" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#64748b">Spherical 0g Diffusion</text>
              </g>
            )}

            {diagramType === 'concurrent' && (
              <g>
                {/* Fuel slab */}
                <rect x="30" y="55" width="140" height="12" rx="2" fill="#94a3b8" />
                {/* Flame envelope */}
                <path d="M 60 55 C 80 35, 120 30, 150 55 Z" fill="#d97706" opacity="0.75" />
                {/* Co-flow arrows (same direction ->) */}
                <path d="M 30 25 L 80 25" stroke="#0284c7" strokeWidth="2" />
                <polygon points="80,21 88,25 80,29" fill="#0284c7" />
                <path d="M 100 25 L 150 25" stroke="#0284c7" strokeWidth="2" />
                <polygon points="150,21 158,25 150,29" fill="#0284c7" />
                <text x="100" y="92" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#0284c7">Co-Flow (Oxidizer → Flame Front →)</text>
              </g>
            )}

            {diagramType === 'opposed' && (
              <g>
                {/* Fuel slab */}
                <rect x="30" y="55" width="140" height="12" rx="2" fill="#94a3b8" />
                {/* Flame envelope */}
                <path d="M 50 55 C 70 30, 100 35, 120 55 Z" fill="#d97706" opacity="0.75" />
                {/* Opposed flow arrows (oxidizer <- vs flame front ->) */}
                <path d="M 160 25 L 110 25" stroke="#0284c7" strokeWidth="2" />
                <polygon points="110,21 102,25 110,29" fill="#0284c7" />
                <path d="M 40 78 L 80 78" stroke="#e11d48" strokeWidth="2" />
                <polygon points="80,74 88,78 80,82" fill="#e11d48" />
                <text x="100" y="95" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="#e11d48">Counter-Flow (Oxidizer ← | Flame →)</text>
              </g>
            )}

            {diagramType === 'buoyant' && (
              <g>
                {/* Fuel slab */}
                <rect x="40" y="65" width="120" height="10" rx="2" fill="#94a3b8" />
                {/* Elongated buoyant plume */}
                <path d="M 80 65 C 80 30, 95 10, 100 5 C 105 10, 120 30, 120 65 Z" fill="#e11d48" opacity="0.6" />
                {/* Warning question mark */}
                <text x="100" y="45" textAnchor="middle" fontSize="16" fontFamily="monospace" fontWeight="bold" fill="#be123c">?</text>
                <text x="100" y="92" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#be123c">Partial-G Plume (0 Rows in PSI)</text>
              </g>
            )}
          </svg>
        </div>

        {/* Narrative Description */}
        <div className="md:col-span-2 text-xs text-slate-600 leading-relaxed space-y-2">
          <p>{regimeDescription}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 pt-1">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              Velocity: <strong className="text-slate-900">{flowVelocity} cm/s</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              Direction: <strong className="text-slate-900 capitalize">{flowDirection}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              Gravity: <strong className="text-slate-900">{gravity === 'microgravity' ? 'μg (~10⁻⁶ g)' : gravity}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AtmosphereFlowController({
  state: externalState,
  onChange,
  className = '',
  showPresets = true,
}: AtmosphereFlowControllerProps) {
  const [internalState, setInternalState] = useState<AtmosphereState>({
    o2Pct: 21.0,
    pressurePsi: 14.7,
    gravity: 'microgravity',
    flowDirection: 'concurrent',
    flowVelocity: 5.0,
    oxidizerContext: 'cabin',
    timingContext: 'initial',
  });

  const state = externalState ?? internalState;

  const updateState = (patch: Partial<AtmosphereState>) => {
    const updated = { ...state, ...patch };
    if (!externalState) setInternalState(updated);
    if (onChange) onChange(updated);
  };

  const applyPreset = (preset: 'iss' | 'lunar' | 'spacesuit') => {
    if (preset === 'iss') {
      updateState({
        o2Pct: 21.0,
        pressurePsi: 14.7,
        gravity: 'microgravity',
        flowDirection: 'concurrent',
        flowVelocity: 5.0,
        oxidizerContext: 'cabin',
        timingContext: 'initial',
      });
    } else if (preset === 'lunar') {
      updateState({
        o2Pct: 34.0,
        pressurePsi: 8.2,
        gravity: 'lunar',
        flowDirection: 'concurrent',
        flowVelocity: 5.0,
        oxidizerContext: 'cabin',
        timingContext: 'initial',
      });
    } else if (preset === 'spacesuit') {
      updateState({
        o2Pct: 100.0,
        pressurePsi: 4.3,
        gravity: 'microgravity',
        flowDirection: 'quiescent',
        flowVelocity: 0.0,
        oxidizerContext: 'cabin',
        timingContext: 'initial',
      });
    }
  };

  const isPartialG = state.gravity === 'lunar' || state.gravity === 'martian';
  const isTargetZone = state.o2Pct >= 30.0 && state.pressurePsi <= 10.2;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Presets Bar */}
      {showPresets && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-700" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Atmospheric Mission Presets:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('iss')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                state.o2Pct === 21 && state.pressurePsi === 14.7 && state.gravity === 'microgravity'
                  ? 'bg-sky-100 text-sky-900 border border-sky-300 font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ISS Cabin (21% O₂ / 14.7 psi / μg)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('lunar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                state.o2Pct === 34 && state.pressurePsi === 8.2
                  ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                  : 'bg-rose-50/70 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              Lunar Habitat (34% O₂ / 8.2 psi / 0.16g)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('spacesuit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                state.o2Pct === 100 && state.pressurePsi === 4.3
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Spacesuit EVA (100% O₂ / 4.3 psi)
            </button>
          </div>
        </div>
      )}

      {/* Main Control Matrix Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
        {/* ROW 1: Oxygen & Pressure Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Oxygen Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span>Oxygen Concentration (O₂)</span>
                {state.o2Pct >= 30.0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    ≥ 30% Lunar Threshold
                  </span>
                )}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={state.o2Pct}
                  onChange={(e) => updateState({ o2Pct: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 text-right font-mono text-sm font-bold border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-xs font-mono text-slate-500 font-semibold">% O₂</span>
              </div>
            </div>

            {/* Slider with 30% indicator */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={state.o2Pct}
                onChange={(e) => updateState({ o2Pct: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>0% (Hypoxic)</span>
                <span className="text-slate-600 font-semibold">21% (Air)</span>
                <span className="text-rose-600 font-bold">30% (Threshold)</span>
                <span className="text-rose-700 font-bold">34% (Lunar)</span>
                <span>100% (Pure O₂)</span>
              </div>
            </div>

            {/* Oxidizer Context & Timing Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500">Stream Context:</span>
              <button
                type="button"
                onClick={() => updateState({ oxidizerContext: 'cabin' })}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors ${
                  state.oxidizerContext === 'cabin'
                    ? 'bg-sky-50 text-sky-800 border-sky-300 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Ambient Cabin Air O₂ (FLEX, BASS, SAFFIRE)
              </button>
              <button
                type="button"
                onClick={() => updateState({ oxidizerContext: 'burner' })}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors ${
                  state.oxidizerContext === 'burner'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Burner / Oxidizer-Stream (CFI-G, Flame Design)
              </button>

              {/* Timing Pill (Initial vs Final O2) */}
              <div className="ml-auto flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => updateState({ timingContext: 'initial' })}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    state.timingContext === 'initial'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Initial O₂
                </button>
                <button
                  type="button"
                  onClick={() => updateState({ timingContext: 'final' })}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    state.timingContext === 'final'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Final O₂ (BASS-II M1–M20)
                </button>
              </div>
            </div>
          </div>

          {/* Pressure Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span>Chamber / Ambient Pressure</span>
                {state.pressurePsi <= 10.2 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    ≤ 10.2 psi Lunar Regime
                  </span>
                )}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={state.pressurePsi}
                  onChange={(e) => updateState({ pressurePsi: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 text-right font-mono text-sm font-bold border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-xs font-mono text-slate-500 font-semibold">psi</span>
              </div>
            </div>

            {/* Slider with 10.2 psi cutoff indicator */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="25"
                step="0.1"
                value={state.pressurePsi}
                onChange={(e) => updateState({ pressurePsi: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>0 psi (Vacuum)</span>
                <span className="text-amber-700 font-bold">4.3 psi (Suit)</span>
                <span className="text-rose-700 font-bold">8.2 psi (Lunar)</span>
                <span className="text-rose-600 font-semibold">10.2 psi (Cutoff)</span>
                <span className="text-slate-600 font-semibold">14.7 psi (1 atm)</span>
                <span>25 psi</span>
              </div>
            </div>

            {/* Exact unit conversions info */}
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span>
                Equiv: <strong className="text-slate-800">{(state.pressurePsi * 6.894757).toFixed(1)} kPa</strong> ·{' '}
                <strong className="text-slate-800">{(state.pressurePsi * 51.7149).toFixed(0)} mmHg</strong>
              </span>
              <span className="text-[10px] text-slate-400">1 psi = 6.894757 kPa</span>
            </div>
          </div>
        </div>

        {/* ROW 2: Gravity & Flow Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {/* Gravity Regime Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 block">
              Gravity / Acceleration Regime:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateState({ gravity: 'microgravity' })}
                className={`p-2.5 rounded-lg border text-xs font-mono text-center transition-all ${
                  state.gravity === 'microgravity'
                    ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Microgravity (μg)</div>
                <div className="text-[10px] text-slate-500 font-normal">~10⁻⁶ g · Orbital / ISS</div>
              </button>
              <button
                type="button"
                onClick={() => updateState({ gravity: 'lunar' })}
                className={`p-2.5 rounded-lg border text-xs font-mono text-center transition-all ${
                  state.gravity === 'lunar'
                    ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Lunar Surface</div>
                <div className="text-[10px] text-rose-600 font-semibold">0.16 g · Gap Zone</div>
              </button>
              <button
                type="button"
                onClick={() => updateState({ gravity: 'martian' })}
                className={`p-2.5 rounded-lg border text-xs font-mono text-center transition-all ${
                  state.gravity === 'martian'
                    ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Martian Surface</div>
                <div className="text-[10px] text-rose-600 font-semibold">0.38 g · Gap Zone</div>
              </button>
            </div>
          </div>

          {/* Flow Direction & Velocity */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 block">
              Forced Airflow Configuration:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateState({ flowDirection: 'concurrent' })}
                className={`p-2 rounded-lg border text-xs font-mono text-center transition-all ${
                  state.flowDirection === 'concurrent'
                    ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Concurrent</div>
                <div className="text-[10px] text-slate-500 font-normal">Co-flow (→ flame →)</div>
              </button>
              <button
                type="button"
                onClick={() => updateState({ flowDirection: 'opposed' })}
                className={`p-2 rounded-lg border text-xs font-mono text-center transition-all ${
                  state.flowDirection === 'opposed'
                    ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Opposed</div>
                <div className="text-[10px] text-slate-500 font-normal">Counter-flow (← flame)</div>
              </button>
              <button
                type="button"
                onClick={() => updateState({ flowDirection: 'quiescent', flowVelocity: 0 })}
                className={`p-2 rounded-lg border text-xs font-mono text-center transition-all ${
                  state.flowDirection === 'quiescent'
                    ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>Quiescent</div>
                <div className="text-[10px] text-slate-500 font-normal">0 cm/s chamber</div>
              </button>
            </div>

            {/* Velocity input & provenance note */}
            {state.flowDirection !== 'quiescent' && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-600">Calibrated Speed:</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={state.flowVelocity}
                    onChange={(e) => updateState({ flowVelocity: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-0.5 text-right font-mono text-xs font-bold border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-xs font-mono text-slate-500">cm/s</span>
                </div>
                <span className="text-[10px] font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Calibrated cm/s: BASS-II Table 5.1 (M1–M20)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Flow Regime Classification Module */}
        <FlowRegimeDisplay
          gravity={state.gravity}
          flowVelocity={state.flowVelocity}
          flowDirection={state.flowDirection}
        />

        {/* STRICT GAP ALERT BANNERS */}
        {isPartialG && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 flex items-start gap-3 text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-bold block text-sm mb-0.5">
                SPEC Section 2 Rule 5: Partial-Gravity Extrapolation Refused
              </strong>
              <span>
                <strong>0 rows</strong> in the NASA Physical Sciences Informatics (PSI) combustion record report partial-gravity testing ({state.gravity === 'lunar' ? '0.16 g' : '0.38 g'}). PYRO-ASTRA does not extrapolate microgravity data to partial gravity. Only 0g and 1g results are shown as physical bounds.
              </span>
            </div>
          </div>
        )}

        {isTargetZone && !isPartialG && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-bold block text-sm mb-0.5">
                Target Exploration Atmosphere (O₂ ≥ 30% AND Pressure ≤ 10.2 psi)
              </strong>
              <span>
                Selected conditions lie within the planned Lunar Exploration Habitat envelope. Across all 1,815 ingested table rows, <strong>0 ambient cabin-air rows</strong> exist in this quadrant.
                {state.oxidizerContext === 'burner' && (
                  <span className="block mt-1 font-semibold text-amber-950">
                    Note: Burner co-flow streams (CFI-G 20 rows, Flame Design 18 rows) operate in this parameter window, but constitute isolated fuel burners, NEVER breathable cabin air (Rule 4).
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AtmosphereFlowController;
