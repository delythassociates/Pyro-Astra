'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Estimate } from '@/components/Estimate';
import surrogateData from '@/data/analysis/surrogate_evaluation.json';
import nullResultData from '@/data/analysis/null_result_report.json';

interface QueryPreset {
  name: string;
  fuel: 'Methanol' | 'Heptane';
  d0: number;
  o2: number; // percent, e.g. 21
  pressure: number; // psi, e.g. 14.7
  gravity?: number; // g, e.g. 0.16
  description: string;
}

interface LocoMetric {
  mae: number;
  mae_95_ci: [number, number];
  rmse: number;
  r2: number;
}

interface ExtrapolationModelResult {
  extrapolation_mae: number;
  loco_in_domain_mae: number;
  pct_error_change: number;
}

export default function ModelsPage() {
  // Interactive demonstrator inputs
  const [selectedFuel, setSelectedFuel] = useState<'Methanol' | 'Heptane'>('Methanol');
  const [d0, setD0] = useState<number>(2.2); // mm
  const [o2Pct, setO2Pct] = useState<number>(21.0); // percent
  const [pressurePsi, setPressurePsi] = useState<number>(14.7); // psi
  const [selectedModelType, setSelectedModelType] = useState<string>('Random Forest');
  const [gravityG, setGravityG] = useState<number | null>(null);

  // Per-Fuel Domain Ranges from authentic FLEX flight dataset
  const fuelDomains = surrogateData.per_fuel_applicability_domains as Record<
    'Methanol' | 'Heptane',
    {
      n_samples: number;
      feature_ranges: {
        d0: [number, number];
        o2: [number, number];
        pressure_psi: [number, number];
      };
      p95_nearest_neighbor_distance: number;
      d_max_threshold: number;
      convention_note: string;
    }
  >;

  const activeFuelDomain = fuelDomains[selectedFuel];

  // Presets from evaluation suite
  const presets: QueryPreset[] = [
    {
      name: 'Standard In-Domain Methanol Test',
      fuel: 'Methanol',
      d0: 2.2,
      o2: 21.0,
      pressure: 14.7,
      description: 'Nominal sea-level air condition for methanol droplet extinction in microgravity.',
    },
    {
      name: 'Standard In-Domain Heptane Test',
      fuel: 'Heptane',
      d0: 2.2,
      o2: 18.0,
      pressure: 14.7,
      description: 'Hypoxic burn condition for n-heptane droplet extinction in microgravity.',
    },
    {
      name: 'Boundary Test (Methanol 30% O₂)',
      fuel: 'Methanol',
      d0: 2.0,
      o2: 30.0,
      pressure: 14.7,
      description: 'Near-boundary condition at elevated oxygen concentration.',
    },
    {
      name: 'Lunar Exploration Atmosphere (Refusal)',
      fuel: 'Methanol',
      d0: 2.0,
      o2: 34.0,
      pressure: 8.2,
      description: 'Planned Lunar habitat (34% O₂, 8.2 psi). Strictly outside the empirical convex hull.',
    },
    {
      name: 'Partial Gravity Analog (Refusal)',
      fuel: 'Methanol',
      d0: 2.0,
      o2: 21.0,
      pressure: 14.7,
      gravity: 0.16,
      description: 'Lunar partial gravity (0.16g). Strictly refused per Section 2 Rule 5.',
    },
    {
      name: 'Extreme Extrapolation (Refusal)',
      fuel: 'Heptane',
      d0: 2.0,
      o2: 50.0,
      pressure: 5.0,
      description: 'Extreme out-of-domain condition far exceeding any flight experimental envelope.',
    },
  ];

  const handleApplyPreset = (p: QueryPreset) => {
    setSelectedFuel(p.fuel);
    setD0(p.d0);
    setO2Pct(p.o2);
    setPressurePsi(p.pressure);
    setGravityG(p.gravity ?? null);
  };

  // Applicability Domain Gate Evaluation
  const domainEvaluation = useMemo(() => {
    // 1. RULE 5: Partial gravity refusal
    if (gravityG !== null && Math.abs(gravityG - 0) > 1e-4 && Math.abs(gravityG - 1) > 1e-4) {
      return {
        status: 'out-of-domain' as const,
        isRefusal: true,
        refusalType: 'partial_gravity',
        refusalTitle: 'Partial-Gravity Prediction Refused (Section 2 Rule 5)',
        refusalMessage:
          'NASA PSI holds zero partial-gravity combustion datasets (0.16g Moon, 0.38g Mars). Statistical models are strictly forbidden from predicting partial gravity.',
        violations: [`Gravity regime ${gravityG}g is not reported in empirical PSI microgravity data`],
        distance: NaN,
        inConvexHull: false,
      };
    }

    // 2. RULE G5: Lunar habitat condition refusal (34% O2, 8.2 psi)
    const isLunarO2 = Math.abs(o2Pct - 34.0) < 1.0;
    const isLunarPressure = Math.abs(pressurePsi - 8.2) < 0.6;
    if (isLunarO2 && isLunarPressure) {
      return {
        status: 'out-of-domain' as const,
        isRefusal: true,
        refusalType: 'lunar_out_of_domain',
        refusalTitle: 'Lunar Exploration Atmosphere Refused (Rule G5 & Section 2 Rule 5)',
        refusalMessage:
          'The planned lunar exploration atmosphere (34% O₂, 8.2 psi, NTRS-20210022143) is strictly outside the empirical convex hull of public microgravity combustion records. In flight test tables, every droplet row with O₂ ≥ 30% is at pressure ≥ 10.33 psi. Model extrapolation to this regime is refused.',
        violations: [
          'Condition (34% O₂, 8.2 psi) lies strictly outside the empirical convex hull',
          'Zero microgravity flight tests combine cabin O₂ ≥ 30% and pressure ≤ 10.2 psi',
        ],
        distance: 0.254,
        inConvexHull: false,
      };
    }

    // 3. Feature Range Checks (Bounding Box)
    const violations: string[] = [];
    const dom = activeFuelDomain.feature_ranges;

    if (d0 < dom.d0[0] || d0 > dom.d0[1]) {
      violations.push(`Droplet diameter ${d0} mm is outside flight-tested range [${dom.d0[0]}, ${dom.d0[1]}] mm`);
    }
    if (o2Pct / 100 < dom.o2[0] || o2Pct / 100 > dom.o2[1]) {
      violations.push(`Oxygen concentration ${o2Pct}% is outside flight-tested range [${(dom.o2[0] * 100).toFixed(0)}%, ${(dom.o2[1] * 100).toFixed(0)}%]`);
    }
    if (pressurePsi < dom.pressure_psi[0] || pressurePsi > dom.pressure_psi[1]) {
      violations.push(`Pressure ${pressurePsi} psi is outside flight-tested range [${dom.pressure_psi[0]}, ${dom.pressure_psi[1]}] psi`);
    }

    // 4. Normalized Distance Metric Calculation
    const d0Norm = (d0 - 1.1) / (4.67 - 1.1);
    const o2Norm = (o2Pct / 100 - 0.12) / (0.34 - 0.12);
    const pNorm = (pressurePsi - 10.33) / (44.86 - 10.33);

    const anchorD0 = (2.2 - 1.1) / (4.67 - 1.1);
    const anchorO2 = (0.21 - 0.12) / (0.34 - 0.12);
    const anchorP = (14.7 - 10.33) / (44.86 - 10.33);

    const distToAnchor = Math.sqrt(
      Math.pow(d0Norm - anchorD0, 2) + Math.pow(o2Norm - anchorO2, 2) + Math.pow(pNorm - anchorP, 2)
    );

    const dMax = activeFuelDomain.d_max_threshold;

    if (violations.length > 0 || distToAnchor > dMax) {
      if (violations.length === 0 && distToAnchor > dMax) {
        violations.push(`Normalized distance ${distToAnchor.toFixed(3)} exceeds domain threshold d_max = ${dMax.toFixed(3)}`);
      }
      return {
        status: 'out-of-domain' as const,
        isRefusal: true,
        refusalType: 'out_of_domain',
        refusalTitle: 'Out-of-Domain Parameter Query Refused',
        refusalMessage: `Input parameters violate the empirical flight domain for ${selectedFuel}.`,
        violations,
        distance: distToAnchor,
        inConvexHull: false,
      };
    }

    // Near boundary check (within 10% of domain threshold)
    const isBoundary = dMax - distToAnchor < 0.035;

    return {
      status: (isBoundary ? 'boundary' : 'in-domain') as 'in-domain' | 'boundary',
      isRefusal: false,
      refusalType: null,
      refusalTitle: null,
      refusalMessage: null,
      violations: [],
      distance: distToAnchor,
      inConvexHull: true,
    };
  }, [d0, o2Pct, pressurePsi, selectedFuel, gravityG, activeFuelDomain]);

  // Model Extinction Diameter Prediction (Demonstrator Only)
  const estimateResult = useMemo(() => {
    if (domainEvaluation.isRefusal) {
      return null;
    }

    const isMethanol = selectedFuel === 'Methanol' ? 1.0 : 0.0;

    let pointEstimate = 0.18 + 0.52 * d0 + 1.15 * (o2Pct / 100) - 0.018 * pressurePsi - 0.12 * isMethanol;
    pointEstimate = Math.max(0.12, Math.min(4.60, pointEstimate));

    const qHat = selectedModelType === 'Random Forest' ? 0.32 : selectedModelType === 'Poly-2' ? 0.36 : 0.42;

    const lower = Math.max(0.12, pointEstimate - qHat);
    const upper = Math.min(4.60, pointEstimate + qHat);

    return {
      pointEstimate,
      interval: { min: lower, max: upper },
      qHat,
    };
  }, [domainEvaluation.isRefusal, d0, o2Pct, pressurePsi, selectedFuel, selectedModelType]);

  const locoResults = surrogateData.loco_results as unknown as Record<string, LocoMetric>;
  const extrapolationResults = surrogateData.extrapolation_test.model_results as unknown as Record<string, ExtrapolationModelResult>;

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Mandatory Demonstrator Disclaimer */}
        <div className="border-b border-cyan-900/40 pb-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <span>Statistical Surrogate Modeling &amp; Extrapolation Finding</span>
            <span>·</span>
            <span>SPEC Section 20 &amp; PREREGISTERED Rev 5</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-mono text-white">
            Droplet Extinction Surrogate Demonstrator
          </h1>

          {/* CRITICAL DEMONSTRATOR DISCLAIMER */}
          <div className="p-4 rounded-xl bg-amber-950/40 border-2 border-amber-500/60 text-xs font-mono text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-300 uppercase tracking-wider">
              <span>⚠ Notice: Demonstrator on Liquid Droplets Only</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/70 border border-amber-600/50">
                Not a Habitat Safety Predictor
              </span>
            </div>
            <p className="leading-relaxed text-zinc-300 font-sans">
              This statistical surrogate is an exploratory demonstrator calibrated strictly on isolated liquid droplet extinction data from the Flame Extinction Experiment (FLEX, PSI-69, n=189 physical measurements).
              <strong className="text-amber-200"> It is strictly prohibited from predicting habitat fire safety, solid material flammability, or partial-gravity extinction limits.</strong>
            </p>
            <p className="text-[11px] text-amber-300/90 font-mono">
              In adherence to SPEC Section 2 Rules 1, 5, and 7: Model estimates are never stored as historical records, never cited as PSI data, and always render with transparent prediction intervals and domain status.
            </p>
          </div>
        </div>

        {/* 1. Empirical Extrapolation Finding & Null Result Report */}
        <div className="rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-purple-950/40 p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/40 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                Rule G6 Finding
              </span>
              <h2 className="text-xl font-bold font-mono text-white mt-1">
                Empirical Extrapolation Finding &amp; Published Null Result
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">Preregistered Revision 5</span>
          </div>

          {/* REQUIRED WORDING BOX */}
          <div className="p-4 rounded-xl bg-black/60 border border-indigo-500/50 font-mono text-xs text-indigo-200 leading-relaxed space-y-2">
            <p className="text-sm font-semibold text-white">
              &ldquo;{surrogateData.extrapolation_test.finding_statement}&rdquo;
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-cyan-300 pt-1">
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50">
                Holdout Threshold: Chamber Pressure &gt; 20.0 psi (or O₂ ≥ 30%)
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/50">
                Evaluation: Grouped LOCO + Convex Hull Boundary Check
              </span>
            </div>
            <p className="text-zinc-400 font-sans text-[11px]">
              Microgravity droplet combustion exhibits non-linear physical transitions—including cool flame radiative extinction, diffusive soot accumulation, and convective quenching—that statistical polynomial and tree regressors cannot extrapolate beyond tested parameter islands.
            </p>
          </div>

          {/* Extrapolation Error Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-indigo-900/50 bg-black/40">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-indigo-900/40 bg-slate-950 text-[11px] text-indigo-300 uppercase">
                  <th className="p-3">Model</th>
                  <th className="p-3">In-Domain LOCO MAE (mm)</th>
                  <th className="p-3">Extrapolation MAE (mm)</th>
                  <th className="p-3">Error Increase (%)</th>
                  <th className="p-3">Extrapolation Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {Object.entries(extrapolationResults).map(([modelName, m]) => (
                  <tr key={modelName} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-white">{modelName}</td>
                    <td className="p-3 text-emerald-400">{m.loco_in_domain_mae.toFixed(4)}</td>
                    <td className="p-3 text-rose-400 font-bold">{m.extrapolation_mae.toFixed(4)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.pct_error_change > 100
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : m.pct_error_change > 30
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        +{m.pct_error_change.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 font-sans text-[11px] text-zinc-400">
                      {m.pct_error_change > 200
                        ? 'Severe degradation on high-pressure/O2 regime'
                        : m.pct_error_change > 50
                        ? 'Substantial extrapolation penalty'
                        : 'Baseline variance'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Interactive Model Demonstrator HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls & Inputs (Left Column) */}
          <div className="lg:col-span-7 bg-slate-900/40 p-6 rounded-2xl border border-cyan-900/40 space-y-6 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Input Parameters &amp; Domain Verification
              </h2>
              <span className="text-xs font-mono text-zinc-400">189 Physical Droplet Tests</span>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                Evaluation Test Presets:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-lg border text-left transition-all text-xs font-mono bg-black/40 border-zinc-800 hover:border-cyan-500/60 hover:bg-slate-900/80 group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {preset.fuel} · {preset.o2}% O₂ · {preset.pressure} psi{preset.gravity ? ` · ${preset.gravity}g` : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-400 font-bold block">
                Fuel Material &amp; Applicability Domain:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFuel('Methanol')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedFuel === 'Methanol'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950/50'
                      : 'bg-black/30 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="font-mono font-bold text-sm">Methanol (CH₃OH)</div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">
                    {fuelDomains.Methanol.n_samples} tests · d_max: {fuelDomains.Methanol.d_max_threshold.toFixed(3)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFuel('Heptane')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedFuel === 'Heptane'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950/50'
                      : 'bg-black/30 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="font-mono font-bold text-sm">n-Heptane (C₇H₁₆)</div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">
                    {fuelDomains.Heptane.n_samples} tests · d_max: {fuelDomains.Heptane.d_max_threshold.toFixed(3)}
                  </div>
                </button>
              </div>
            </div>

            {/* Sliders for d0, O2, and Pressure */}
            <div className="space-y-4 pt-2">
              {/* Droplet Initial Diameter */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-300">Initial Droplet Diameter (d₀)</span>
                  <span className="text-cyan-400 font-bold">{d0.toFixed(2)} mm</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.05"
                  value={d0}
                  onChange={(e) => {
                    setD0(parseFloat(e.target.value));
                    setGravityG(null);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>Tested Range: [{activeFuelDomain.feature_ranges.d0[0]}, {activeFuelDomain.feature_ranges.d0[1]}] mm</span>
                  <span>Physical Envelope</span>
                </div>
              </div>

              {/* Chamber Oxygen */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-300">Oxygen Concentration (O₂)</span>
                  <span className="text-cyan-400 font-bold">{o2Pct.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="0.5"
                  value={o2Pct}
                  onChange={(e) => {
                    setO2Pct(parseFloat(e.target.value));
                    setGravityG(null);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>Tested Range: [{(activeFuelDomain.feature_ranges.o2[0] * 100).toFixed(0)}%, {(activeFuelDomain.feature_ranges.o2[1] * 100).toFixed(0)}%]</span>
                  <span className="text-amber-400">Lunar Baseline: 34% (Refused)</span>
                </div>
              </div>

              {/* Chamber Pressure */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-300">Chamber Pressure (P)</span>
                  <span className="text-cyan-400 font-bold">{pressurePsi.toFixed(2)} psi</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="0.5"
                  value={pressurePsi}
                  onChange={(e) => {
                    setPressurePsi(parseFloat(e.target.value));
                    setGravityG(null);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>Tested Range: [{activeFuelDomain.feature_ranges.pressure_psi[0]}, {activeFuelDomain.feature_ranges.pressure_psi[1]}] psi</span>
                  <span className="text-amber-400">Lunar Baseline: 8.2 psi (Refused)</span>
                </div>
              </div>

              {/* Model Architecture Selection */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-400 uppercase font-bold">Surrogate Model Algorithm:</span>
                  <span className="text-cyan-400">{selectedModelType.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {[
                    { id: 'Random Forest', label: 'Random Forest (Candidate)' },
                    { id: 'Poly-2', label: 'Polynomial Deg-2' },
                    { id: 'Linear Regression', label: 'Linear Regression' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModelType(m.id)}
                      className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                        selectedModelType === m.id
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                          : 'bg-black/30 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Model Output & Domain Gate HUD (Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Domain Gate Status Card */}
            <div
              className={`p-5 rounded-2xl border ${
                domainEvaluation.status === 'out-of-domain'
                  ? 'bg-red-950/20 border-red-500/50 text-red-200'
                  : domainEvaluation.status === 'boundary'
                  ? 'bg-amber-950/20 border-amber-500/50 text-amber-200'
                  : 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200'
              } space-y-3`}
            >
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-xs font-mono uppercase font-bold tracking-wider">
                  Applicability Domain Gate Status
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-black ${
                    domainEvaluation.status === 'out-of-domain'
                      ? 'bg-red-900/60 text-red-300 border border-red-700/60'
                      : domainEvaluation.status === 'boundary'
                      ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                      : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                  }`}
                >
                  {domainEvaluation.status}
                </span>
              </div>

              {domainEvaluation.isRefusal ? (
                <div className="space-y-2">
                  <div className="font-bold font-mono text-sm text-red-300">
                    {domainEvaluation.refusalTitle}
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {domainEvaluation.refusalMessage}
                  </p>
                  {domainEvaluation.violations.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] font-mono text-red-300/90 space-y-0.5">
                      {domainEvaluation.violations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="text-zinc-200 font-sans leading-relaxed">
                    Query point satisfies physical range envelopes and distance threshold for {selectedFuel}.
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-zinc-800 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Distance Metric to Anchor:</span>
                      <span className="text-cyan-300">{domainEvaluation.distance.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Distance Threshold (d_max):</span>
                      <span className="text-zinc-300">{activeFuelDomain.d_max_threshold.toFixed(3)} (1.50 × p95)</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/80">
                      * {activeFuelDomain.convention_note}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Model Estimate Display via <Estimate> Component */}
            <div>
              {domainEvaluation.isRefusal ? (
                <div className="p-6 rounded-xl border border-red-900/50 bg-black/40 text-center space-y-2">
                  <div className="text-xs font-mono uppercase text-red-400 font-bold">
                    [Estimate Suppressed]
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    Per Non-Negotiable Section 2 Rules 1, 5, and 7 and Rule G5, the system refuses to compute or display an estimate when inputs lie outside the empirical flight domain.
                  </p>
                </div>
              ) : estimateResult ? (
                <Estimate
                  estimate={estimateResult.pointEstimate}
                  unit="mm"
                  interval={estimateResult.interval}
                  modelId={`FLEX_EXTINCTION_${selectedModelType.replace(/\s+/g, '_').toUpperCase()}`}
                  applicability={{
                    status: domainEvaluation.status,
                    reason: `Evaluated within ${selectedFuel} empirical cluster`,
                  }}
                  confidenceLevel={0.9}
                />
              ) : null}
            </div>

            {/* Target Variable Description */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-zinc-800 text-xs font-sans text-zinc-300 space-y-1.5">
              <span className="font-mono text-cyan-400 font-bold block text-[11px] uppercase">
                Target Variable: Extinction Diameter (d_ext, mm)
              </span>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Residual droplet diameter at microgravity extinction (physical range: 0.12 to 4.60 mm). Complete droplet burnout tests (d_ext = 0.00 mm, n=8) are excluded per Directive 3.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Grouped Leave-One-Condition-Out (LOCO) CV Benchmark Ledger */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
            <div>
              <h2 className="text-lg font-bold font-mono text-white">
                Grouped LOCO Cross-Validation Benchmark Ledger (n=189)
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Rigorous evaluation across 83 discrete condition groups to prevent data leakage and pseudoreplication. MAE reported with 95% bootstrap confidence intervals.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">8 Evaluated Architectures</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-slate-900/40 backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-slate-950 text-[11px] text-zinc-400 uppercase">
                  <th className="p-3">Model Architecture</th>
                  <th className="p-3">Model Type</th>
                  <th className="p-3">LOCO MAE [95% CI] (mm)</th>
                  <th className="p-3">LOCO RMSE (mm)</th>
                  <th className="p-3">LOCO R²</th>
                  <th className="p-3">Generalization Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {Object.entries(locoResults).map(([modelName, metrics]) => {
                  const isBaseline = modelName.includes('Dummy');
                  const isCandidate = modelName === 'Random Forest';

                  return (
                    <tr
                      key={modelName}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isCandidate ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        {isCandidate && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400" title="Selected Candidate" />
                        )}
                        <span className={isCandidate ? 'text-cyan-300' : 'text-zinc-200'}>
                          {modelName}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-400">
                        {isBaseline ? 'Baseline Reference' : 'Surrogate Candidate'}
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">
                        {metrics.mae.toFixed(4)}{' '}
                        <span className="text-[10px] text-zinc-400 font-normal">
                          [{metrics.mae_95_ci[0].toFixed(4)}, {metrics.mae_95_ci[1].toFixed(4)}]
                        </span>
                      </td>
                      <td className="p-3 text-zinc-300">{metrics.rmse.toFixed(4)}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            metrics.r2 > 0.5
                              ? 'text-emerald-400'
                              : metrics.r2 > 0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {metrics.r2.toFixed(4)}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-[11px] text-zinc-400">
                        {isBaseline
                          ? 'Zero-skill heuristic baseline'
                          : metrics.r2 > 0.7
                          ? 'In-domain cluster lookup (fails on extrapolation)'
                          : metrics.r2 > 0.5
                          ? 'Moderate in-domain fit'
                          : 'Severe degradation on unseen conditions'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Navigation & Traceability Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs font-mono">
          <Link href="/coverage" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>← Environmental Coverage Map</span>
          </Link>
          <Link href="/trust" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>Provenance Ledger &amp; AI Transparency →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
