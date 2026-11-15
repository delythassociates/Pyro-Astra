'use client';

import React from 'react';
import { SurrogateDomainWidget } from '@/components/SurrogateDomainWidget';
import { AtmosphereFlowController } from '@/components/AtmosphereFlowController';
import surrogateData from '@/data/analysis/surrogate_evaluation.json';
import nullResultData from '@/data/analysis/null_result_report.json';
import { Cpu, ShieldAlert, CheckCircle2, Layers, AlertTriangle } from 'lucide-react';

export default function ModelsPage() {
  return (
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto font-sans">
      {/* Header */}
      <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 bg-[#EAE5DB] text-[#181615] border border-[#D5CFC2] font-semibold">
            Surrogate Modeling &amp; Convex Hull Domain Gating
          </span>
          <span className="text-[11px] font-mono text-[#5A544A]">
            SPEC Section 19 &amp; 20
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-mono text-[#181615] tracking-tight flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-[#1D4ED8]" />
          <span>AI Prediction Limits &amp; 3-Tier Safety Gate (Droplet Extinction)</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#5A544A] leading-relaxed max-w-4xl">
          Pre-registered cross-validation benchmark on extinguished liquid droplets (FLEX PSI-69, n = 189). Demonstrates how machine learning models fail catastrophically upon extrapolation outside measured microgravity boundaries.
        </p>

        {/* Prominent Plain-English Explanation Strip */}
        <div className="p-4 bg-[#FFF7ED] border border-[#FDBA74] text-[#7C2D12] text-xs font-sans space-y-1">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-[#C2410C]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Plain-English Summary: Why AI Models Must Be Hard-Gated in Spaceflight</span>
          </div>
          <p className="text-[12px] leading-relaxed">
            Machine learning models are notorious for producing dangerously confident hallucinations when asked to predict conditions outside their training data. In spacecraft fire safety, relying on an ungrounded model could prove fatal. PYRO-ASTRA implements a strict, deterministic 3-tier safety gate: if a requested atmospheric condition lies outside the empirically tested convex hull of NASA PSI flight experiments, the system strictly refuses to predict a number and instead returns nearest grounded flight test bounds.
          </p>
        </div>
      </div>

      {/* Atmospheric Controller */}
      <section className="space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#181615]">
          Flow Regime &amp; Mission Atmosphere Simulator
        </h2>
        <AtmosphereFlowController />
      </section>

      {/* Primary Benchmark & Domain Gate Widget */}
      <section className="space-y-4">
        <div className="border-b border-[#D5CFC2] pb-2">
          <h2 className="text-base font-bold font-mono text-[#181615]">
            FLEX Extinction Diameter Model Benchmark &amp; Live Gate
          </h2>
          <p className="text-xs text-[#5A544A]">
            CV MAE comparison with bootstrap confidence intervals, holdout degradation spikes, and interactive 3-tier gating.
          </p>
        </div>
        <SurrogateDomainWidget />
      </section>

      {/* Pre-Registered Model Architecture Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
        <div className="p-5 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
          <div className="flex items-center gap-2 text-[#181615] font-mono font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            <span>Pre-Registered Baseline Rule</span>
          </div>
          <p className="text-[#5A544A] leading-relaxed">
            Per SPEC Section 2 Rule 2 &amp; PREREGISTERED Rev 5, a model may exist only if it strictly outperforms simple baselines (mean, median, 1-NN, 3-NN) under grouped Leave-One-Condition-Out CV. Random Forest won with <strong>0.36 mm MAE</strong> vs. 3-NN baseline of <strong>0.59 mm MAE</strong>.
          </p>
        </div>

        <div className="p-5 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
          <div className="flex items-center gap-2 text-[#C2410C] font-mono font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-[#C2410C]" />
            <span>Deterministic Domain Gate</span>
          </div>
          <p className="text-[#5A544A] leading-relaxed">
            Every inference must clear a 3-tier gate: bounding box ranges, per-fuel convex hull, and standardized neighbor distance threshold (D_max &le; 1.5 &times; P_95). Inputs outside the gate return a deterministic <strong>REFUSAL</strong> with nearest empirical rows cited.
          </p>
        </div>

        <div className="p-5 bg-[#FAF8F3] border border-[#D5CFC2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2">
          <div className="flex items-center gap-2 text-[#181615] font-mono font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#1D4ED8]" />
            <span>Demonstrator, Not Safety Predictor</span>
          </div>
          <p className="text-[#5A544A] leading-relaxed">
            FLEX models predict isolated droplet extinction diameter only. They cannot screen habitat materials, evaluate solid polymers, or predict lunar flame spread. All model outputs are labeled as non-PSI estimates.
          </p>
        </div>
      </div>
    </div>
  );
}
