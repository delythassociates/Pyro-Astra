'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Wind, ShieldAlert, Database, Layers, ArrowLeft, ExternalLink } from 'lucide-react';
import { GuideTab } from '@/context/DashboardContext';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>('quickstart');

  const tabs: { id: GuideTab; label: string; icon: React.ReactNode }[] = [
    { id: 'quickstart', label: '1. Quick Start & Dual Modes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'flow-regimes', label: '2. Flow Regimes & Physics', icon: <Wind className="w-4 h-4" /> },
    { id: 'oxygen-isolation', label: '3. Cabin Air vs. Burner O₂', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'data-pipeline', label: '4. Data Census & Provenance', icon: <Database className="w-4 h-4" /> },
    { id: 'surrogate-models', label: '5. Models & Domain Gate', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 max-w-[1840px] mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-mono text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
            In-App Documentation
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
            PYRO-ASTRA Scientific User Guide & Reference
          </h1>
          <p className="text-sm text-slate-600 font-sans mt-1">
            Complete scientific reference for microgravity combustion regimes, the lunar exploration habitat data gap, and data provenance rules.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
                  active
                    ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
        {/* TAB 1 */}
        {activeTab === 'quickstart' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-sky-700 font-semibold tracking-wider">
                System Overview
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                Dual-Mode Architecture: Beginner vs. Advanced
              </h2>
              <p className="text-slate-600 mt-1">
                PYRO-ASTRA provides two interfaces tailored for different scientific workflows while maintaining strict empirical grounding.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <span className="font-mono font-bold text-emerald-900 text-sm block">
                  🟢 Beginner Mode (Strictly 2 Inputs → 3 Outputs)
                </span>
                <p>
                  Optimized for new users and rapid exploration. Hides all complex dials, secondary sub-charts, and polynomial fitting:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 font-mono">
                  <li><strong>Pick Environment Preset:</strong> Lunar Habitat (34% O₂, 8.2 psi), ISS Cabin (21% O₂, 14.7 psi), or Spacesuit (100% O₂, 4.3 psi).</li>
                  <li><strong>Pick Material / Fuel:</strong> PMMA slabs/rods, Nomex, SIBAL cotton-fiberglass, Heptane, Methanol, etc.</li>
                </ol>
                <div className="pt-2 border-t border-emerald-200 text-xs text-slate-600">
                  <strong>3 Structured Outputs:</strong> Interactive X-Y scatter chart with axis dropdowns, matching empirical data table, and primary NASA technical report citations.
                </div>
              </div>

              <div className="p-5 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                <span className="font-mono font-bold text-sky-900 text-sm block">
                  🔵 Advanced Mode (Full Parametric Workbench)
                </span>
                <p>
                  Built for aerospace engineers, safety officers, and combustion researchers who require full parametric control:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 font-mono">
                  <li>Granular sliders for O₂, Pressure (with kPa/bar readouts), Gravity (0g, 0.16g, 0.38g), and Airflow.</li>
                  <li>Target Closeness Search Radius (standardized Euclidean distance tolerance).</li>
                  <li>Live Animated Flow Regime Spectrum Bar with dynamic SVG vector schematics.</li>
                  <li>Comparison Graph Tabs (BASS-II flame spread, metadata discrepancies, and surrogate domain gate).</li>
                </ul>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-mono font-bold text-slate-900 text-sm block">
                The Provenance Contract (SPEC Section 2 Rule 2)
              </span>
              <p>
                Every single data number rendered in the application must carry provenance back to an authentic NASA PSI file, technical report, or official document. The UI refuses to render naked un-sourced numbers. Missing values render as a muted &quot;Not Reported&quot; badge while preserving access to raw cell text.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2 */}
        {activeTab === 'flow-regimes' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-sky-700 font-semibold tracking-wider">
                Microgravity Physics
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                Combustion Flow Regimes, Convective Coupling & Gravity Bounds
              </h2>
              <p className="text-slate-600 mt-1">
                How absence of buoyancy alters oxidizer transport, flame spread rate, and extinction limits.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-sky-900">Zone 1: Purely Diffusive Regime (~0 cm/s in μg)</span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-xs">v ≈ 0 cm/s</span>
                </div>
                <p className="text-xs text-slate-600">
                  In quiescent microgravity, oxidizer transport is governed purely by molecular diffusion (diffusion coefficient D ≈ 0.2 cm²/s). Flames form spherical, symmetric diffusion reaction zones (observed in FLEX isolated droplet combustion, PSI-69). Because fresh oxidizer is slow to arrive and combustion products linger around the flame, burning rates are slow and radiative loss can extinguish the flame.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-1.5">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-amber-950">Zone 2: Low-Velocity Ventilated Regime (0.1 – 10 cm/s in μg) — Peak Hazard</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-bold">Peak Hazard Zone</span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>The greatest fire hazard inside human spacecraft cabins.</strong> Forced ventilation fans (nominal 10–20 cm/s in ISS) replenish oxygen to the reaction zone far faster than molecular diffusion, but produce negligible convective cooling. Materials that self-extinguish in terrestrial 1g or stagnant microgravity sustain continuous burning (BASS-II Table 5.1, SAFFIRE-II).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-slate-900">Zone 3: Convective / Blowoff Regime (&gt; 15 cm/s in μg)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs">Cooling Dominant</span>
                </div>
                <p className="text-xs text-slate-600">
                  At higher forced velocities, convective heat loss from the flame base overcomes chemical heat release rates, leading to convective blowoff extinction.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-950">
              <span className="font-mono font-bold text-sm uppercase block text-rose-900">
                Rule 5: Non-Extrapolability of Partial Gravity (Moon 0.16g / Mars 0.38g)
              </span>
              <p>
                NASA Physical Sciences Informatics contains exactly 0 partial-gravity combustion flight datasets.
                Partial-gravity flame behavior cannot be mathematically interpolated between 0g and 1g because natural convection scales non-linearly with the Grashof number ($Gr \propto g$), while soot residence times and chemical kinetic scales decouple unpredictably. Only 0g and 1g serve as verified empirical bounds.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3 */}
        {activeTab === 'oxygen-isolation' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-sky-700 font-semibold tracking-wider">
                SPEC Section 2 Rule 4
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                Cabin Atmosphere vs. Burner Flow Oxygen Isolation
              </h2>
              <p className="text-slate-600 mt-1">
                Why industrial burner co-flow oxygen cannot be counted toward crew-habitable exploration environments.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <strong className="text-slate-900 text-sm font-mono block">The Separation Mandate</strong>
                <p>
                  Oxygen in burner nozzle flows (e.g. CFI-G up to 85% O₂, Flame Design up to 85% O₂) is strictly segregated into <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-amber-800">burner_flow_o2_pct</code> and never treated as habitable cabin air.
                </p>
              </div>

              <div className="p-5 bg-rose-50 rounded-xl border border-rose-200 space-y-3 text-rose-950">
                <strong className="text-rose-900 text-sm font-mono block">
                  The Planned Lunar Exploration Habitat Gap
                </strong>
                <p>
                  NASA NTRS 20210022143 specifies the planned lunar habitat atmosphere for the Artemis program:
                  <strong> 34% O₂ at 8.2 psi (56.5 kPa)</strong>.
                </p>
                <p className="font-bold">
                  Across all 18 NASA PSI investigations, exactly 0 ambient cabin-air table rows combine O₂ ≥ 30% with Pressure ≤ 10.2 psi.
                </p>
                <p className="text-xs text-slate-700">
                  The nearest measured flight test sits at 10.33 psi (FLEX Test 24, 31.0% O₂). The entire lunar operational envelope remains unmeasured in microgravity flight records.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 */}
        {activeTab === 'data-pipeline' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-sky-700 font-semibold tracking-wider">
                Audited Dataset
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                Data Pipeline, Ingestion Census & Verbatim Quotes
              </h2>
              <p className="text-slate-600 mt-1">
                Complete breakdown of all 1,815 ingested table rows across 18 NASA PSI investigations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Total Ingested</span>
                <span className="text-xl font-bold text-slate-900">1,815 rows</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">1,807 runs + 8 candidate</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Reporting Both O₂ & P</span>
                <span className="text-xl font-bold text-sky-800">640 rows</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">274 cabin + 366 burner</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Verified Quotes</span>
                <span className="text-xl font-bold text-emerald-700">65 / 65</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">100% Verbatim</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Audited Fields</span>
                <span className="text-xl font-bold text-indigo-700">87 / 87</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">100% Provenance</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-mono font-bold text-slate-900 text-sm block">
                Primary Experimental Tables Ingested
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono">
                <li><strong>BASS-II (PSI-25):</strong> 129 flight tests (125 non-suspect) across PMMA slabs, rods, Nomex, SIBAL, and candles. Table 5.1 from NASA/TM-20210011385 provides 20 flat PMMA tests.</li>
                <li><strong>FLEX (PSI-69):</strong> 274 isolated droplet combustion kinetics runs across heptane, methanol, and decane.</li>
                <li><strong>FLEX-2 (PSI-68):</strong> 8 droplet extinction candidate parameter sets.</li>
                <li><strong>SAFFIRE-II (PSI-99):</strong> 15 large-scale fabric flammability tests in Cygnus vehicle.</li>
                <li><strong>CFI-G (PSI-159):</strong> 179 burner-stabilized normal flame runs.</li>
                <li><strong>SAME & SAME-R (PSI-102 / PSI-101):</strong> 117 particulate and aerosol smoke detection runs.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5 */}
        {activeTab === 'surrogate-models' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-sky-700 font-semibold tracking-wider">
                PREREGISTERED Rev 5
              </span>
              <h2 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                Surrogate Modeling & The 3-Tier Applicability Domain Gate
              </h2>
              <p className="text-slate-600 mt-1">
                Machine learning surrogate models serve strictly as empirical demonstrators on liquid droplets, NOT habitat safety predictors.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  Leave-One-Condition-Out (LOCO) Cross-Validation
                </span>
                <p>
                  Models were trained strictly on extinguishing liquid droplets from FLEX (PSI-69) and evaluated with grouped LOCO-CV:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Random Forest (In-Domain)</span>
                    <span className="text-base font-bold text-emerald-700">MAE 0.36 mm</span>
                    <span className="text-slate-400 block text-[10px]">95% CI: [0.31, 0.42]</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">3-Nearest Neighbors</span>
                    <span className="text-base font-bold text-slate-700">MAE 0.59 mm</span>
                    <span className="text-slate-400 block text-[10px]">95% CI: [0.52, 0.67]</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-amber-50/70 rounded-xl border border-amber-300 space-y-2 text-amber-950">
                <span className="font-mono font-bold text-sm uppercase block text-amber-900">
                  Extrapolation Error Surges
                </span>
                <p>
                  When highest-pressure or highest-O₂ conditions were held out, test errors increased by <strong>+51.5% for Random Forest</strong> up to <strong>+330% for Polynomial-2 regression</strong>.
                </p>
                <p>
                  Because the planned lunar habitat atmosphere (34% O₂, 8.2 psi) sits outside measured coordinates, the 3-tier domain gate deterministically <strong>REFUSES</strong> any prediction.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
