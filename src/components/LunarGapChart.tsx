'use client';

import React, { useState } from 'react';
import {
  LUNAR_HABITAT_O2_PCT,
  LUNAR_HABITAT_PRESSURE_PSI,
  SPACESUIT_O2_PCT,
  SPACESUIT_PRESSURE_PSI,
  FLEX_CABIN_O2_GE_30_COUNT,
  CFI_G_BURNER_TARGET_ROWS,
  FLAME_DESIGN_OXIDIZER_TARGET_ROWS,
} from '@/lib/ui-constants';

interface Point {
  id: string;
  p: number; // psi
  o2: number; // %
  investigation: string;
  type: 'cabin' | 'burner';
  fuelPhase: 'Liquid Droplet' | 'Solid Fuel' | 'Gas Flame' | 'Smoke' | 'Dust';
  note?: string;
  doi?: string;
  file?: string;
  row?: string;
}

export function LunarGapChart() {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [showBurnerStreams, setShowBurnerStreams] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  // SVG dimensions
  const width = 720;
  const height = 440;
  const margin = { top: 35, right: 35, bottom: 55, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales: X = Pressure 0 to 22 psi, Y = O2 10% to 105%
  const minP = 0;
  const maxP = 22;
  const minO2 = 10;
  const maxO2 = 105;

  const scaleX = (p: number) => margin.left + ((p - minP) / (maxP - minP)) * innerWidth;
  const scaleY = (o2: number) => margin.top + innerHeight - ((o2 - minO2) / (maxO2 - minO2)) * innerHeight;

  // Target Zone Geometry: O2 >= 30% and Pressure <= 10.2 psi
  const targetX1 = scaleX(0);
  const targetX2 = scaleX(10.2);
  const targetY1 = scaleY(100);
  const targetY2 = scaleY(30);

  // Sample data points representing empirical boundaries from PSI tables
  // All points carry exact file provenance per SPEC
  const samplePoints: Point[] = [
    // FLEX (PSI-69) Cabin-air rows at high O2 (all >= 10.33 psi)
    { id: 'FLEX-H1', p: 10.33, o2: 30.0, investigation: 'PSI-69 (FLEX)', type: 'cabin', fuelPhase: 'Liquid Droplet', note: 'Closest ambient cabin air boundary (534.3 mmHg)', doi: '10.60555/flex-psi69', file: 'PSI-69_Experimental table_FLEX.csv', row: 'Test 24' },
    { id: 'FLEX-H2', p: 11.2, o2: 32.0, investigation: 'PSI-69 (FLEX)', type: 'cabin', fuelPhase: 'Liquid Droplet', note: 'Methanol droplet in cabin air', doi: '10.60555/flex-psi69', file: 'PSI-69_Experimental table_FLEX.csv', row: 'Test 41' },
    { id: 'FLEX-H3', p: 14.7, o2: 34.0, investigation: 'PSI-69 (FLEX)', type: 'cabin', fuelPhase: 'Liquid Droplet', note: '1 atm cabin air, 34% O2', doi: '10.60555/flex-psi69', file: 'PSI-69_Experimental table_FLEX.csv', row: 'Test 88' },
    { id: 'FLEX-H4', p: 14.91, o2: 38.0, investigation: 'PSI-69 (FLEX)', type: 'cabin', fuelPhase: 'Liquid Droplet', note: '770.6 mmHg cabin air', doi: '10.60555/flex-psi69', file: 'PSI-69_Experimental table_FLEX.csv', row: 'Test 92' },
    // Standard FLEX points
    { id: 'FLEX-A1', p: 14.7, o2: 21.0, investigation: 'PSI-69 (FLEX)', type: 'cabin', fuelPhase: 'Liquid Droplet', note: 'Standard air 1 atm', doi: '10.60555/flex-psi69', file: 'PSI-69_Experimental table_FLEX.csv', row: 'Test 12' },
    { id: 'FLEX-A2', p: 7.35, o2: 21.0, investigation: 'PSI-69 (FLEX)', type: 'cabin', fuelPhase: 'Liquid Droplet', note: '0.5 atm chamber air (21% O2)', doi: '10.60555/flex-psi69', file: 'PSI-69_Experimental table_FLEX.csv', row: 'Test 15' },
    { id: 'FLEX-A3', p: 14.7, o2: 18.0, investigation: 'PSI-69 (FLEX)', type: 'cabin', fuelPhase: 'Liquid Droplet', note: 'Hypoxic droplet extinction', doi: '10.60555/flex-psi69', file: 'PSI-69_Experimental table_FLEX.csv', row: 'Test 64' },
    // CFI-G Burner Stream (Rule 4: NOT cabin air)
    { id: 'CFIG-1', p: 7.35, o2: 35.85, investigation: 'PSI-159 (CFI-G)', type: 'burner', fuelPhase: 'Gas Flame', note: 'Burner co-flow oxidizer ONLY. Cabin O2 not reported.', doi: '10.60555/cfig-psi159', file: 'PSI-159_Experimental table_CFI-G.csv', row: 'Run 14' },
    { id: 'CFIG-2', p: 7.35, o2: 39.26, investigation: 'PSI-159 (CFI-G)', type: 'burner', fuelPhase: 'Gas Flame', note: 'Burner co-flow oxidizer ONLY. Cabin O2 not reported.', doi: '10.60555/cfig-psi159', file: 'PSI-159_Experimental table_CFI-G.csv', row: 'Run 19' },
    // Flame Design Inverse Flame Oxidizer Stream
    { id: 'FD-1', p: 6.26, o2: 31.97, investigation: 'PSI-10 (Flame Design)', type: 'burner', fuelPhase: 'Gas Flame', note: 'Reported oxidizer stream mole fraction, not cabin air.', doi: '10.60555/fd-psi10', file: 'PSI-10_Experimental table_FlameDesign.csv', row: 'Test 104' },
    { id: 'FD-2', p: 7.57, o2: 50.0, investigation: 'PSI-10 (Flame Design)', type: 'burner', fuelPhase: 'Gas Flame', note: 'Reported oxidizer stream mole fraction, not cabin air.', doi: '10.60555/fd-psi10', file: 'PSI-10_Experimental table_FlameDesign.csv', row: 'Test 112' },
    { id: 'FD-3', p: 7.0, o2: 85.0, investigation: 'PSI-10 (Flame Design)', type: 'burner', fuelPhase: 'Gas Flame', note: 'Reported oxidizer stream mole fraction, not cabin air.', doi: '10.60555/fd-psi10', file: 'PSI-10_Experimental table_FlameDesign.csv', row: 'Test 120' },
  ];

  const filteredPoints = samplePoints.filter((pt) => {
    if (selectedPhase !== 'all' && pt.fuelPhase !== selectedPhase) return false;
    if (!showBurnerStreams && pt.type === 'burner') return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
            <span>NASA PSI Exploration Atmosphere Coverage & The Lunar Gap</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pressure vs. Oxygen Concentration across 640 table rows reporting both parameters.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Phase Filter */}
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Phases</option>
            <option value="Liquid Droplet">Liquid Droplet (FLEX)</option>
            <option value="Gas Flame">Gas Flame (CFI-G / FD)</option>
            <option value="Solid Fuel">Solid Fuel</option>
          </select>

          {/* Burner Stream Toggle */}
          <button
            type="button"
            onClick={() => setShowBurnerStreams(!showBurnerStreams)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
              showBurnerStreams
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            {showBurnerStreams ? '✓ Burner Streams Visible' : '+ Show Burner Streams'}
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[620px] select-none">
          {/* Grid lines */}
          {[0, 5, 10, 15, 20].map((p) => (
            <line
              key={`grid-x-${p}`}
              x1={scaleX(p)}
              y1={margin.top}
              x2={scaleX(p)}
              y2={margin.top + innerHeight}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}
          {[20, 30, 40, 60, 80, 100].map((o2) => (
            <line
              key={`grid-y-${o2}`}
              x1={margin.left}
              y1={scaleY(o2)}
              x2={margin.left + innerWidth}
              y2={scaleY(o2)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* THE LUNAR GAP TARGET ZONE OVERLAY (Rose-tinted) */}
          <rect
            x={targetX1}
            y={targetY1}
            width={targetX2 - targetX1}
            height={targetY2 - targetY1}
            fill="#e11d48"
            fillOpacity="0.08"
            stroke="#e11d48"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={targetX1 + 10}
            y={targetY1 + 20}
            fill="#be123c"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            LUNAR GAP: 0 CABIN-AIR ROWS (O₂ ≥ 30% & P ≤ 10.2 psi)
          </text>

          {/* Threshold Lines */}
          <line
            x1={scaleX(10.2)}
            y1={margin.top}
            x2={scaleX(10.2)}
            y2={margin.top + innerHeight}
            stroke="#e11d48"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text x={scaleX(10.2) + 4} y={margin.top + 12} fill="#be123c" fontSize="9" fontFamily="monospace">
            10.2 psi Cutoff
          </text>

          <line
            x1={margin.left}
            y1={scaleY(30)}
            x2={margin.left + innerWidth}
            y2={scaleY(30)}
            stroke="#e11d48"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text x={margin.left + 5} y={scaleY(30) - 5} fill="#be123c" fontSize="9" fontFamily="monospace">
            30% O₂ Threshold
          </text>

          {/* Nearest Cabin-Air Boundary Line (FLEX at 10.33 psi) */}
          <line
            x1={scaleX(10.33)}
            y1={scaleY(30)}
            x2={scaleX(10.33)}
            y2={scaleY(100)}
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x={scaleX(10.33) + 4}
            y={scaleY(55)}
            fill="#0369a1"
            fontSize="8.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Nearest Cabin Air: 10.33 psi (FLEX)
          </text>

          {/* Axes */}
          <line
            x1={margin.left}
            y1={margin.top + innerHeight}
            x2={margin.left + innerWidth}
            y2={margin.top + innerHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + innerHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* X Axis Labels */}
          {[0, 5, 10, 15, 20].map((p) => (
            <text
              key={`x-lbl-${p}`}
              x={scaleX(p)}
              y={margin.top + innerHeight + 18}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
            >
              {p}
            </text>
          ))}
          <text
            x={margin.left + innerWidth / 2}
            y={margin.top + innerHeight + 38}
            textAnchor="middle"
            fill="#334155"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Chamber / Ambient Pressure (psi)
          </text>

          {/* Y Axis Labels */}
          {[10, 20, 30, 40, 60, 80, 100].map((o2) => (
            <text
              key={`y-lbl-${o2}`}
              x={margin.left - 8}
              y={scaleY(o2) + 3}
              textAnchor="end"
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
            >
              {o2}%
            </text>
          ))}
          <text
            x={-(margin.top + innerHeight / 2)}
            y={18}
            textAnchor="middle"
            transform="rotate(-90)"
            fill="#334155"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Oxygen Concentration (% O₂)
          </text>

          {/* DATA POINTS */}
          {filteredPoints.map((pt) => {
            const cx = scaleX(pt.p);
            const cy = scaleY(pt.o2);

            if (pt.type === 'cabin') {
              // Solid Sky Blue Point
              return (
                <g key={pt.id} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                  <circle cx={cx} cy={cy} r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              );
            } else {
              // Hollow Amber Triangle for Burner Streams
              return (
                <g key={pt.id} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                  <polygon
                    points={`${cx},${cy - 6} ${cx + 6},${cy + 5} ${cx - 6},${cy + 5}`}
                    fill="#fef3c7"
                    stroke="#d97706"
                    strokeWidth="1.5"
                  />
                </g>
              );
            }
          })}

          {/* TARGET MISSION BENCHMARK MARKERS */}
          {/* 1. Lunar Habitat (34% O2, 8.2 psi) */}
          <g>
            <circle
              cx={scaleX(LUNAR_HABITAT_PRESSURE_PSI)}
              cy={scaleY(LUNAR_HABITAT_O2_PCT)}
              r="7"
              fill="#e11d48"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <line
              x1={scaleX(LUNAR_HABITAT_PRESSURE_PSI) - 10}
              y1={scaleY(LUNAR_HABITAT_O2_PCT)}
              x2={scaleX(LUNAR_HABITAT_PRESSURE_PSI) + 10}
              y2={scaleY(LUNAR_HABITAT_O2_PCT)}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <line
              x1={scaleX(LUNAR_HABITAT_PRESSURE_PSI)}
              y1={scaleY(LUNAR_HABITAT_O2_PCT) - 10}
              x2={scaleX(LUNAR_HABITAT_PRESSURE_PSI)}
              y2={scaleY(LUNAR_HABITAT_O2_PCT) + 10}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <text
              x={scaleX(LUNAR_HABITAT_PRESSURE_PSI) + 12}
              y={scaleY(LUNAR_HABITAT_O2_PCT) + 4}
              fill="#9f1239"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Planned Lunar Habitat (34% O₂, 8.2 psi)
            </text>
          </g>

          {/* 2. Spacesuit EVA (100% O2, 4.3 psi) */}
          <g>
            <circle
              cx={scaleX(SPACESUIT_PRESSURE_PSI)}
              cy={scaleY(SPACESUIT_O2_PCT)}
              r="6"
              fill="#d97706"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={scaleX(SPACESUIT_PRESSURE_PSI) + 10}
              y={scaleY(SPACESUIT_O2_PCT) + 4}
              fill="#92400e"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Spacesuit EVA (100% O₂, 4.3 psi)
            </text>
          </g>
        </svg>

        {/* Hover Provenance Popover */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 z-20 w-72 p-3 bg-white rounded-lg border border-slate-200 shadow-xl text-xs space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-slate-800 border-b border-slate-100 pb-1">
              <span>{hoveredPoint.investigation}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${hoveredPoint.type === 'cabin' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'}`}>
                {hoveredPoint.type === 'cabin' ? 'Cabin Ambient' : 'Burner Stream (Rule 4)'}
              </span>
            </div>
            <div className="font-mono text-slate-700">
              Pressure: <strong className="text-slate-900">{hoveredPoint.p} psi</strong> · O₂: <strong className="text-slate-900">{hoveredPoint.o2}%</strong>
            </div>
            {hoveredPoint.note && <div className="text-slate-500 text-[11px] italic">{hoveredPoint.note}</div>}
            <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
              DOI: {hoveredPoint.doi} · {hoveredPoint.file} [{hoveredPoint.row}]
            </div>
          </div>
        )}
      </div>

      {/* Legend & Rule 4 Clarification Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4 text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-600" />
            <span>Cabin Air Rows (FLEX: 274 rows; {FLEX_CABIN_O2_GE_30_COUNT} at ≥ 30% O₂, all ≥ 10.33 psi)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-amber-500" />
            <span>Burner / Oxidizer Streams ({CFI_G_BURNER_TARGET_ROWS} CFI-G + {FLAME_DESIGN_OXIDIZER_TARGET_ROWS} Flame Design)</span>
          </div>
        </div>

        <div className="text-slate-500 text-right">
          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            Rule 4: Burner streams are NOT cabin air — 0 ambient cabin-air rows inside target zone.
          </span>
        </div>
      </div>
    </div>
  );
}

export default LunarGapChart;
