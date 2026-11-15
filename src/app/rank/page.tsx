'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Val } from '@/components/Val';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import {
  rankInvestigations,
  HABITAT_PRESETS,
  ScoreWeights,
} from '@/lib/score';
import type { SafetyArea } from '@/data/schema';
import { AtmosphereFlowController } from '@/components/AtmosphereFlowController';
import { Bass2SpreadRateChart } from '@/components/Bass2SpreadRateChart';
import { BarChart3, Sliders, ShieldCheck } from 'lucide-react';

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
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-10 max-w-[1840px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-800 uppercase tracking-wider font-semibold">
          <BarChart3 className="w-4 h-4 text-sky-700" />
          <span>Deterministic Scoring & Ranking Engine · SPEC Section 7</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Operational Atmosphere & Flammability Ranking
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Rank NASA PSI investigations by environmental overlap, safety area coverage, and evidence completeness. Ties break strictly by verified completeness, then by investigation ID.
        </p>
      </div>

      {/* TRACK 1: Atmospheric Parameter & Flow Regime Controller */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
          Flow Regime & Mission Atmosphere Simulator
        </h2>
        <AtmosphereFlowController />
      </section>

      {/* GRAPH 4: Flow Velocity vs Spread Rate */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold font-mono text-slate-900">
            Flow Velocity Effects on Solid Flame Spread (BASS-II Table 5.1)
          </h2>
          <p className="text-xs text-slate-500">
            Flame spread rate as a function of calibrated airflow speed (1.0–20.0 cm/s) for flat-PMMA slabs M1–M20.
          </p>
        </div>
        <Bass2SpreadRateChart />
      </section>

      {/* Filter and Weights Config Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Scoring Weights & Environmental Criteria
            </h3>
          </div>

          {/* Habitat Presets */}
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(HABITAT_PRESETS).map((k) => {
              const key = k as keyof typeof HABITAT_PRESETS;
              const isSelected = key === presetKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPreset(key)}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors border ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {HABITAT_PRESETS[key].name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
          <div>
            <div className="flex justify-between mb-1 text-slate-700">
              <span>Safety Area ({((weights.safety_area ?? 0.35) * 100).toFixed(0)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.safety_area ?? 0.35}
              onChange={(e) => setWeights({ ...weights, safety_area: parseFloat(e.target.value) })}
              className="w-full accent-sky-700"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1 text-slate-700">
              <span>Environment Overlap ({((weights.environment_overlap ?? 0.35) * 100).toFixed(0)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.environment_overlap ?? 0.35}
              onChange={(e) => setWeights({ ...weights, environment_overlap: parseFloat(e.target.value) })}
              className="w-full accent-sky-700"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1 text-slate-700">
              <span>Airflow Match ({((weights.airflow_overlap ?? 0.10) * 100).toFixed(0)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.airflow_overlap ?? 0.10}
              onChange={(e) => setWeights({ ...weights, airflow_overlap: parseFloat(e.target.value) })}
              className="w-full accent-sky-700"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1 text-slate-700">
              <span>Completeness ({((weights.evidence_completeness ?? 0.20) * 100).toFixed(0)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.evidence_completeness ?? 0.20}
              onChange={(e) => setWeights({ ...weights, evidence_completeness: parseFloat(e.target.value) })}
              className="w-full accent-sky-700"
            />
          </div>
        </div>
      </div>

      {/* Ranked Results List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold font-mono text-slate-900">
            Ranked Investigation Results ({ranked.length} total)
          </h2>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
            Deterministic Ties Broken by Completeness
          </span>
        </div>

        <div className="space-y-3">
          {ranked.map((item, index) => {
            const inv = item.investigation;
            const envComp = item.score.components.find((c) => c.name === 'environment_overlap')?.value ?? 0;
            const safeComp = item.score.components.find((c) => c.name === 'safety_area')?.value ?? 0;
            const compComp = item.score.components.find((c) => c.name === 'evidence_completeness')?.value ?? 0;

            return (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">{inv.acronym}</span>
                      <span className="text-xs font-mono text-slate-500">({inv.id})</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {inv.fuel_phase?.value ?? 'Phase null'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 font-sans">{inv.name}</p>
                    <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                      <span>Cabin O₂: <Val val={inv.cabin_o2_pct} fallbackText="not reported" /></span>
                      <span>·</span>
                      <span>Pressure: <Val val={inv.pressure_psi} fallbackText="not reported" /></span>
                      <span>·</span>
                      <span>Airflow: <Val val={inv.airflow_speed_cm_s} fallbackText="not reported" /></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-right self-end md:self-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                      Match Score
                    </span>
                    <span className="text-xl font-bold text-sky-900">
                      {(item.score.total * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 border-l border-slate-200 pl-3 text-left space-y-0.5">
                    <div>Env: {(envComp * 100).toFixed(0)}%</div>
                    <div>Safe: {(safeComp * 100).toFixed(0)}%</div>
                    <div>Comp: {(compComp * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function RankPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-slate-500">Loading Ranking Algorithm...</div>}>
      <RankContent />
    </Suspense>
  );
}
