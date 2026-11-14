'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Val } from '@/components/Val';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import {
  rankInvestigations,
  HABITAT_PRESETS,
  HabitatPreset,
  ScoreWeights,
} from '@/lib/score';
import type { SafetyArea } from '@/data/schema';

function RankContent() {
  const searchParams = useSearchParams();
  const initialPresetParam = searchParams.get('preset') || 'moon_base';
  const mappedPresetKey =
    initialPresetParam === 'moon-base'
      ? 'moon_base'
      : initialPresetParam === 'iss-cabin'
      ? 'iss_cabin'
      : initialPresetParam === 'mars-rover'
      ? 'mars_rover'
      : initialPresetParam in HABITAT_PRESETS
      ? (initialPresetParam as keyof typeof HABITAT_PRESETS)
      : 'moon_base';

  const [presetKey, setPresetKey] = useState<keyof typeof HABITAT_PRESETS>(mappedPresetKey);
  const [selectedSafetyArea, setSelectedSafetyArea] = useState<SafetyArea | 'any'>('any');

  // Custom atmosphere overrides
  const activePreset = HABITAT_PRESETS[presetKey];
  const [o2Min, setO2Min] = useState<number>(activePreset.o2.min);
  const [o2Max, setO2Max] = useState<number>(activePreset.o2.max);
  const [pressureMin, setPressureMin] = useState<number>(activePreset.pressure.min);
  const [pressureMax, setPressureMax] = useState<number>(activePreset.pressure.max);

  // When preset button changes, sync sliders
  const handleSelectPreset = (key: keyof typeof HABITAT_PRESETS) => {
    setPresetKey(key);
    const p = HABITAT_PRESETS[key];
    setO2Min(p.o2.min);
    setO2Max(p.o2.max);
    setPressureMin(p.pressure.min);
    setPressureMax(p.pressure.max);
  };

  // Optional airflow filter
  const [useAirflow, setUseAirflow] = useState<boolean>(false);
  const [airflowMin, setAirflowMin] = useState<number>(5);
  const [airflowMax, setAirflowMax] = useState<number>(20);

  // Weight sliders (Section 7 defaults: safety 0.35, env 0.35, airflow 0.10, completeness 0.20)
  const [weights, setWeights] = useState<ScoreWeights>({
    safety_area: 0.35,
    environment_overlap: 0.35,
    airflow_overlap: 0.10,
    evidence_completeness: 0.20,
  });

  // Calculate dynamic ranking
  const ranked = useMemo(() => {
    return rankInvestigations(DEFAULT_INVESTIGATIONS, {
      habitat: {
        o2: { min: o2Min, max: o2Max },
        pressure: { min: pressureMin, max: pressureMax },
      },
      safetyArea: selectedSafetyArea,
      airflow: useAirflow ? { min: airflowMin, max: airflowMax } : null,
      weights,
    });
  }, [
    o2Min,
    o2Max,
    pressureMin,
    pressureMax,
    selectedSafetyArea,
    useAirflow,
    airflowMin,
    airflowMax,
    weights,
  ]);

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-cyan-900/40 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <span>Deterministic Scoring Algorithm</span>
            <span>·</span>
            <span>SPEC Section 7</span>
          </div>
          <h1 className="text-3xl font-black font-mono text-white mt-1">
            Dynamic Investigation Ranking
          </h1>
          <p className="text-sm text-zinc-400 font-sans mt-1">
            Match spacecraft and habitat operational atmospheres to NASA PSI combustion records. Ties break strictly by evidence completeness, then by ID.
          </p>
        </div>

        {/* Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-4 space-y-6 bg-slate-900/60 p-5 rounded-2xl border border-cyan-900/40 backdrop-blur-sm">
            {/* Habitat Presets */}
            <div>
              <label className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-2">
                Habitat Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(HABITAT_PRESETS) as Array<keyof typeof HABITAT_PRESETS>).map((key) => {
                  const p = HABITAT_PRESETS[key];
                  const isSelected = presetKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPreset(key)}
                      className={`p-2 rounded-lg text-xs font-mono text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-600 text-white font-bold shadow'
                          : 'bg-slate-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <div>{p.name}</div>
                      <div className="text-[10px] opacity-75 font-normal">
                        {p.o2.min === p.o2.max ? `${p.o2.min}%` : `${p.o2.min}-${p.o2.max}%`} O₂
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-zinc-400 italic">
                {activePreset.description}
              </p>
            </div>

            {/* Atmosphere Sliders */}
            <div className="space-y-4 pt-3 border-t border-zinc-800">
              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                  <span>Target Cabin O₂ Range</span>
                  <span className="text-cyan-400 font-bold">{o2Min}% – {o2Max}%</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={o2Min}
                    onChange={(e) => setO2Min(Math.min(Number(e.target.value), o2Max))}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                  />
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={o2Max}
                    onChange={(e) => setO2Max(Math.max(Number(e.target.value), o2Min))}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                  <span>Target Cabin Pressure Range</span>
                  <span className="text-emerald-400 font-bold">{pressureMin.toFixed(1)} – {pressureMax.toFixed(1)} psi</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.1"
                    value={pressureMin}
                    onChange={(e) => setPressureMin(Math.min(Number(e.target.value), pressureMax))}
                    className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400"
                  />
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.1"
                    value={pressureMax}
                    onChange={(e) => setPressureMax(Math.max(Number(e.target.value), pressureMin))}
                    className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Safety Area Filter */}
            <div className="pt-3 border-t border-zinc-800">
              <label className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-2">
                Safety Area Filter
              </label>
              <select
                value={selectedSafetyArea}
                onChange={(e) => setSelectedSafetyArea(e.target.value as SafetyArea | 'any')}
                className="w-full p-2 bg-slate-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="any">Any Safety Area</option>
                <option value="prevention">Prevention (BASS, Saffire)</option>
                <option value="detection">Detection (SAME, SAME-R)</option>
                <option value="suppression">Suppression (FLEX, FLEX-2)</option>
                <option value="other">Other / Fundamental (CFI-G, E-FIELD)</option>
              </select>
            </div>

            {/* Airflow Toggle & Sliders */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300">Airflow Overlap</span>
                <button
                  type="button"
                  onClick={() => setUseAirflow(!useAirflow)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    useAirflow ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {useAirflow ? 'Active (0.10)' : 'Unset (Renormalized)'}
                </button>
              </div>

              {useAirflow && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>Flow Speed:</span>
                    <span>{airflowMin} – {airflowMax} cm/s</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={airflowMin}
                      onChange={(e) => setAirflowMin(Math.min(Number(e.target.value), airflowMax))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={airflowMax}
                      onChange={(e) => setAirflowMax(Math.max(Number(e.target.value), airflowMin))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Weights Sliders */}
            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <span className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Score Component Weights
              </span>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>Safety Area Match</span>
                  <span>{(weights.safety_area! * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.safety_area}
                  onChange={(e) =>
                    setWeights({ ...weights, safety_area: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>Environment Overlap (O₂ + Press)</span>
                  <span>{(weights.environment_overlap! * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.environment_overlap}
                  onChange={(e) =>
                    setWeights({ ...weights, environment_overlap: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>Evidence Completeness</span>
                  <span>{(weights.evidence_completeness! * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.evidence_completeness}
                  onChange={(e) =>
                    setWeights({ ...weights, evidence_completeness: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Ranked Results */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-800">
              <span>{ranked.length} Investigations Ranked</span>
              <span>Sorted by Score ↓ then Completeness ↓ then ID ↑</span>
            </div>

            {ranked.map(({ investigation: inv, score }, idx) => {
              const pctScore = Math.round(score.total * 100);

              return (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-zinc-800 hover:border-cyan-800/60 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-zinc-300">
                          #{idx + 1}
                        </span>
                        <h2 className="text-lg font-bold font-mono text-white">
                          {inv.acronym}
                        </h2>
                        <span className="text-xs font-mono text-zinc-400">
                          ({inv.id})
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                            inv.safety_areas.includes('prevention')
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                              : inv.safety_areas.includes('detection')
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50'
                              : inv.safety_areas.includes('suppression')
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {inv.safety_areas.join(', ')}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 font-sans">
                        {inv.name}
                      </div>
                    </div>

                    {/* Total Score Badge */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono text-cyan-300">
                          {(score.total * 100).toFixed(1)}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">/ 100</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Total Match Score
                      </span>
                    </div>
                  </div>

                  {/* Core Experimental Values rendered strictly via <Val> */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-xl border border-zinc-800/80 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Cabin O₂:</span>
                      <Val val={inv.cabin_o2_pct} />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Burner Flow O₂:</span>
                      <Val val={inv.burner_flow_o2_pct} fallbackText="none (not burner)" />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Pressure:</span>
                      <Val val={inv.pressure_psi} />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Airflow:</span>
                      <Val val={inv.airflow_speed_cm_s} />
                    </div>
                  </div>

                  {/* Score Component Breakdown and Explanations */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                      Score Breakdown & Transparent Reasons:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {score.components.map((comp) => (
                        <div
                          key={comp.name}
                          className="p-2 rounded-lg bg-black/30 border border-zinc-800/60 space-y-0.5"
                        >
                          <div className="flex justify-between text-[11px]">
                            <span className="capitalize text-zinc-300">
                              {comp.name.replace('_', ' ')}:
                            </span>
                            <span className="text-cyan-400 font-bold">
                              {(comp.value * 100).toFixed(0)}% (wt {(comp.weight * 100).toFixed(0)}%)
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                            {comp.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Solid-Material Flammability Metric Notice (SPEC Section 7) */}
                  <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between pt-1">
                    <span>
                      Solid-material flammability ranking:{' '}
                      <em className="text-zinc-400">not comparable in PSI (varying flow & geometry)</em>
                    </span>
                    <span>DOI: {inv.doi}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RankPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full bg-slate-950 p-12 text-center font-mono text-xs text-zinc-400">
          Loading ranking criteria...
        </div>
      }
    >
      <RankContent />
    </Suspense>
  );
}
