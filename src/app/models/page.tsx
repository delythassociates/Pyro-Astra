'use client';

import React from 'react';
import { SurrogateDomainWidget } from '@/components/SurrogateDomainWidget';
import { AtmosphereFlowController } from '@/components/AtmosphereFlowController';
import surrogateData from '@/data/analysis/surrogate_evaluation.json';
import nullResultData from '@/data/analysis/null_result_report.json';
import { Cpu, ShieldAlert, CheckCircle2, Layers } from 'lucide-react';

export default function ModelsPage() {
  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-800 uppercase tracking-wider font-semibold">
          <Cpu className="w-4 h-4 text-sky-700" />
          <span>Surrogate Modeling & Convex Hull Domain Gating</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Microgravity Surrogate Modeling & 3-Tier Applicability Gate
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Pre-registered cross-validation benchmark on extinguished liquid droplets (FLEX PSI-69, n = 189). Demonstrates how machine learning models fail catastrophically upon extrapolation outside measured microgravity boundaries.
        </p>
      </div>

      {/* Atmospheric Controller */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
          Flow Regime & Mission Atmosphere Simulator
        </h2>
        <AtmosphereFlowController />
      </section>

      {/* Primary Benchmark & Domain Gate Widget */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold font-mono text-slate-900">
            FLEX Extinction Diameter Model Benchmark & Live Gate
          </h2>
          <p className="text-xs text-slate-500">
            CV MAE comparison with bootstrap confidence intervals, holdout degradation spikes, and interactive 3-tier gating.
          </p>
        </div>
        <SurrogateDomainWidget />
      </section>

      {/* Pre-Registered Model Architecture Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sky-800 font-mono font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pre-Registered Baseline Rule</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Per SPEC Section 2 Rule 2 & PREREGISTERED Rev 5, a model may exist only if it strictly outperforms simple baselines (mean, median, 1-NN, 3-NN) under grouped Leave-One-Condition-Out CV. Random Forest won with <strong>0.36 mm MAE</strong> vs. 3-NN baseline of <strong>0.59 mm MAE</strong>.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-mono font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Deterministic Domain Gate</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Every inference must clear a 3-tier gate: bounding box ranges, per-fuel convex hull, and standardized neighbor distance threshold (D_max &le; 1.5 &times; P_95). Inputs outside the gate return a deterministic <strong>REFUSAL</strong> with nearest empirical rows cited.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-mono font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Demonstrator, Not Safety Predictor</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            FLEX models predict isolated droplet extinction diameter only. They cannot screen habitat materials, evaluate solid polymers, or predict lunar flame spread. All model outputs are labeled as non-PSI estimates.
          </p>
        </div>
      </div>
    </div>
  );
}
