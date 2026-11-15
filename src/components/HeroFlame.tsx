'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface HeroFlameProps {
  initialRegime?: '0g' | '1g';
  initialO2?: number; // percentage, e.g. 21
  className?: string;
}

export function HeroFlame({
  initialRegime = '0g',
  initialO2 = 21,
  className = '',
}: HeroFlameProps) {
  const [regime, setRegime] = useState<'0g' | '1g'>(initialRegime);
  const [o2Pct, setO2Pct] = useState<number>(initialO2);
  const [canvasReady, setCanvasReady] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCanvasReady(true);
  }, []);

  useEffect(() => {
    if (!canvasReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = regime === '0g' ? height / 2 : height * 0.65;

      ctx.clearRect(0, 0, width, height);

      // Normalization factors based on O2 (15% - 45%)
      const o2Scale = 0.75 + ((o2Pct - 15) / 30) * 0.55;

      if (regime === '0g') {
        // --- 0g SPHERICAL DIFFUSION FLAME ---
        const baseRadius = 55 * o2Scale;
        const breath = Math.sin(t * 0.8) * 1.5;
        const r = baseRadius + breath;

        // Outer glow
        const outerGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.8);
        outerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        outerGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.25)');
        outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Main spherical reaction sheet
        const sphereGrad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
        sphereGrad.addColorStop(0, 'rgba(191, 219, 254, 0.1)');
        sphereGrad.addColorStop(0.6, 'rgba(96, 165, 250, 0.5)');
        sphereGrad.addColorStop(0.9, 'rgba(37, 99, 235, 0.85)');
        sphereGrad.addColorStop(1, 'rgba(29, 78, 216, 0)');
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Thin blue flame boundary ring
        ctx.strokeStyle = `rgba(147, 197, 253, ${0.7 + Math.sin(t) * 0.15})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
        ctx.stroke();

        // Droplet / Fuel core center point
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // --- 1g BUOYANT CONVECTIVE PLUME ---
        const plumeHeight = 110 * o2Scale;
        const plumeWidth = 42 * o2Scale;

        // Upward flickering perturbation
        const flicker1 = Math.sin(t * 3.5) * 6;
        const flicker2 = Math.cos(t * 4.2) * 4;

        // Outer thermal plume envelope
        const envGrad = ctx.createRadialGradient(cx, cy - plumeHeight * 0.4, 10, cx, cy - plumeHeight * 0.4, plumeHeight * 0.9);
        envGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        envGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)');
        envGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = envGrad;
        ctx.beginPath();
        ctx.ellipse(cx + flicker2 * 0.5, cy - plumeHeight * 0.4, plumeWidth * 1.3, plumeHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Incandescent soot body
        const flameGrad = ctx.createLinearGradient(cx, cy, cx, cy - plumeHeight);
        flameGrad.addColorStop(0, 'rgba(37, 99, 235, 0.9)'); // Blue base
        flameGrad.addColorStop(0.15, 'rgba(234, 179, 8, 0.85)'); // Yellow reaction zone
        flameGrad.addColorStop(0.65, 'rgba(249, 115, 22, 0.9)'); // Orange radiant body
        flameGrad.addColorStop(0.95, 'rgba(239, 68, 68, 0.7)'); // Red luminous tip
        flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = flameGrad;

        ctx.beginPath();
        ctx.moveTo(cx - plumeWidth * 0.5, cy);
        ctx.bezierCurveTo(
          cx - plumeWidth * 0.8, cy - plumeHeight * 0.4,
          cx - plumeWidth * 0.2 + flicker1, cy - plumeHeight * 0.8,
          cx + flicker1 * 0.8, cy - plumeHeight
        );
        ctx.bezierCurveTo(
          cx + plumeWidth * 0.2 + flicker2, cy - plumeHeight * 0.8,
          cx + plumeWidth * 0.8, cy - plumeHeight * 0.4,
          cx + plumeWidth * 0.5, cy
        );
        ctx.closePath();
        ctx.fill();

        // Blue anchor base
        ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, plumeWidth * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Burner nozzle / wick base
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 10, cy + 3, 20, 14);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasReady, regime, o2Pct]);

  return (
    <div
      className={`relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
      data-flame-interactive="true"
    >
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
            Interactive Microgravity vs. 1g Flame Physics Simulator
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium">
            Rule 5: Bounds Only (0g & 1g)
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">
            0 Partial-g Extrapolations
          </span>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Canvas Display with Telemetry */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[280px] bg-slate-900 rounded-xl p-3 border border-slate-800 overflow-hidden">
          {canvasReady ? (
            <canvas
              ref={canvasRef}
              width={340}
              height={260}
              className="max-w-full drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]"
            />
          ) : (
            <svg
              viewBox="0 0 340 260"
              className="w-[340px] h-[260px] max-w-full"
              aria-label="Static fallback flame representation"
            >
              <circle cx="170" cy="130" r="60" fill="#2563EB" opacity="0.5" />
            </svg>
          )}

          {/* Telemetry Badge on visualizer */}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap justify-between items-center px-3 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-[11px] font-mono backdrop-blur-sm gap-2">
            <span className="text-sky-300">
              Regime: <strong className="text-white">{regime === '0g' ? 'Microgravity (~10⁻⁶ g)' : 'Earth Normal (1.0 g)'}</strong>
            </span>
            <span className="text-amber-300">
              O₂: <strong className="text-white">{o2Pct}%</strong>
            </span>
            <span className="text-emerald-300">
              Transport: <strong className="text-white">{regime === '0g' ? 'Diffusion Only' : 'Buoyant Convective'}</strong>
            </span>
          </div>
        </div>

        {/* Controls and Physical Science Explainer */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-800 uppercase tracking-wider mb-2">
              Select Gravity Boundary:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRegime('0g')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                  regime === '0g'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                0g Spherical (Micro-g)
              </button>
              <button
                type="button"
                onClick={() => setRegime('1g')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                  regime === '1g'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                1g Plume (Earth 1g)
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500 font-mono">
              * Non-negotiable: NASA PSI contains zero partial-g data. Only 0g and 1g physical bounds are documented.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700 font-medium">Oxygen Sensitivity (O₂ %)</span>
              <span className="text-sky-800 font-bold">{o2Pct}% O₂</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={o2Pct}
              onChange={(e) => setO2Pct(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-700"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>15% (Hypoxic)</span>
              <span className="text-slate-600 font-semibold">21% (Air)</span>
              <span className="text-rose-600 font-bold">34% (Lunar)</span>
              <span>45%</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 font-sans leading-relaxed">
            <div className="font-bold text-sky-800 font-mono text-[11px] uppercase tracking-wide">
              Observed Combustion Physics:
            </div>
            {regime === '0g' ? (
              <p>
                In <strong>microgravity</strong>, buoyant convection ceases. Oxygen reaches the reaction zone solely through molecular diffusion, forming a symmetric <strong>blue spherical flame</strong> with soot confinement and longer residence times.
              </p>
            ) : (
              <p>
                In <strong>Earth gravity (1g)</strong>, hot low-density combustion products rise rapidly, entraining ambient air into an elongated, <strong>buoyant flickering plume</strong> with glowing yellow/orange soot radiation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroFlame;
