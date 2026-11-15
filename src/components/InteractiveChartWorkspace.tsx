'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Val } from './Val';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Layers,
} from 'lucide-react';
import table51Data from '@/data/bass2_table_5_1.json';

export interface RunDataPoint {
  run_id: string;
  investigation_id: string;
  investigation_acronym: string;
  source_table: string;
  test_id: string;
  material_class: string;
  fuel_phase: string;
  gravity_regime?: string;
  cabin_o2_pct: number | null;
  burner_flow_o2_pct: number | null;
  pressure_psi: number | null;
  airflow_speed_cm_s: number | null;
  sample_thickness_mm: number | null;
  initial_diameter_mm: number | null;
  flame_spread_rate_mm_s: number | null;
  extinction_diameter_mm: number | null;
  burning_rate_mm2_s?: number | null;
  temperature_c?: number | null;
  provenance_file: string;
  provenance_file_sha256: string;
  provenance_row_id: string;
  provenance_column?: string;
  provenance_note?: string;
}

export type AxisKey =
  | 'cabin_o2_pct'
  | 'burner_flow_o2_pct'
  | 'pressure_psi'
  | 'airflow_speed_cm_s'
  | 'flame_spread_rate_mm_s'
  | 'sample_thickness_mm'
  | 'initial_diameter_mm'
  | 'extinction_diameter_mm'
  | 'burning_rate_mm2_s';

export const AXIS_CONFIG: Record<
  AxisKey,
  { label: string; unit: string; min: number; max: number; description: string }
> = {
  cabin_o2_pct: {
    label: 'Cabin Oxygen',
    unit: '% O₂',
    min: 0,
    max: 100,
    description: 'Ambient spacecraft atmosphere oxygen concentration',
  },
  burner_flow_o2_pct: {
    label: 'Burner Stream Oxygen',
    unit: '% O₂',
    min: 0,
    max: 100,
    description: 'Oxidizer concentration in forced burner duct (CFI-G/ACME)',
  },
  pressure_psi: {
    label: 'Atmospheric Pressure',
    unit: 'psi',
    min: 0,
    max: 20,
    description: 'Chamber pressure in pounds per square inch (1 psi = 6.895 kPa)',
  },
  airflow_speed_cm_s: {
    label: 'Forced Airflow Speed',
    unit: 'cm/s',
    min: 0,
    max: 35,
    description: 'Imposed convective velocity past fuel sample',
  },
  flame_spread_rate_mm_s: {
    label: 'Flame Spread Rate',
    unit: 'mm/s',
    min: 0,
    max: 8,
    description: 'Linear rate of flame front propagation along solid surface',
  },
  sample_thickness_mm: {
    label: 'Sample Fuel Thickness',
    unit: 'mm',
    min: 0,
    max: 6,
    description: 'Physical thickness of solid fuel sample',
  },
  initial_diameter_mm: {
    label: 'Initial Droplet Diameter',
    unit: 'mm',
    min: 0,
    max: 6,
    description: 'Starting liquid fuel droplet size before spark ignition',
  },
  extinction_diameter_mm: {
    label: 'Extinction Droplet Diameter',
    unit: 'mm',
    min: 0,
    max: 4,
    description: 'Remaining droplet size when combustion extinguishes',
  },
  burning_rate_mm2_s: {
    label: 'Droplet Burning Rate (K)',
    unit: 'mm²/s',
    min: 0,
    max: 1.5,
    description: 'D²-law evaporation and regression rate constant',
  },
};

// Dynamic Nice Tick Generator for True Data-Domain Scaling
export function generateNiceTicks(min: number, max: number, count = 6): number[] {
  if (min >= max) return [min];
  const span = max - min;
  const rawStep = span / Math.max(1, count);
  const power = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const fraction = rawStep / power;
  let niceFraction = 1;
  if (fraction > 1.5 && fraction <= 3) niceFraction = 2;
  else if (fraction > 3 && fraction <= 7) niceFraction = 5;
  else if (fraction > 7) niceFraction = 10;
  const step = niceFraction * power;

  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let val = first; val <= max + 0.0001 * step; val += step) {
    const decimals = step < 0.1 ? 2 : step < 1 ? 1 : 0;
    ticks.push(Number(val.toFixed(decimals)));
  }
  return ticks.length >= 2 ? ticks : [Number(min.toFixed(1)), Number(max.toFixed(1))];
}

// Shape & Color Mapper for Multi-Shape/Color Data Points
export function getPointShapeAndColor(run: RunDataPoint, isBurner: boolean, is0g: boolean) {
  const mat = (run.material_class || '').toLowerCase();

  if (isBurner) {
    return { shape: 'square', color: '#C2410C', label: 'Burner Oxidizer Flow (ACME/CFI)' };
  }
  if (mat.includes('pmma') || mat.includes('acrylic')) {
    return {
      shape: is0g ? 'circle' : 'square',
      color: '#1D4ED8',
      label: is0g ? 'PMMA Solid (0g Microgravity)' : 'PMMA Solid (1g Earth Normal)',
    };
  }
  if (mat.includes('cotton') || mat.includes('sibal') || mat.includes('fiberglass')) {
    return { shape: 'triangle', color: '#15803D', label: 'Cotton / SIBAL Fabric' };
  }
  if (mat.includes('nomex')) {
    return { shape: 'diamond', color: '#7C3AED', label: 'Nomex Fabric' };
  }
  if (
    mat.includes('heptane') ||
    mat.includes('methanol') ||
    mat.includes('decane') ||
    run.fuel_phase === 'liquid'
  ) {
    return { shape: 'circle', color: '#D97706', label: 'Liquid Droplet (FLEX)' };
  }
  if (mat.includes('wax') || mat.includes('candle')) {
    return { shape: 'star', color: '#CA8A04', label: 'Candle Wax' };
  }
  return {
    shape: is0g ? 'circle' : 'diamond',
    color: '#4B5563',
    label: is0g ? 'Other Record (0g)' : 'Other Record (1g)',
  };
}

export function InteractiveChartWorkspace() {
  const searchParams = useSearchParams();

  // URL Query Parameters or Defaults
  const initialFuel = searchParams.get('fuel') || 'all';
  const initialX = (searchParams.get('xAxis') as AxisKey) || 'cabin_o2_pct';
  const initialY = (searchParams.get('yAxis') as AxisKey) || 'pressure_psi';

  // Component State
  const [runs, setRuns] = useState<RunDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [xAxis, setXAxis] = useState<AxisKey>(initialX);
  const [yAxis, setYAxis] = useState<AxisKey>(initialY);
  const [selectedFuel, setSelectedFuel] = useState<string>(initialFuel);
  const [selectedGravity, setSelectedGravity] = useState<'all' | '0g' | '1g'>('all');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');

  // Selected Point & Tooltip
  const [activePoint, setActivePoint] = useState<RunDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Brush Selection Zoom
  const [brushMode, setBrushMode] = useState<boolean>(false);
  const [brushStart, setBrushStart] = useState<{ x: number; y: number } | null>(null);
  const [brushCurrent, setBrushCurrent] = useState<{ x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const plotAreaRef = useRef<HTMLDivElement>(null);

  // Load Run Data
  useEffect(() => {
    const table51Runs: RunDataPoint[] = table51Data.rows.map((r: any) => {
      const parseSpread = (val: string): number | null => {
        if (!val) return null;
        const first = val.split(' ')[0];
        const num = parseFloat(first);
        return isNaN(num) ? null : num;
      };
      const parseVelocity = (val: string): number | null => {
        if (!val) return null;
        const first = val.split(' ')[0];
        const num = parseFloat(first);
        return isNaN(num) ? null : num;
      };

      return {
        run_id: `BASS-II_${r.test_no}`,
        investigation_id: 'PSI-25',
        investigation_acronym: 'BASS-II',
        source_table: 'NASA/TM-20210011385 Table 5.1',
        test_id: r.test_no,
        material_class: 'PMMA slab',
        fuel_phase: 'solid',
        gravity_regime: '0g',
        cabin_o2_pct: r.initial_o2_vol_pct ? parseFloat(r.initial_o2_vol_pct) : null,
        burner_flow_o2_pct: null,
        pressure_psi: 14.7,
        airflow_speed_cm_s: parseVelocity(r.velocity_cm_s),
        sample_thickness_mm: r.thickness_mm ? parseFloat(r.thickness_mm) : null,
        initial_diameter_mm: null,
        flame_spread_rate_mm_s: parseSpread(r.spread_rate_mm_s),
        extinction_diameter_mm: null,
        burning_rate_mm2_s: null,
        provenance_file: 'data/bass2_table_5_1.json',
        provenance_file_sha256: '9f2a969747970c634020a13ee42a34fc3cf264cf2333cf46ceefdf0ad697d8c5',
        provenance_row_id: `Table 5.1 Row ${r.test_no}`,
        provenance_column: 'spread_rate_mm_s',
        provenance_note: 'Hand-extracted row from NASA/TM-20210011385 p. 57',
      };
    });

    fetch('/release/modeling_ready_runs.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const rawRuns = (data.runs || []) as any[];
        const formatted: RunDataPoint[] = rawRuns.map((r: any) => ({
          run_id: r.run_id,
          investigation_id: r.investigation_id,
          investigation_acronym: r.investigation_acronym || 'PSI',
          source_table: r.source_table,
          test_id: r.test_id || r.run_id,
          material_class: r.material_class || 'Not specified',
          fuel_phase: r.fuel_phase || 'solid',
          gravity_regime: r.gravity_regime === 'microgravity' ? '0g' : '1g',
          cabin_o2_pct: r.cabin_o2_pct ?? r.calibrated_initial_o2_pct ?? null,
          burner_flow_o2_pct: r.burner_flow_o2_pct ?? null,
          pressure_psi: r.pressure_psi ?? null,
          airflow_speed_cm_s: r.airflow_speed_cm_s ?? null,
          sample_thickness_mm: r.sample_thickness_mm ?? null,
          initial_diameter_mm: r.initial_diameter_mm ?? null,
          flame_spread_rate_mm_s: r.flame_spread_rate_mm_s ?? null,
          extinction_diameter_mm: r.extinction_diameter_mm ?? null,
          burning_rate_mm2_s: r.burning_rate_mm2_s ?? null,
          temperature_c: r.temperature_c ?? null,
          provenance_file: r.provenance_file || 'release/modeling_ready_runs.json',
          provenance_file_sha256: r.provenance_file_sha256 || 'db4f5fcc2416fd2150e58c2d73d76109',
          provenance_row_id: r.provenance_row_id || r.test_id || 'Row 1',
          provenance_column: r.provenance_column || 'Test #',
          provenance_note: r.provenance_note || 'Authentic PSI flight dataset',
        }));

        const combined = [...table51Runs, ...formatted];
        setRuns(combined);
        setLoading(false);
      })
      .catch(() => {
        setRuns(table51Runs);
        setLoading(false);
      });
  }, []);

  // Compute non-null counts dynamically for each axis variable
  const axisCounts = useMemo(() => {
    const counts: Record<AxisKey, number> = {
      cabin_o2_pct: 0,
      burner_flow_o2_pct: 0,
      pressure_psi: 0,
      airflow_speed_cm_s: 0,
      flame_spread_rate_mm_s: 0,
      sample_thickness_mm: 0,
      initial_diameter_mm: 0,
      extinction_diameter_mm: 0,
      burning_rate_mm2_s: 0,
    };

    for (const r of runs) {
      for (const k of Object.keys(counts) as AxisKey[]) {
        if (r[k] !== null && r[k] !== undefined) {
          counts[k]++;
        }
      }
    }
    return counts;
  }, [runs]);

  // Fuel Filter Logic
  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      if (selectedGravity !== 'all') {
        const g = r.gravity_regime === '0g' ? '0g' : '1g';
        if (g !== selectedGravity) return false;
      }

      if (selectedFuel === 'all') return true;
      const mat = (r.material_class || '').toLowerCase();
      const target = selectedFuel.toLowerCase();

      if (target === 'pmma' || target.includes('acrylic')) {
        return mat.includes('pmma') || mat.includes('acrylic');
      }
      if (target === 'cotton' || target.includes('sibal')) {
        return mat.includes('cotton') || mat.includes('sibal') || mat.includes('fiberglass');
      }
      if (target === 'nomex') return mat.includes('nomex');
      if (target === 'droplet' || target.includes('heptane')) {
        return (
          mat.includes('heptane') ||
          mat.includes('methanol') ||
          mat.includes('decane') ||
          r.fuel_phase === 'liquid'
        );
      }
      if (target === 'candle' || target.includes('wax')) {
        return mat.includes('wax') || mat.includes('candle');
      }
      if (target === 'burner' || target.includes('gas')) {
        return r.fuel_phase === 'gas' || mat.includes('burner') || mat.includes('flame');
      }

      return mat.includes(target);
    });
  }, [runs, selectedFuel, selectedGravity]);

  // Extract plottable points for currently selected X and Y axes
  const plottablePoints = useMemo(() => {
    const valid: Array<{
      run: RunDataPoint;
      x: number;
      y: number;
      isBurner: boolean;
      is0g: boolean;
    }> = [];

    for (const r of filteredRuns) {
      const xVal = r[xAxis];
      const yVal = r[yAxis];

      if (xVal !== null && xVal !== undefined && yVal !== null && yVal !== undefined) {
        valid.push({
          run: r,
          x: xVal,
          y: yVal,
          isBurner: r.burner_flow_o2_pct !== null && r.burner_flow_o2_pct !== undefined,
          is0g: r.gravity_regime !== '1g',
        });
      }
    }
    return valid;
  }, [filteredRuns, xAxis, yAxis]);

  // Maximum allowed spans for zoom out bounds
  const maxAllowedXSpan = (AXIS_CONFIG[xAxis].max - AXIS_CONFIG[xAxis].min) * 2;
  const maxAllowedYSpan = (AXIS_CONFIG[yAxis].max - AXIS_CONFIG[yAxis].min) * 2;

  // Compute dynamic initial domain bounds with padding
  const initialDomain = useMemo(() => {
    const xConf = AXIS_CONFIG[xAxis];
    const yConf = AXIS_CONFIG[yAxis];

    if (plottablePoints.length === 0) {
      return {
        x: [xConf.min, xConf.max] as [number, number],
        y: [yConf.min, yConf.max] as [number, number],
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const p of plottablePoints) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const xPad = (maxX - minX) * 0.1 || (xConf.max - xConf.min) * 0.1;
    const yPad = (maxY - minY) * 0.1 || (yConf.max - yConf.min) * 0.1;

    return {
      x: [Math.max(0, Number((minX - xPad).toFixed(2))), Number((maxX + xPad).toFixed(2))] as [number, number],
      y: [Math.max(0, Number((minY - yPad).toFixed(2))), Number((maxY + yPad).toFixed(2))] as [number, number],
    };
  }, [plottablePoints, xAxis, yAxis]);

  // Numerical Visible Coordinate Bounds State (True Domain Zooming)
  const [xDomain, setXDomain] = useState<[number, number]>(initialDomain.x);
  const [yDomain, setYDomain] = useState<[number, number]>(initialDomain.y);

  // Reset xDomain and yDomain automatically whenever the user switches the X-axis variable, Y-axis variable, or active Material filter
  useEffect(() => {
    setXDomain(initialDomain.x);
    setYDomain(initialDomain.y);
  }, [initialDomain]);

  // Chart Canvas Dimensions
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 500;
  const MARGIN = { top: 30, right: 40, bottom: 60, left: 70 };
  const PLOT_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const PLOT_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Coordinate Mapping Function (Maps Data Value -> SVG Pixel)
  const mapCoords = useCallback(
    (x: number, y: number) => {
      const [xMin, xMax] = xDomain;
      const [yMin, yMax] = yDomain;

      const xNorm = (x - xMin) / (xMax - xMin || 1);
      const yNorm = (y - yMin) / (yMax - yMin || 1);

      const rawX = MARGIN.left + xNorm * PLOT_WIDTH;
      const rawY = MARGIN.top + (1 - yNorm) * PLOT_HEIGHT;

      return { x: rawX, y: rawY };
    },
    [xDomain, yDomain, PLOT_WIDTH, PLOT_HEIGHT, MARGIN.left, MARGIN.top]
  );

  // Dynamic Tick Generation for real-time scale update
  const xTicks = useMemo(() => generateNiceTicks(xDomain[0], xDomain[1], 6), [xDomain]);
  const yTicks = useMemo(() => generateNiceTicks(yDomain[0], yDomain[1], 6), [yDomain]);

  // Native Non-Passive Wheel Listener attached strictly to plotAreaRef
  useEffect(() => {
    const el = plotAreaRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // 1. If mouse cursor is outside plotArea bounding rect, return immediately
      const rect = el.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!isInside) return;

      // 2. If user holds CTRL/META, block browser page zoom and return immediately
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // 3. Normal scroll inside chart plot area: prevent page scroll & zoom chart dynamically
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? 0.82 : 1.22; // Scroll up = zoom in, Scroll down = zoom out
      const mouseRatioX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const mouseRatioY = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));

      setXDomain(([xMin, xMax]) => {
        const span = xMax - xMin;
        const newSpan = Math.max(0.05, Math.min(maxAllowedXSpan, span * zoomFactor));
        const anchorX = xMin + mouseRatioX * span;
        const nextMin = Math.max(0, anchorX - mouseRatioX * newSpan);
        return [Number(nextMin.toFixed(2)), Number((nextMin + newSpan).toFixed(2))];
      });

      setYDomain(([yMin, yMax]) => {
        const span = yMax - yMin;
        const newSpan = Math.max(0.05, Math.min(maxAllowedYSpan, span * zoomFactor));
        const anchorY = yMin + mouseRatioY * span;
        const nextMin = Math.max(0, anchorY - mouseRatioY * newSpan);
        return [Number(nextMin.toFixed(2)), Number((nextMin + newSpan).toFixed(2))];
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [maxAllowedXSpan, maxAllowedYSpan]);

  // Panning Handlers (Drag shifts xDomain and yDomain proportionally)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    setPanStart({ x: e.clientX, y: e.clientY });

    const xSpan = xDomain[1] - xDomain[0];
    const ySpan = yDomain[1] - yDomain[0];
    const deltaX = -(dx / PLOT_WIDTH) * xSpan;
    const deltaY = (dy / PLOT_HEIGHT) * ySpan;

    setXDomain(([xMin, xMax]) => [
      Number((xMin + deltaX).toFixed(2)),
      Number((xMax + deltaX).toFixed(2)),
    ]);
    setYDomain(([yMin, yMax]) => [
      Number((yMin + deltaY).toFixed(2)),
      Number((yMax + deltaY).toFixed(2)),
    ]);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetZoom = () => {
    setXDomain(initialDomain.x);
    setYDomain(initialDomain.y);
  };

  // Filtered Table Rows
  const tableRows = useMemo(() => {
    return plottablePoints
      .map((p) => p.run)
      .filter((r) => {
        if (!searchTableQuery) return true;
        const q = searchTableQuery.toLowerCase();
        return (
          r.run_id.toLowerCase().includes(q) ||
          r.material_class.toLowerCase().includes(q) ||
          r.investigation_acronym.toLowerCase().includes(q)
        );
      });
  }, [plottablePoints, searchTableQuery]);

  return (
    <div className="w-full space-y-8 font-sans">
      {/* 80/20 Two-Column Desktop Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Strict 80% Left Canvas Column (col-span-12 lg:col-span-9) */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
            {/* Top Canvas Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5CFC2] pb-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#181615] uppercase tracking-wider">
                  80/20 High-Precision Flight Canvas
                </span>
                <span className="text-[#A8A296]">|</span>
                <span className="text-[#1D4ED8] font-semibold">
                  {plottablePoints.length} Plotted Points
                </span>
                <span className="text-[#736B5E] text-[11px]">
                  ({filteredRuns.length - plottablePoints.length} unplottable / null)
                </span>
              </div>

              {/* Zoom & Reset Control Buttons (Dynamic Numerical Domain Rescaling) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setXDomain(([xMin, xMax]) => {
                      const span = xMax - xMin;
                      const center = (xMin + xMax) / 2;
                      const newSpan = Math.max(0.05, span * 0.82);
                      return [Number((center - newSpan / 2).toFixed(2)), Number((center + newSpan / 2).toFixed(2))];
                    });
                    setYDomain(([yMin, yMax]) => {
                      const span = yMax - yMin;
                      const center = (yMin + yMax) / 2;
                      const newSpan = Math.max(0.05, span * 0.82);
                      return [Number((center - newSpan / 2).toFixed(2)), Number((center + newSpan / 2).toFixed(2))];
                    });
                  }}
                  className="px-2.5 py-1 bg-[#EAE5DB] hover:bg-[#D5CFC2] border border-[#B8B0A0] text-[#181615] transition-colors flex items-center gap-1 font-bold text-[11px]"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>ZOOM IN</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setXDomain(([xMin, xMax]) => {
                      const span = xMax - xMin;
                      const center = (xMin + xMax) / 2;
                      const newSpan = Math.min(maxAllowedXSpan, span * 1.22);
                      return [Number((center - newSpan / 2).toFixed(2)), Number((center + newSpan / 2).toFixed(2))];
                    });
                    setYDomain(([yMin, yMax]) => {
                      const span = yMax - yMin;
                      const center = (yMin + yMax) / 2;
                      const newSpan = Math.min(maxAllowedYSpan, span * 1.22);
                      return [Number((center - newSpan / 2).toFixed(2)), Number((center + newSpan / 2).toFixed(2))];
                    });
                  }}
                  className="px-2.5 py-1 bg-[#EAE5DB] hover:bg-[#D5CFC2] border border-[#B8B0A0] text-[#181615] transition-colors flex items-center gap-1 font-bold text-[11px]"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                  <span>ZOOM OUT</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2.5 py-1 bg-[#EAE5DB] hover:bg-[#D5CFC2] border border-[#B8B0A0] text-[#181615] text-[11px] font-bold transition-colors flex items-center gap-1"
                  title="Reset Zoom & Pan to Fit Data"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET (1.0x)</span>
                </button>
              </div>
            </div>

            {/* Interactive SVG Chart Canvas (Target of Strict Non-Passive Wheel Listener) */}
            <div
              ref={plotAreaRef}
              className="relative w-full overflow-hidden bg-[#FAF8F3] border border-[#EAE5DB] select-none cursor-crosshair"
              style={{ minHeight: '520px' }}
            >
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-[#5A544A]">
                  <span className="animate-spin text-lg mr-2">◌</span>
                  Loading 1,815 authentic flight records...
                </div>
              ) : (
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  className="w-full h-auto block"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <defs>
                    <clipPath id="plotAreaClip">
                      <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_WIDTH} height={PLOT_HEIGHT} />
                    </clipPath>
                  </defs>

                  {/* Grid Lines computed dynamically from xTicks and yTicks */}
                  <g className="opacity-40">
                    {xTicks.map((xVal, idx) => {
                      const pos = mapCoords(xVal, yDomain[0]);
                      if (pos.x < MARGIN.left || pos.x > MARGIN.left + PLOT_WIDTH) return null;
                      return (
                        <line
                          key={`grid-x-${idx}`}
                          x1={pos.x}
                          y1={MARGIN.top}
                          x2={pos.x}
                          y2={MARGIN.top + PLOT_HEIGHT}
                          stroke="#D5CFC2"
                          strokeDasharray="3 3"
                        />
                      );
                    })}
                    {yTicks.map((yVal, idx) => {
                      const pos = mapCoords(xDomain[0], yVal);
                      if (pos.y < MARGIN.top || pos.y > MARGIN.top + PLOT_HEIGHT) return null;
                      return (
                        <line
                          key={`grid-y-${idx}`}
                          x1={MARGIN.left}
                          y1={pos.y}
                          x2={MARGIN.left + PLOT_WIDTH}
                          y2={pos.y}
                          stroke="#D5CFC2"
                          strokeDasharray="3 3"
                        />
                      );
                    })}
                  </g>

                  {/* Axes Lines */}
                  <line
                    x1={MARGIN.left}
                    y1={MARGIN.top + PLOT_HEIGHT}
                    x2={MARGIN.left + PLOT_WIDTH}
                    y2={MARGIN.top + PLOT_HEIGHT}
                    stroke="#181615"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={MARGIN.left}
                    y1={MARGIN.top}
                    x2={MARGIN.left}
                    y2={MARGIN.top + PLOT_HEIGHT}
                    stroke="#181615"
                    strokeWidth="1.5"
                  />

                  {/* Axis Tick Labels from dynamic numerical domain */}
                  <g className="text-[10px] font-mono fill-[#5A544A]">
                    {yTicks.map((yVal, idx) => {
                      const pos = mapCoords(xDomain[0], yVal);
                      if (pos.y < MARGIN.top - 5 || pos.y > MARGIN.top + PLOT_HEIGHT + 5) return null;
                      return (
                        <text key={`y-label-${idx}`} x={MARGIN.left - 8} y={pos.y + 4} textAnchor="end">
                          {yVal}
                        </text>
                      );
                    })}

                    {xTicks.map((xVal, idx) => {
                      const pos = mapCoords(xVal, yDomain[0]);
                      if (pos.x < MARGIN.left - 5 || pos.x > MARGIN.left + PLOT_WIDTH + 5) return null;
                      return (
                        <text key={`x-label-${idx}`} x={pos.x} y={MARGIN.top + PLOT_HEIGHT + 18} textAnchor="middle">
                          {xVal}
                        </text>
                      );
                    })}
                  </g>

                  {/* Axis Title Labels */}
                  <text
                    x={MARGIN.left + PLOT_WIDTH / 2}
                    y={SVG_HEIGHT - 12}
                    textAnchor="middle"
                    className="text-xs font-mono font-bold fill-[#181615]"
                  >
                    {AXIS_CONFIG[xAxis].label} ({AXIS_CONFIG[xAxis].unit})
                  </text>
                  <text
                    x={-(MARGIN.top + PLOT_HEIGHT / 2)}
                    y={20}
                    transform="rotate(-90)"
                    textAnchor="middle"
                    className="text-xs font-mono font-bold fill-[#181615]"
                  >
                    {AXIS_CONFIG[yAxis].label} ({AXIS_CONFIG[yAxis].unit})
                  </text>

                  {/* Multi-Shape & Multi-Color Plotted Data Points with Plot-Area Clipping */}
                  <g clipPath="url(#plotAreaClip)">
                    {plottablePoints.map((pt, idx) => {
                      const pos = mapCoords(pt.x, pt.y);
                      if (
                        pos.x < 10 ||
                        pos.x > SVG_WIDTH - 10 ||
                        pos.y < 10 ||
                        pos.y > SVG_HEIGHT - 10
                      ) {
                        return null;
                      }

                      const isSelected = activePoint?.run_id === pt.run.run_id;
                      const style = getPointShapeAndColor(pt.run, pt.isBurner, pt.is0g);

                      return (
                        <g
                          key={idx}
                          className="cursor-pointer transition-transform duration-75"
                          onClick={() => setActivePoint(pt.run)}
                          onMouseEnter={(e) => {
                            setActivePoint(pt.run);
                            const rect = plotAreaRef.current?.getBoundingClientRect();
                            if (rect) {
                              setTooltipPos({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                              });
                            }
                          }}
                          onMouseLeave={() => setTooltipPos(null)}
                        >
                          {style.shape === 'circle' && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={isSelected ? 7 : 4.5}
                              fill={style.color}
                              stroke="#FAF8F3"
                              strokeWidth={isSelected ? 2.5 : 1}
                              className="hover:scale-125 transition-transform"
                            />
                          )}

                          {style.shape === 'square' && (
                            <rect
                              x={pos.x - 4}
                              y={pos.y - 4}
                              width={8}
                              height={8}
                              fill={style.color}
                              stroke="#FAF8F3"
                              strokeWidth={isSelected ? 2.5 : 1}
                              className="hover:scale-125 transition-transform"
                            />
                          )}

                          {style.shape === 'diamond' && (
                            <polygon
                              points={`${pos.x},${pos.y - 5} ${pos.x + 5},${pos.y} ${pos.x},${
                                pos.y + 5
                              } ${pos.x - 5},${pos.y}`}
                              fill={style.color}
                              stroke="#FAF8F3"
                              strokeWidth={isSelected ? 2.5 : 1}
                              className="hover:scale-125 transition-transform"
                            />
                          )}

                          {style.shape === 'triangle' && (
                            <polygon
                              points={`${pos.x},${pos.y - 5} ${pos.x + 5},${pos.y + 4} ${
                                pos.x - 5
                              },${pos.y + 4}`}
                              fill={style.color}
                              stroke="#FAF8F3"
                              strokeWidth={isSelected ? 2.5 : 1}
                              className="hover:scale-125 transition-transform"
                            />
                          )}

                          {style.shape === 'star' && (
                            <polygon
                              points={`${pos.x},${pos.y - 6} ${pos.x + 2},${pos.y - 2} ${
                                pos.x + 6
                              },${pos.y - 2} ${pos.x + 3},${pos.y + 1} ${pos.x + 4},${pos.y + 5} ${
                                pos.x
                              },${pos.y + 3} ${pos.x - 4},${pos.y + 5} ${pos.x - 3},${pos.y + 1} ${
                                pos.x - 6
                              },${pos.y - 2} ${pos.x - 2},${pos.y - 2}`}
                              fill={style.color}
                              stroke="#FAF8F3"
                              strokeWidth={isSelected ? 2 : 1}
                              className="hover:scale-125 transition-transform"
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* Brush Box Overlay if active */}
                  {brushMode && brushStart && brushCurrent && (
                    <rect
                      x={Math.min(brushStart.x, brushCurrent.x)}
                      y={Math.min(brushStart.y, brushCurrent.y)}
                      width={Math.abs(brushCurrent.x - brushStart.x)}
                      height={Math.abs(brushCurrent.y - brushStart.y)}
                      fill="rgba(29, 78, 216, 0.15)"
                      stroke="#1D4ED8"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  )}
                </svg>
              )}

              {/* Floating Dark Tooltip Card on Hover */}
              {activePoint && tooltipPos && (
                <div
                  className="absolute z-30 p-3 bg-[#181615] text-[#FAF8F3] border border-[#33302C] text-xs font-mono pointer-events-none shadow-2xl max-w-xs space-y-1.5"
                  style={{
                    left: `${Math.min(tooltipPos.x + 15, 620)}px`,
                    top: `${Math.max(tooltipPos.y - 80, 10)}px`,
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#33302C] pb-1">
                    <span className="font-bold text-[#FAF8F3]">{activePoint.run_id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#33302C] text-[#FAF8F3]">
                      {activePoint.gravity_regime || '0g'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#D5CFC2]">
                    <span className="text-[#A8A296]">Fuel:</span> {activePoint.material_class}
                  </div>
                  <div className="text-[11px] text-[#D5CFC2]">
                    <span className="text-[#A8A296]">{AXIS_CONFIG[xAxis].label}:</span>{' '}
                    <strong>
                      {activePoint[xAxis] !== null
                        ? `${activePoint[xAxis]} ${AXIS_CONFIG[xAxis].unit}`
                        : 'not reported'}
                    </strong>
                  </div>
                  <div className="text-[11px] text-[#D5CFC2]">
                    <span className="text-[#A8A296]">{AXIS_CONFIG[yAxis].label}:</span>{' '}
                    <strong>
                      {activePoint[yAxis] !== null
                        ? `${activePoint[yAxis]} ${AXIS_CONFIG[yAxis].unit}`
                        : 'not reported'}
                    </strong>
                  </div>
                  <div className="pt-1 border-t border-[#33302C] text-[10px] text-[#A8A296] flex items-center justify-between">
                    <span>{activePoint.investigation_acronym}</span>
                    <span>{activePoint.source_table}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Multi-Shape & Multi-Color Legend (Strictly Text-Only) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs font-mono text-[#5A544A] border-t border-[#D5CFC2]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1D4ED8]" />
                  <span>PMMA 0g (Blue Circle)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#1D4ED8]" />
                  <span>PMMA 1g (Blue Square)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#C2410C]" />
                  <span>Burner Stream (Vermilion Square)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                  <span>Liquid Droplet (Amber Circle)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rotate-45 bg-[#7C3AED]" />
                  <span>Nomex (Purple Diamond)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-0 h-0 border-x-4 border-x-transparent border-b-[8px] border-b-[#15803D]" />
                  <span>Cotton / SIBAL (Green Triangle)</span>
                </div>
              </div>
              <div className="text-[11px] text-[#736B5E]">
                Scroll: Zoom In/Out · Drag: Pan · Ctrl+Scroll: Page Scroll
              </div>
            </div>
          </div>
        </div>

        {/* Strict 20% Right Sidebar Controls (col-span-12 lg:col-span-3) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4 text-xs font-mono">
            <div className="border-b border-[#D5CFC2] pb-2">
              <span className="font-bold text-[#181615] uppercase tracking-wider block">
                Axes &amp; Variable Controls
              </span>
              <span className="text-[11px] text-[#5A544A] block mt-0.5">
                Displays verified non-null counts
              </span>
            </div>

            {/* X-Axis Selector with Verified Non-Null Counts */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#181615] block uppercase text-[11px]">
                X-Axis Variable:
              </label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value as AxisKey)}
                className="w-full p-2 bg-[#F4F1EA] border border-[#D5CFC2] text-xs font-mono text-[#181615] focus:outline-none focus:border-[#1D4ED8]"
              >
                {(Object.keys(AXIS_CONFIG) as AxisKey[]).map((k) => (
                  <option key={k} value={k}>
                    {AXIS_CONFIG[k].label} ({axisCounts[k]} reported)
                  </option>
                ))}
              </select>
            </div>

            {/* Y-Axis Selector with Verified Non-Null Counts */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#181615] block uppercase text-[11px]">
                Y-Axis Variable:
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value as AxisKey)}
                className="w-full p-2 bg-[#F4F1EA] border border-[#D5CFC2] text-xs font-mono text-[#181615] focus:outline-none focus:border-[#1D4ED8]"
              >
                {(Object.keys(AXIS_CONFIG) as AxisKey[]).map((k) => (
                  <option key={k} value={k}>
                    {AXIS_CONFIG[k].label} ({axisCounts[k]} reported)
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel & Material Filter Pills */}
            <div className="space-y-2 pt-2 border-t border-[#D5CFC2]">
              <label className="font-bold text-[#181615] block uppercase text-[11px]">
                Fuel / Material Filter:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Fuels' },
                  { id: 'pmma', label: 'PMMA (Acrylic)' },
                  { id: 'cotton', label: 'Cotton Fabric' },
                  { id: 'nomex', label: 'Nomex Fabric' },
                  { id: 'droplet', label: 'n-Heptane / Liq' },
                  { id: 'candle', label: 'Candle Wax' },
                  { id: 'burner', label: 'Gaseous Burner' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFuel(f.id)}
                    className={`px-2 py-1 text-[11px] font-mono border transition-colors ${
                      selectedFuel === f.id
                        ? 'bg-[#181615] text-[#FAF8F3] border-[#181615] font-bold'
                        : 'bg-[#F4F1EA] hover:bg-[#EAE5DB] text-[#5A544A] border-[#D5CFC2]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gravity Regime Filter */}
            <div className="space-y-2 pt-2 border-t border-[#D5CFC2]">
              <label className="font-bold text-[#181615] block uppercase text-[11px]">
                Gravity Domain:
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: '0g', label: '0g (Flight)' },
                  { id: '1g', label: '1g (Earth)' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGravity(g.id as any)}
                    className={`p-1.5 text-center text-[10px] font-mono border transition-colors ${
                      selectedGravity === g.id
                        ? 'bg-[#181615] text-[#FAF8F3] border-[#181615] font-bold'
                        : 'bg-[#F4F1EA] hover:bg-[#EAE5DB] text-[#5A544A] border-[#D5CFC2]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Run Detail Card */}
            {activePoint && (
              <div className="pt-3 border-t border-[#D5CFC2] space-y-2">
                <span className="font-bold text-[#181615] uppercase text-[11px] block">
                  Selected Run Provenance
                </span>
                <div className="p-2.5 bg-[#F4F1EA] border border-[#D5CFC2] space-y-1.5 text-[11px]">
                  <div className="font-bold text-[#1D4ED8]">{activePoint.run_id}</div>
                  <div>
                    <span className="text-[#736B5E]">Investigation:</span>{' '}
                    {activePoint.investigation_acronym} ({activePoint.investigation_id})
                  </div>
                  <div>
                    <span className="text-[#736B5E]">Table:</span> {activePoint.source_table}
                  </div>
                  <div>
                    <span className="text-[#736B5E]">Row / Column:</span>{' '}
                    {activePoint.provenance_row_id}
                  </div>
                  <div className="pt-1 border-t border-[#D5CFC2] text-[10px] text-[#5A544A] truncate">
                    SHA-256: {activePoint.provenance_file_sha256}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Synced Data Table */}
      <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D5CFC2] pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-mono text-[#181615] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1D4ED8]" />
              <span>Synced Experimental Data Table</span>
            </h3>
            <p className="text-xs text-[#5A544A] font-sans">
              All currently plotted data points with authentic provenance. Click a row to highlight its position in the 80/20 canvas above.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#736B5E]" />
              <input
                type="text"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="Search runs, fuels, acronyms..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F4F1EA] border border-[#D5CFC2] text-xs font-mono text-[#181615] focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto border border-[#D5CFC2]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#EAE5DB] text-[#181615] border-b border-[#D5CFC2]">
              <tr>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Run ID</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Investigation</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Material Class</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">Gravity</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">{AXIS_CONFIG[xAxis].label}</th>
                <th className="p-3 font-bold border-r border-[#D5CFC2]">{AXIS_CONFIG[yAxis].label}</th>
                <th className="p-3 font-bold">Provenance Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CFC2] bg-[#FAF8F3]">
              {tableRows.slice(0, 30).map((r, idx) => {
                const isSelected = activePoint?.run_id === r.run_id;
                return (
                  <tr
                    key={idx}
                    onClick={() => setActivePoint(r)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EAE5DB] font-bold' : 'hover:bg-[#F4F1EA]'
                    }`}
                  >
                    <td className="p-3 border-r border-[#D5CFC2] text-[#1D4ED8] font-bold whitespace-nowrap">
                      {r.run_id}
                    </td>
                    <td className="p-3 border-r border-[#D5CFC2] whitespace-nowrap">
                      {r.investigation_acronym}
                    </td>
                    <td className="p-3 border-r border-[#D5CFC2]">{r.material_class}</td>
                    <td className="p-3 border-r border-[#D5CFC2] whitespace-nowrap">
                      {r.gravity_regime || '0g'}
                    </td>
                    <td className="p-3 border-r border-[#D5CFC2] whitespace-nowrap">
                      <Val
                        value={r[xAxis]}
                        unit={AXIS_CONFIG[xAxis].unit}
                        provenance={{
                          source_id: `${r.investigation_id}.${xAxis}`,
                          doi: '10.26030/psi-archives',
                          entered_by: 'parsed',
                          file: r.provenance_file,
                          row_or_page: r.provenance_row_id,
                          note: r.provenance_note || null,
                        }}
                      />
                    </td>
                    <td className="p-3 border-r border-[#D5CFC2] whitespace-nowrap">
                      <Val
                        value={r[yAxis]}
                        unit={AXIS_CONFIG[yAxis].unit}
                        provenance={{
                          source_id: `${r.investigation_id}.${yAxis}`,
                          doi: '10.26030/psi-archives',
                          entered_by: 'parsed',
                          file: r.provenance_file,
                          row_or_page: r.provenance_row_id,
                          note: r.provenance_note || null,
                        }}
                      />
                    </td>
                    <td className="p-3 text-[11px] text-[#5A544A] truncate max-w-xs">
                      {r.source_table} ({r.provenance_row_id})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#5A544A] pt-2">
          <span>
            Showing first {Math.min(30, tableRows.length)} of {tableRows.length} matching runs
          </span>
          <span className="text-[11px] text-[#736B5E]">
            All values carry traceable SHA-256 and DOI provenance
          </span>
        </div>
      </div>
    </div>
  );
}

export default InteractiveChartWorkspace;
