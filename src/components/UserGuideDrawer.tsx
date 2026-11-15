'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, BookOpen, Layers, Wind, ShieldAlert, Database, ChevronRight, ExternalLink, Search } from 'lucide-react';
import { useDashboard, GuideTab } from '@/context/DashboardContext';

export function UserGuideDrawer() {
  const { guideOpen, guideTab, openGuide, closeGuide } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');

  if (!guideOpen) return null;

  const tabs: { id: GuideTab; label: string; icon: React.ReactNode }[] = [
    { id: 'quickstart', label: '1. Quick Start & Dual Modes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'flow-regimes', label: '2. Flow Regimes & Physics', icon: <Wind className="w-4 h-4" /> },
    { id: 'oxygen-isolation', label: '3. Cabin Air vs. Burner O₂', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'data-pipeline', label: '4. Data Census & Provenance', icon: <Database className="w-4 h-4" /> },
    { id: 'surrogate-models', label: '5. Models & Domain Gate', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeGuide}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center font-bold text-xs font-mono">
                DOC
              </div>
              <div>
                <h2 className="text-base font-bold font-mono text-slate-900">
                  PYRO-ASTRA Scientific User Guide
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  Methodology, microgravity combustion physics & provenance references
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/guide"
                target="_blank"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 text-xs font-mono inline-flex items-center gap-1"
                title="Open full guide page in new tab"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={closeGuide}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="p-3 border-b border-slate-200 bg-white overflow-x-auto flex gap-1.5 shrink-0">
            {tabs.map((tab) => {
              const active = guideTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => openGuide(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    active
                      ? 'bg-sky-50 text-sky-800 border border-sky-200 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed font-sans">
            {/* TAB 1: QUICK START & DUAL MODES */}
            {guideTab === 'quickstart' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-700 font-semibold tracking-wider">
                    Getting Started
                  </span>
                  <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    Dual-Mode Architecture: Beginner vs. Advanced
                  </h3>
                  <p className="text-slate-600 mt-1">
                    PYRO-ASTRA provides two tailored interfaces to balance instant clarity with deep parametric control.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <span className="font-mono font-bold text-emerald-900 text-xs block">
                      [Beginner Mode] Strictly 2 Inputs &rarr; 3 Outputs
                    </span>
                    <p className="text-slate-700">
                      Designed for rapid exploration. You only select:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li><strong>Environment Preset:</strong> Lunar Habitat (34% O₂, 8.2 psi), ISS Cabin (21% O₂, 14.7 psi), or Spacesuit (100% O₂, 4.3 psi).</li>
                      <li><strong>Material:</strong> PMMA, Nomex, SIBAL cotton-fiberglass, Heptane, Methanol, etc.</li>
                    </ul>
                    <p className="text-slate-700 pt-1">
                      Instantly yields: a customizable X-Y variable scatter chart, a matched empirical flight data table, and primary NASA literature citations.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-2">
                    <span className="font-mono font-bold text-sky-900 text-xs block">
                      [Advanced Mode] Full Parametric Workbench
                    </span>
                    <p className="text-slate-700">
                      Designed for combustion engineers and flight safety specialists:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Granular continuous sliders for O₂, Pressure, Gravity, and Airflow.</li>
                      <li>Target Closeness tolerance specification (Euclidean distance radius).</li>
                      <li>Interactive vector flow regime bar with dynamic SVG diagrams.</li>
                      <li>Comparison tabs: X-Y coverage, BASS-II flame spread, and 3-tier surrogate domain gate.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    The Provenance Contract: How to Inspect Any Number
                  </span>
                  <p className="text-slate-600">
                    In compliance with SPEC Section 2 Rule 2, the UI refuses to display naked, ungrounded numbers.
                    Every data value rendered on screen carries a verifiable scientific provenance card:
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] space-y-1 text-slate-600">
                    <div><strong>Hover or Click:</strong> Any highlighted number in tables or charts to reveal:</div>
                    <div className="text-sky-800">• Authentic NASA Source File (<code className="bg-slate-100 px-1 py-0.5 rounded">raw_real/...</code>)</div>
                    <div className="text-sky-800">• File SHA-256 Checksum from <code className="bg-slate-100 px-1 py-0.5 rounded">manifest.sha256</code></div>
                    <div className="text-sky-800">• Specific Table Row ID & Column Header</div>
                    <div className="text-sky-800">• Official DOI Link to NASA technical repository</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FLOW REGIMES & PHYSICS */}
            {guideTab === 'flow-regimes' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-700 font-semibold tracking-wider">
                    Microgravity Transport Physics
                  </span>
                  <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    Flow Regimes, Convective Coupling & Gravity Bounds
                  </h3>
                  <p className="text-slate-600 mt-1">
                    In terrestrial 1g environments, hot combustion exhaust is less dense than ambient air, causing strong buoyant upward flow. In orbital microgravity (~10⁻⁶g), buoyancy vanishes.
                  </p>
                </div>

                {/* 3 Zones */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-sky-900">Zone 1: Purely Diffusive Regime (~0 cm/s in μg)</span>
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px]">v ≈ 0</span>
                    </div>
                    <p className="text-slate-600">
                      In stagnant, quiescent microgravity, oxygen reaches the flame zone solely through molecular diffusion (diffusion coefficient D ≈ 0.2 cm²/s). Flames form symmetric, spherical diffusion envelopes (observed in isolated liquid droplets such as FLEX PSI-69). Combustion rates are diffusion-limited and flames burn slowly or self-extinguish due to radiative cooling.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 space-y-1.5">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-amber-950">Zone 2: Low-Velocity Ventilated Regime (0.1 – 10 cm/s in μg)</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Peak Hazard</span>
                    </div>
                    <p className="text-slate-700">
                      <strong>The primary spacecraft fire hazard.</strong> Gentle forced airflow (such as crew cabin ventilation fans, nominal 10–20 cm/s) continuously supplies fresh oxygen to the flame faster than molecular diffusion, but creates negligible convective cooling. Thin plastics, fabrics, and PMMA slabs burn vigorously and can sustain flame spread at velocities that would extinguish on Earth (documented in BASS-II Table 5.1 and SAFFIRE-II).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-slate-900">Zone 3: Convective / Blowoff Regime (&gt; 15 cm/s in μg)</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px]">Cooling Dominant</span>
                    </div>
                    <p className="text-slate-600">
                      At higher duct velocities, convective cooling strips thermal energy from the flame base faster than chemical heat release can sustain it, leading to convective blowoff extinction.
                    </p>
                  </div>
                </div>

                {/* Flow Directions */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    Flow Directions: Opposed vs. Concurrent Flow
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block font-mono">Opposed Flow (⇄)</strong>
                      <p>
                        The oxidizer flow opposes the direction of flame spread (e.g. BASS-II flat PMMA slabs). The flame propagates into fresh incoming oxidizer. Steady-state spread rates are reproducible and governed by solid thermal conduction.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block font-mono">Concurrent Flow (⇉)</strong>
                      <p>
                        The oxidizer flow moves in the same direction as flame spread (e.g. SAFFIRE-II large-scale fabrics in Cygnus). Hot combustion gases preheat the unburned material downstream, leading to accelerating flame spread and larger reaction zones.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rule 5 Partial Gravity Non-Extrapolability */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-950">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-mono font-bold text-xs uppercase">
                      Rule 5: Non-Extrapolability of Partial Gravity (Moon 0.16g / Mars 0.38g)
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    NASA PSI holds exactly <strong>0</strong> partial-gravity combustion flight records.
                    Partial gravity cannot be mathematically interpolated between 0g and 1g because natural convection scales non-linearly with the Grashof number ($Gr \propto g$), and chemical reaction kinetics decouple from soot residence times unpredictably. 0g and 1g serve strictly as bounding regimes.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: OXYGEN ISOLATION (CABIN VS BURNER) */}
            {guideTab === 'oxygen-isolation' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-700 font-semibold tracking-wider">
                    SPEC Section 2 Rule 4
                  </span>
                  <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    Why Cabin Air ≠ Burner Flow Oxygen
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Segregating crew-habitable ambient air from industrial burner oxidizer feed streams is essential to prevent false fire safety assertions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    The Rule 4 Separation Principle
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    Several NASA investigations evaluate gas burners where oxygen-enriched oxidizer streams are fed directly through nozzle injectors into a flame. This local nozzle stream does <strong>NOT</strong> represent ambient cabin air:
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      <strong>CFI-G (PSI-159):</strong> 20 table rows tested at chamber pressure 7.35 psi with burner nozzle O₂ between 35.85% and 39.26%. This oxygen exists strictly inside the co-flow nozzle; the chamber ambient air was not habitable crew atmosphere.
                    </div>
                    <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      <strong>Flame Design (PSI-10):</strong> 18 table rows tested oxidizer streams with 31.97% to 85.0% O₂ at 6.26 to 7.57 psi. These are burner co-flows, not ambient atmospheres.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-950">
                  <span className="font-mono font-bold text-xs uppercase block text-rose-900">
                    The Planned Lunar Habitat Atmosphere Gap
                  </span>
                  <p className="leading-relaxed text-slate-700">
                    NASA Technical Report NTRS 20210022143 establishes the planned lunar exploration habitat design point:
                    <strong> 34% O₂ at 8.2 psi (56.5 kPa)</strong>.
                  </p>
                  <p className="leading-relaxed text-slate-700">
                    Across the entire NASA Physical Sciences Informatics public repository:
                    <strong> Exactly 0 ambient cabin-air table rows combine O₂ ≥ 30% with Pressure ≤ 10.2 psi.</strong>
                  </p>
                  <p className="text-[11px] font-mono text-rose-800 font-semibold pt-1">
                    The nearest documented cabin-air test sits at 10.33 psi (FLEX Test 24, 31.0% O₂) — above the lunar pressure envelope.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: DATA CENSUS & PROVENANCE */}
            {guideTab === 'data-pipeline' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-700 font-semibold tracking-wider">
                    Full Data Census
                  </span>
                  <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    Data Pipeline, Ingestion Census & Integrity Audit
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Every data value in PYRO-ASTRA is derived exclusively from authentic NASA PSI experimental tables, technical memoranda, and metadata.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Total Ingested Rows</span>
                    <span className="text-lg font-bold text-slate-900">1,815</span>
                    <span className="text-[10px] text-slate-400 block">1,807 runs + 8 candidate</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Reporting O₂ & P</span>
                    <span className="text-lg font-bold text-sky-800">640</span>
                    <span className="text-[10px] text-slate-400 block">274 cabin + 366 burner</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Verified Quotes</span>
                    <span className="text-lg font-bold text-emerald-700">65 / 65</span>
                    <span className="text-[10px] text-slate-400 block">100% Verbatim Substrings</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Audited Provenance</span>
                    <span className="text-lg font-bold text-indigo-700">87 / 87</span>
                    <span className="text-[10px] text-slate-400 block">0 Naked Numbers</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    Source File Ingestion Map
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px] text-slate-600">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>BASS-II (PSI-25) Flat PMMA Slab Table 5.1</span>
                      <span className="text-slate-900 font-semibold">20 flight runs (TM-20210011385)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>BASS-II (PSI-25) Experimental Table CSV</span>
                      <span className="text-slate-900 font-semibold">129 test runs (125 non-suspect)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>FLEX (PSI-69) Droplet Combustion CSV</span>
                      <span className="text-slate-900 font-semibold">274 droplet runs</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>FLEX-2 (PSI-68) Droplet Extinction CSV</span>
                      <span className="text-slate-900 font-semibold">8 candidate sets</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>SAFFIRE-II (PSI-99) Fabric Flammability CSV</span>
                      <span className="text-slate-900 font-semibold">15 large-scale fabric runs</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>CFI-G (PSI-159) Normal Flames CSV</span>
                      <span className="text-slate-900 font-semibold">179 burner-stabilized runs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SAME / SAME-R (PSI-102 / PSI-101) Smoke Tables</span>
                      <span className="text-slate-900 font-semibold">117 aerosol detection runs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SURROGATE MODELS & DOMAIN GATE */}
            {guideTab === 'surrogate-models' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-700 font-semibold tracking-wider">
                    PREREGISTERED Rev 5 Protocol
                  </span>
                  <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    Surrogate Modeling, LOCO-CV & The 3-Tier Domain Gate
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Machine learning models serve as empirical demonstrators on liquid droplets, NOT habitat fire safety predictors.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    The 3-Tier Applicability Domain Gate
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    Every surrogate inference request must sequentially clear three algorithmic tiers before generating a point estimate:
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                      <strong className="text-slate-900">Tier 1 — Bounding Box Check:</strong>
                      <p className="text-slate-600 font-sans">
                        Query parameters must fall strictly within empirical coordinate minimums and maximums (d₀: 0.86–5.2 mm, O₂: 12–34%, P: 10.33–14.7 psi).
                      </p>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                      <strong className="text-slate-900">Tier 2 — Per-Fuel Convex Hull:</strong>
                      <p className="text-slate-600 font-sans">
                        Query parameters must fall inside the convex polygon formed by measured points for that specific fuel (Heptane O₂ max is 24%, Methanol O₂ max is 34%).
                      </p>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                      <strong className="text-slate-900">Tier 3 — Standardized Distance Threshold:</strong>
                      <p className="text-slate-600 font-sans">
                        Standardized Euclidean distance to the nearest training condition must satisfy D_max ≤ 1.5 × P₉₅.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-2 text-xs text-amber-950">
                  <span className="font-mono font-bold text-xs uppercase block text-amber-900">
                    Extrapolation Finding (PREREGISTERED Rev 5)
                  </span>
                  <p className="leading-relaxed text-slate-700">
                    On the FLEX droplet data, error surged by <strong>+51.5% (Random Forest)</strong> up to <strong>+330% (Polynomial-2)</strong> when the highest-pressure or highest-O₂ conditions were held out.
                  </p>
                  <p className="leading-relaxed text-slate-700">
                    The planned lunar exploration habitat condition (34% O₂, 8.2 psi) is outside every measured microgravity range and is deterministically <strong>REFUSED</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>SPEC Section 2 & 22 Compliant</span>
            <button
              onClick={closeGuide}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
