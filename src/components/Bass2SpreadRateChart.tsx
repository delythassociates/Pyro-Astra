'use client';

import React, { useState } from 'react';
import bass2Data from '@/data/bass2_table_5_1.json';

interface TableRow {
  test_no: string;
  thickness_mm: string;
  width_cm: string;
  sides_burning: string;
  velocity_cm_s: string;
  spread_rate_mm_s: string;
  burn_time_min: string;
  initial_o2_vol_pct: string;
  final_o2_vol_pct: string;
  source_report: string;
  report_page: string;
}

interface ParsedPoint {
  testNo: string;
  velocity: number;
  spreadRate: number;
  initialO2: number;
  finalO2: number;
  thickness: number;
  sidesBurning: string;
  rawVelocity: string;
  rawSpreadRate: string;
  report: string;
  page: string;
}

export function Bass2SpreadRateChart() {
  const [hoveredPoint, setHoveredPoint] = useState<ParsedPoint | null>(null);

  // Extract points (handling entries with "and" like "20 and 15")
  const points: ParsedPoint[] = [];
  const rows: TableRow[] = (bass2Data as any).rows ?? [];

  rows.forEach((r) => {
    const vStr = r.velocity_cm_s;
    const sStr = r.spread_rate_mm_s;
    const initO2 = parseFloat(r.initial_o2_vol_pct) || 21.0;
    const finO2 = parseFloat(r.final_o2_vol_pct) || initO2;
    const thick = parseFloat(r.thickness_mm) || 1.0;

    if (vStr.includes('and')) {
      const vParts = vStr.split('and').map((s) => parseFloat(s.trim()));
      const sParts = sStr.split('and').map((s) => parseFloat(s.trim()));
      vParts.forEach((v, idx) => {
        if (!isNaN(v) && !isNaN(sParts[idx])) {
          points.push({
            testNo: `${r.test_no}.${idx + 1}`,
            velocity: v,
            spreadRate: sParts[idx],
            initialO2: initO2,
            finalO2: finO2,
            thickness: thick,
            sidesBurning: r.sides_burning,
            rawVelocity: vStr,
            rawSpreadRate: sStr,
            report: r.source_report,
            page: r.report_page,
          });
        }
      });
    } else {
      const v = parseFloat(vStr);
      const s = parseFloat(sStr);
      if (!isNaN(v) && !isNaN(s)) {
        points.push({
          testNo: r.test_no,
          velocity: v,
          spreadRate: s,
          initialO2: initO2,
          finalO2: finO2,
          thickness: thick,
          sidesBurning: r.sides_burning,
          rawVelocity: vStr,
          rawSpreadRate: sStr,
          report: r.source_report,
          page: r.report_page,
        });
      }
    }
  });

  // Chart Dimensions
  const width = 680;
  const height = 400;
  const margin = { top: 30, right: 30, bottom: 55, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const minV = 0;
  const maxV = 25;
  const minS = 0;
  const maxS = 0.085;

  const scaleX = (v: number) => margin.left + (v / maxV) * innerWidth;
  const scaleY = (s: number) => margin.top + innerHeight - (s / maxS) * innerHeight;

  // Color generator for O2 (13.6% to 22.2%)
  const getO2Color = (o2: number) => {
    // 13.6% = amber/low O2, 22.2% = dark aerospace blue
    const t = Math.max(0, Math.min(1, (o2 - 13.6) / (22.2 - 13.6)));
    if (t < 0.5) return '#d97706'; // Amber for hypoxic
    return '#0284c7'; // Sky/blue for near-air
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-mono">
            BASS-II Table 5.1: Calibrated Flow Speed vs. Flame Spread Rate
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            20 flat-PMMA slab flight tests (M1–M20) from NASA/TM-20210011385 across calibrated velocities (1–20 cm/s).
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
          NASA TM-20210011385
        </span>
      </div>

      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[580px] select-none">
          {/* Gridlines */}
          {[0, 5, 10, 15, 20, 25].map((v) => (
            <line
              key={`grid-v-${v}`}
              x1={scaleX(v)}
              y1={margin.top}
              x2={scaleX(v)}
              y2={margin.top + innerHeight}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}
          {[0.02, 0.04, 0.06, 0.08].map((s) => (
            <line
              key={`grid-s-${s}`}
              x1={margin.left}
              y1={scaleY(s)}
              x2={margin.left + innerWidth}
              y2={scaleY(s)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* Regime Band Annotations */}
          {/* Mixed Convective / Diffusive Band (1 to 10 cm/s) */}
          <rect
            x={scaleX(1)}
            y={margin.top}
            width={scaleX(10) - scaleX(1)}
            height={innerHeight}
            fill="#0284c7"
            fillOpacity="0.05"
          />
          <text x={scaleX(5.5)} y={margin.top + 15} textAnchor="middle" fill="#0369a1" fontSize="9" fontFamily="monospace">
            Mixed Convective-Diffusive Regime (Peak Hazard)
          </text>

          {/* High Flow / Thermal Blowoff Band (> 15 cm/s) */}
          <rect
            x={scaleX(15)}
            y={margin.top}
            width={scaleX(25) - scaleX(15)}
            height={innerHeight}
            fill="#d97706"
            fillOpacity="0.05"
          />
          <text x={scaleX(20)} y={margin.top + 15} textAnchor="middle" fill="#92400e" fontSize="9" fontFamily="monospace">
            High Velocity Flow
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
          {[0, 5, 10, 15, 20, 25].map((v) => (
            <text
              key={`x-v-${v}`}
              x={scaleX(v)}
              y={margin.top + innerHeight + 18}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
            >
              {v}
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
            Calibrated Airflow Velocity (cm/s)
          </text>

          {/* Y Axis Labels */}
          {[0, 0.02, 0.04, 0.06, 0.08].map((s) => (
            <text
              key={`y-s-${s}`}
              x={margin.left - 8}
              y={scaleY(s) + 3}
              textAnchor="end"
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
            >
              {s.toFixed(2)}
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
            Flame Spread Rate (mm/s)
          </text>

          {/* DATA POINTS */}
          {points.map((pt) => {
            const cx = scaleX(pt.velocity);
            const cy = scaleY(pt.spreadRate);
            const color = getO2Color(pt.initialO2);

            return (
              <g
                key={pt.testNo}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={pt.thickness === 1 ? 5 : pt.thickness === 3 ? 6.5 : 8}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={cx + 7}
                  y={cy + 3}
                  fontSize="8"
                  fontFamily="monospace"
                  fill="#475569"
                >
                  {pt.testNo}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Provenance Popover */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 z-20 w-72 p-3.5 bg-white rounded-lg border border-slate-200 shadow-xl text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1">
              <span>Test {hoveredPoint.testNo}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                PMMA Slab ({hoveredPoint.thickness} mm)
              </span>
            </div>
            <div className="text-slate-700">
              Velocity: <strong className="text-slate-900">{hoveredPoint.velocity} cm/s</strong>
            </div>
            <div className="text-slate-700">
              Spread Rate: <strong className="text-slate-900">{hoveredPoint.spreadRate} mm/s</strong>
            </div>
            <div className="text-slate-700">
              Initial O₂: <strong className="text-slate-900">{hoveredPoint.initialO2}%</strong> · Final: <strong className="text-slate-900">{hoveredPoint.finalO2}%</strong>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-sans">
              Citation: {hoveredPoint.report}, {hoveredPoint.page}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-600" />
            <span>Near-Air O₂ (20.8% – 22.2%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Hypoxic O₂ (13.6% – 18.0%)</span>
          </div>
          <div className="text-slate-400">
            Bubble size = Slab thickness (1, 3, 5 mm)
          </div>
        </div>
        <div className="text-slate-400 text-[11px]">
          Chamber pressure: <span className="italic text-slate-500">Not Reported (null)</span>
        </div>
      </div>
    </div>
  );
}

export default Bass2SpreadRateChart;
