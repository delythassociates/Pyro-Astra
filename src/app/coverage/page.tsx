'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Val } from '@/components/Val';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import { findNearestEvidence } from '@/lib/nearest';
import { HABITAT_PRESETS } from '@/lib/presets';

function CoverageContent() {
  const searchParams = useSearchParams();
  const initialPresetParam = searchParams.get('preset') || 'moon-base';
  const initialPreset =
    HABITAT_PRESETS.find((p) => p.id === initialPresetParam) || HABITAT_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'solid' | 'liquid droplet' | 'gas' | 'smoke'>('all');
  const activePreset =
    HABITAT_PRESETS.find((p) => p.id === selectedPresetId) || HABITAT_PRESETS[0];

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 460;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 55;

  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  // Domain axes: X is Pressure [0, 45] psi, Y is O2 [10, 100] %
  const xMin = 0;
  const xMax = 45;
  const yMin = 10;
  const yMax = 100;

  const scaleX = (psi: number | null | undefined) => {
    const val = psi ?? 0;
    const clamped = Math.max(xMin, Math.min(xMax, val));
    return padLeft + ((clamped - xMin) / (xMax - xMin)) * innerWidth;
  };

  const scaleY = (o2: number | null | undefined) => {
    const val = o2 ?? yMin;
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padTop + innerHeight - ((clamped - yMin) / (yMax - yMin)) * innerHeight;
  };

  // Nearest evidence analysis
  const nearestOutput = useMemo(() => {
    return findNearestEvidence(DEFAULT_INVESTIGATIONS, {
      o2: activePreset.o2Range,
      pressure: activePreset.pressureRange,
    });
  }, [activePreset]);

  // Active hover inspection
  const [hoveredRecord, setHoveredRecord] = useState<string | null>(null);

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-cyan-900/40 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <span>Atmospheric Regime Coverage</span>
            <span>·</span>
            <span>SPEC Section 8</span>
          </div>
          <h1 className="text-3xl font-black font-mono text-white mt-1">
            PSI Atmospheric Coverage Map & Nearest Evidence
          </h1>
          <p className="text-sm text-zinc-400 font-sans mt-1">
            Pressure (0–45 psi) vs O₂ (10–100%). Identifies tested flight domains, shaded habitat boundaries, and highlights unplottable records.
          </p>
        </div>

        {/* Visible Scope Note (SPEC Section 2 Rule 6) */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs font-mono">
          <span className="text-base">⚠</span>
          <span>
            <strong className="text-amber-100 font-semibold">Scope Boundary:</strong> Rockets and propellants are out of scope. PYRO-ASTRA exclusively evaluates spacecraft cabin, lunar/Martian habitat, and pressurized rover fire safety from NASA PSI.
          </span>
        </div>

        {/* Habitat Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-cyan-900/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Overlay Habitat:
            </span>
            <div className="flex flex-wrap gap-2">
              {HABITAT_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-white font-bold shadow'
                        : 'bg-slate-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs font-mono text-cyan-300">
            Selected: <strong className="text-white">{activePreset.name}</strong> ({activePreset.o2Range.min}–{activePreset.o2Range.max}% O₂, {activePreset.pressureRange.min}–{activePreset.pressureRange.max} psi)
          </div>
        </div>

        {/* Fuel Phase Partition Filter (Non-Conflation Protocol) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-cyan-900/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Filter by Fuel Phase:
            </span>
            <div className="flex flex-wrap gap-2">
              {(['all', 'solid', 'liquid droplet', 'gas', 'smoke'] as const).map((phase) => {
                const isSelected = selectedPhase === phase;
                return (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => setSelectedPhase(phase)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white font-bold shadow'
                        : 'bg-slate-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {phase}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs font-mono text-amber-300">
            Phase Active: <strong className="text-white uppercase">{selectedPhase}</strong>
          </div>
        </div>

        {/* Planned Lunar Habitat vs Fuel Phase Evaluation Banner */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs font-mono space-y-1.5 text-zinc-300">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 uppercase tracking-wider">
              Target Planned Lunar Habitat (34% O₂, 8.2 psi) vs {selectedPhase.toUpperCase()} Data
            </span>
            <span className="text-[10px] text-zinc-500">Source: NASA NTRS-20210022143</span>
          </div>
          <p className="text-amber-100">
            {selectedPhase === 'solid'
              ? 'BASS-II reports initial O2 of 13.6–22.2% across 129 table rows (rods, films, slabs, SIBAL, Nomex III). No chamber pressure is reported. Maximum initial O2 in this table is 22.2%, below the ≥30% planned lunar atmosphere (34% O2 / 8.2 psi, NTRS 20210022143). Scoped to the public record mined here.'
              : selectedPhase === 'liquid droplet'
              ? 'In the authentic flight experimental table for FLEX (PSI-69, 274 rows), 0 rows combine O2 ≥ 30% and pressure ≤ 10.2 psi (near-miss: every FLEX row with O2 >= 30% is at >= 10.33 psi; 24 rows at O₂ ≥ 30% operate at 10.33–44.86 psi; 2 rows at P ≤ 10.2 psi operate at O₂ ≤ 20%). FLEX-2 (PSI-68) candidate sets reach 30% O2 and 0.5 atm (7.35 psi), unconfirmed combination across individual runs. Droplet burning kinetics do not substitute for solid material screening.'
              : selectedPhase === 'gas'
              ? 'CFI-G (PSI-159) records 20 rows at 7.35 psi with burner O2 35.85–39.26%, burner flow only, not cabin air (Rule 4). Flame Design (PSI-10) records 18 Inverse Flame rows at 6.26–7.57 psi with oxidizer O2 31.97–85%, oxidizer stream only, not cabin air. Cabin O2 is not reported for either.'
              : selectedPhase === 'smoke'
              ? 'SAME (PSI-102) and SAME-R (PSI-101) evaluated smoke and aerosol detectors. Cabin O2 and pressure are not reported in public metadata.'
              : '640 table rows report both (274 cabin rows, 366 burner/oxidizer rows); none are >=30% O2 and <=10.2 psi in cabin air. Total corpus = 1,807 discrete test runs + 8 candidate sets (1,815 table rows). Droplet breakdown: 369 table rows = 274 runs (FLEX, PSI-69) + 87 runs (CFI, PSI-39) + 8 candidate sets (FLEX-2, PSI-68). BASS-II solid tests never exceed 22.2% initial O2 (pressure unrecorded); FLEX near-miss shows every FLEX row with O2 >= 30% is at >= 10.33 psi; FLEX-2 candidate sets reach 30% O2 and 0.5 atm (7.35 psi), unconfirmed combination across individual runs; CFI-G has 20 rows at 7.35 psi with burner O2 35.85–39.26% and Flame Design has 18 rows at 6.26–7.57 psi with oxidizer O2 31.97–85%, oxidizer stream only, not cabin air.'}
          </p>
        </div>

        {/* SVG Coverage Map & Inspection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-slate-900/40 p-4 sm:p-6 rounded-2xl border border-cyan-900/40 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                NASA PSI Flight Investigations Tested Cabin Atmosphere
              </span>
              <span className="text-zinc-500">Axes: Pressure vs O₂</span>
            </div>

            {/* SVG Visualizer */}
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[580px] select-none"
              >
                {/* SVG Definitions for hatching and gradients */}
                <defs>
                  <pattern
                    id="burnerHatch"
                    patternUnits="userSpaceOnUse"
                    width="10"
                    height="10"
                    patternTransform="rotate(45)"
                  >
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#f59e0b" strokeWidth="2.5" />
                  </pattern>
                  <pattern
                    id="habitatHatch"
                    patternUnits="userSpaceOnUse"
                    width="8"
                    height="8"
                    patternTransform="rotate(-45)"
                  >
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.25" />
                  </pattern>
                </defs>

                {/* Background Grid */}
                <rect
                  x={padLeft}
                  y={padTop}
                  width={innerWidth}
                  height={innerHeight}
                  fill="#030712"
                  stroke="#1e293b"
                />

                {/* Horizontal Grid lines (O2: 10, 20, 40, 60, 80, 100) */}
                {[10, 20, 40, 60, 80, 100].map((o2) => (
                  <g key={`y-${o2}`}>
                    <line
                      x1={padLeft}
                      y1={scaleY(o2)}
                      x2={padLeft + innerWidth}
                      y2={scaleY(o2)}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padLeft - 8}
                      y={scaleY(o2) + 4}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {o2}%
                    </text>
                  </g>
                ))}

                {/* Vertical Grid lines (Pressure: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45 psi) */}
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45].map((p) => (
                  <g key={`x-${p}`}>
                    <line
                      x1={scaleX(p)}
                      y1={padTop}
                      x2={scaleX(p)}
                      y2={padTop + innerHeight}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={scaleX(p)}
                      y={padTop + innerHeight + 16}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {p}
                    </text>
                  </g>
                ))}

                {/* Axis Labels */}
                <text
                  x={padLeft + innerWidth / 2}
                  y={padTop + innerHeight + 38}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Pressure (psi)
                </text>
                <text
                  x={-(padTop + innerHeight / 2)}
                  y={18}
                  transform="rotate(-90)"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Oxygen Concentration (% O₂)
                </text>

                {/* Shaded Active Habitat Region */}
                {(() => {
                  const hx1 = scaleX(activePreset.pressureRange.min);
                  const hx2 = scaleX(activePreset.pressureRange.max);
                  const hy1 = scaleY(activePreset.o2Range.max);
                  const hy2 = scaleY(activePreset.o2Range.min);
                  const hw = Math.max(4, hx2 - hx1);
                  const hh = Math.max(4, hy2 - hy1);

                  return (
                    <g>
                      <title>range envelope: bounds of reported ranges; individual test combinations not confirmed.</title>
                      <rect
                        x={hx1}
                        y={hy1}
                        width={hw}
                        height={hh}
                        fill="url(#habitatHatch)"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={hx1 + 6}
                        y={hy1 + 16}
                        fill="#38bdf8"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        Target: {activePreset.name}
                      </text>
                    </g>
                  );
                })()}

                {/* Reference Range: Earth Sea Level (14.5-14.7 psi, 20.9-21.0% O2) */}
                <g>
                  <title>range envelope: bounds of reported ranges; individual test combinations not confirmed.</title>
                  <rect
                    x={scaleX(14.5)}
                    y={scaleY(21.0)}
                    width={Math.max(12, scaleX(14.7) - scaleX(14.5))}
                    height={Math.max(10, scaleY(20.9) - scaleY(21.0))}
                    fill="#10b981"
                    fillOpacity={0.3}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    rx="2"
                  />
                  <text
                    x={scaleX(14.5) - 6}
                    y={scaleY(21.0) + 9}
                    textAnchor="end"
                    fill="#10b981"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Earth Ref (14.5–14.7 psi, 20.9–21% O₂)
                  </text>
                </g>

                {/* Reference Range: Spacesuit EVA (4.0-4.3 psi, 95-100% O2) */}
                <g>
                  <title>range envelope: bounds of reported ranges; individual test combinations not confirmed.</title>
                  <rect
                    x={scaleX(4.0)}
                    y={scaleY(100)}
                    width={Math.max(14, scaleX(4.3) - scaleX(4.0))}
                    height={Math.max(16, scaleY(95) - scaleY(100))}
                    fill="#a855f7"
                    fillOpacity={0.3}
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    rx="2"
                  />
                  <text
                    x={scaleX(4.3) + 8}
                    y={scaleY(97.5) + 3}
                    textAnchor="start"
                    fill="#a855f7"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Spacesuit (4.0–4.3 psi, 95–100% O₂)
                  </text>
                </g>

                {/* Shaded Ranges: Single-Axis Published Ranges (e.g. BASS-II O2, FLEX Pressure) */}
                {/* BASS-II Published Cabin O2 Range: 13.6% - 22.2% across 129 table rows */}
                {(() => {
                  const bass2 = DEFAULT_INVESTIGATIONS.find((inv) => inv.id === 'PSI-25');
                  if (!bass2?.cabin_o2_pct?.value) return null;
                  const o2 = bass2.cabin_o2_pct.value;
                  const yTop = scaleY(o2.max);
                  const yBottom = scaleY(o2.min ?? o2.max);
                  const isHovered = hoveredRecord === 'PSI-25';

                  return (
                    <g
                      key="bass2-band"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRecord('PSI-25')}
                      onMouseLeave={() => setHoveredRecord(null)}
                    >
                      <title>range envelope: bounds of reported ranges; individual test combinations not confirmed.</title>
                      <rect
                        x={padLeft}
                        y={yTop}
                        width={innerWidth}
                        height={Math.max(8, yBottom - yTop)}
                        fill="#0284c7"
                        fillOpacity={isHovered ? 0.35 : 0.18}
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                        strokeDasharray="4 2"
                      />
                      <text
                        x={padLeft + 12}
                        y={yTop + 13}
                        fill="#38bdf8"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        BASS-II Tested O₂ Band ({o2.min}–{o2.max}% O₂ across 129 table rows)
                      </text>
                      <text
                        x={padLeft + 12}
                        y={yTop + 24}
                        fill="#94a3b8"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        range envelope: bounds of reported ranges; individual test combinations not confirmed.
                      </text>
                    </g>
                  );
                })()}

                {/* FLEX Published Chamber Pressure Range: 7.35 - 22.04 psi (0.5-1.5 atm) */}
                {(() => {
                  const flex = DEFAULT_INVESTIGATIONS.find((inv) => inv.id === 'PSI-69');
                  if (!flex?.pressure_psi?.value) return null;
                  const p = flex.pressure_psi.value;
                  const xLeft = scaleX(p.min ?? p.max);
                  const xRight = scaleX(p.max);
                  const isHovered = hoveredRecord === 'PSI-69';

                  return (
                    <g
                      key="flex-band"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRecord('PSI-69')}
                      onMouseLeave={() => setHoveredRecord(null)}
                    >
                      <title>range envelope: bounds of reported ranges; individual test combinations not confirmed.</title>
                      <rect
                        x={xLeft}
                        y={padTop}
                        width={Math.max(10, xRight - xLeft)}
                        height={innerHeight}
                        fill="#06b6d4"
                        fillOpacity={isHovered ? 0.3 : 0.15}
                        stroke="#22d3ee"
                        strokeWidth="1.2"
                        strokeDasharray="4 2"
                      />
                      <text
                        x={xLeft + 6}
                        y={padTop + innerHeight - 22}
                        fill="#22d3ee"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        FLEX Pressure Band ({p.min}–{p.max} psi · 0.5–1.5 atm)
                      </text>
                      <text
                        x={xLeft + 6}
                        y={padTop + innerHeight - 11}
                        fill="#94a3b8"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        range envelope: bounds of reported ranges; individual test combinations not confirmed.
                      </text>
                    </g>
                  );
                })()}

                {/* Plot Deep Investigations with Both Tested Cabin Atmospheres (2D Shaded Regions) */}
                {DEFAULT_INVESTIGATIONS.map((inv) => {
                  if (!inv.cabin_o2_pct?.value || !inv.pressure_psi?.value) return null;

                  const o2 = inv.cabin_o2_pct.value;
                  const p = inv.pressure_psi.value;

                  const x1 = scaleX(p.min ?? p.max);
                  const x2 = scaleX(p.max);
                  const y1 = scaleY(o2.max);
                  const y2 = scaleY(o2.min ?? o2.max);

                  const w = Math.max(10, x2 - x1);
                  const h = Math.max(10, y2 - y1);

                  const isHovered = hoveredRecord === inv.id;

                  return (
                    <g
                      key={inv.id}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredRecord(inv.id)}
                      onMouseLeave={() => setHoveredRecord(null)}
                    >
                      <title>range envelope: bounds of reported ranges; individual test combinations not confirmed.</title>
                      <rect
                        x={x1}
                        y={y1}
                        width={w}
                        height={h}
                        fill={isHovered ? '#38bdf8' : '#0284c7'}
                        fillOpacity={isHovered ? 0.85 : 0.55}
                        stroke="#e0f2fe"
                        strokeWidth={isHovered ? 2.5 : 1.2}
                        rx="3"
                      />
                      <text
                        x={x1 + w / 2}
                        y={y1 + Math.min(20, h / 2)}
                        textAnchor="middle"
                        fill={isHovered ? '#ffffff' : '#e0f2fe'}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {inv.acronym}
                      </text>
                      <text
                        x={x1 + w / 2}
                        y={y1 + Math.min(32, h / 2 + 12)}
                        textAnchor="middle"
                        fill="#bae6fd"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        range envelope: bounds of reported ranges; individual test combinations not confirmed.
                      </text>
                    </g>
                  );
                })}

                {/* Plot Burner Flow O2 with Hatched Marker (SPEC Section 8 Rule 4) */}
                {/* For example CFI-G PSI-159: burner_flow_o2_pct up to 85%, pressure 14.5-29.4 psi */}
                {(() => {
                  const cfig = DEFAULT_INVESTIGATIONS.find((inv) => inv.id === 'PSI-159');
                  if (!cfig || !cfig.burner_flow_o2_pct?.value || !cfig.pressure_psi?.value)
                    return null;

                  const bo2 = cfig.burner_flow_o2_pct.value;
                  const bp = cfig.pressure_psi.value;

                  const bx1 = scaleX(bp.min ?? bp.max);
                  const bx2 = scaleX(Math.min(xMax, bp.max));
                  const by1 = scaleY(bo2.max);
                  const by2 = scaleY(bo2.min ?? 21);
                  const bw = Math.max(12, bx2 - bx1);
                  const bh = Math.max(12, by2 - by1);

                  return (
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRecord('PSI-159')}
                      onMouseLeave={() => setHoveredRecord(null)}
                    >
                      <title>range envelope: bounds of reported ranges; individual test combinations not confirmed.</title>
                      <rect
                        x={bx1}
                        y={by1}
                        width={bw}
                        height={bh}
                        fill="url(#burnerHatch)"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        rx="3"
                      />
                      <text
                        x={bx1 + bw / 2}
                        y={by1 + bh / 2 - 4}
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow"
                      >
                        CFI-G (Burner Flow)
                      </text>
                      <text
                        x={bx1 + bw / 2}
                        y={by1 + bh / 2 + 9}
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="7"
                        fontFamily="monospace"
                        className="pointer-events-none drop-shadow"
                      >
                        range envelope: bounds of reported ranges; individual test combinations not confirmed.
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800 text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sky-600 border border-sky-300" />
                  <span>Cabin Atmosphere (Flight Data)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded border border-amber-500 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_2px,transparent_2px,transparent_6px)]" />
                  <span className="text-amber-400">Burner Flow (Not Cabin O₂)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded border border-dashed border-cyan-400" />
                  <span className="text-cyan-300">Target Habitat Region</span>
                </span>
              </div>

              <div className="text-[11px] text-zinc-400">
                <span className="font-semibold text-cyan-400">Notice:</span> Every shaded region is a <strong>range envelope: bounds of reported ranges; individual test combinations not confirmed.</strong> Rockets and propellants are out of scope.
              </div>
            </div>
          </div>

          {/* Right Column: Nearest Evidence & Gaps */}
          <div className="lg:col-span-4 space-y-6">
            {/* Nearest Evidence Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h2 className="text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider">
                  Nearest Evidence Match
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/40">
                  lib/nearest.ts
                </span>
              </div>

              {nearestOutput.closest ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono text-white">
                        {nearestOutput.closest.record.acronym}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {nearestOutput.closest.record.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-mono font-black text-cyan-300">
                        {nearestOutput.closest.intersects
                          ? 'INTERSECTS'
                          : `Dist: ${nearestOutput.closest.distance.toFixed(3)}`}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Normalized (O₂/100, p/14.7)
                      </div>
                    </div>
                  </div>

                  {/* Tested Values with <Val> */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-zinc-800 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tested Cabin O₂:</span>
                      <Val val={nearestOutput.closest.record.cabin_o2_pct} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tested Pressure:</span>
                      <Val val={nearestOutput.closest.record.pressure_psi} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Airflow:</span>
                      <Val val={nearestOutput.closest.record.airflow_speed_cm_s} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-xs font-sans text-zinc-300">
                    <span className="font-semibold text-cyan-400 font-mono block mb-0.5">
                      Status Message:
                    </span>
                    {nearestOutput.message}
                  </div>

                  <div className="p-2 rounded bg-amber-950/40 border border-amber-700/40 text-[10px] font-mono text-amber-200">
                    range envelope: bounds of reported ranges; individual test combinations not confirmed.
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-zinc-400">
                  No plottable evidence found.
                </div>
              )}
            </div>

            {/* Unplottable Records Finding (SPEC Section 8) */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h2 className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                  Unplottable Records Finding
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-700/40">
                  {nearestOutput.unplottableCount} Records
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Records lacking either cabin O₂ or pressure cannot be plotted on the environmental map. This is an empirical finding in PSI data:
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {nearestOutput.unplottableRecords.map((unp) => (
                  <div
                    key={unp.id}
                    className="p-2 rounded bg-black/40 border border-zinc-800/80 text-xs font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="text-zinc-200 font-semibold">{unp.id}</span>{' '}
                      <span className="text-zinc-400 text-[11px]">({unp.name})</span>
                    </div>
                    <span className="text-amber-400/90 text-[10px] italic">
                      {unp.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoveragePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full bg-slate-950 p-12 text-center font-mono text-xs text-zinc-400">
          Loading atmospheric coverage map...
        </div>
      }
    >
      <CoverageContent />
    </Suspense>
  );
}
