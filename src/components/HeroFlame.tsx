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
        // Blue / violet chemiluminescence, quiescent, soot-free sphere
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

        // Thin blue flame boundary ring (chemiluminescence peak)
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
        // Flickering, elongated, yellow/orange tip with blue soot-free base
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
        ctx.ellipse(cx, cy - plumeHeight * 0.4, plumeWidth * 1.5, plumeHeight * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main buoyant teardrop flame
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - plumeWidth * 0.7, cy);
        ctx.bezierCurveTo(
          cx - plumeWidth * 0.9,
          cy - plumeHeight * 0.4,
          cx - plumeWidth * 0.3 + flicker2,
          cy - plumeHeight * 0.85,
          cx + flicker1,
          cy - plumeHeight
        );
        ctx.bezierCurveTo(
          cx + plumeWidth * 0.3 + flicker1,
          cy - plumeHeight * 0.85,
          cx + plumeWidth * 0.9,
          cy - plumeHeight * 0.4,
          cx + plumeWidth * 0.7,
          cy
        );
        ctx.closePath();

        const flameGrad = ctx.createLinearGradient(cx, cy, cx, cy - plumeHeight);
        flameGrad.addColorStop(0, 'rgba(37, 99, 235, 0.9)'); // Blue base
        flameGrad.addColorStop(0.2, 'rgba(59, 130, 246, 0.8)');
        flameGrad.addColorStop(0.45, 'rgba(245, 158, 11, 0.9)'); // Sooting zone
        flameGrad.addColorStop(0.75, 'rgba(234, 88, 12, 0.95)');
        flameGrad.addColorStop(1, 'rgba(254, 240, 138, 0.9)'); // Bright tip
        ctx.fillStyle = flameGrad;
        ctx.fill();
        ctx.restore();

        // Inner luminous core
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - plumeWidth * 0.35, cy);
        ctx.bezierCurveTo(
          cx - plumeWidth * 0.4,
          cy - plumeHeight * 0.3,
          cx + flicker2 * 0.5,
          cy - plumeHeight * 0.65,
          cx + flicker1 * 0.5,
          cy - plumeHeight * 0.8
        );
        ctx.bezierCurveTo(
          cx + flicker1 * 0.5,
          cy - plumeHeight * 0.65,
          cx + plumeWidth * 0.4,
          cy - plumeHeight * 0.3,
          cx + plumeWidth * 0.35,
          cy
        );
        ctx.closePath();
        const coreGrad = ctx.createLinearGradient(cx, cy, cx, cy - plumeHeight * 0.8);
        coreGrad.addColorStop(0, 'rgba(147, 197, 253, 0.6)');
        coreGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.9)');
        coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
        ctx.fillStyle = coreGrad;
        ctx.fill();
        ctx.restore();

        // Burner / fuel source base
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 8, cy, 16, 8);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasReady, regime, o2Pct]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-900/40 p-6 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Mission Control HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-800/30 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-cyan-300">
            Microgravity Combustion Physics HUD
          </span>
        </div>
        <div className="font-mono text-xs text-zinc-400">
          Source: <span className="text-zinc-200">NASA PSI (0g & 1g Bounds)</span>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Canvas Display with SVG Fallback */}
        <div className="md:col-span-7 flex flex-col items-center justify-center relative min-h-[280px]">
          {canvasReady ? (
            <canvas
              ref={canvasRef}
              width={340}
              height={260}
              className="max-w-full drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]"
            />
          ) : (
            /* Static SVG Fallback */
            <svg
              viewBox="0 0 340 260"
              className="w-[340px] h-[260px] max-w-full"
              aria-label="Static fallback flame representation"
            >
              <circle
                cx="170"
                cy="130"
                r="60"
                fill="url(#fallbackGrad)"
                stroke="#60A5FA"
                strokeWidth="2"
              />
              <defs>
                <radialGradient id="fallbackGrad">
                  <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
                  <stop offset="80%" stopColor="#2563EB" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          )}

          {/* Telemetry Badge on visualizer */}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap justify-between items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/75 border border-cyan-900/50 text-[10px] sm:text-[11px] font-mono backdrop-blur-sm gap-1">
            <span className="text-cyan-400">
              Regime: <strong className="text-white">{regime === '0g' ? 'Microgravity (0g)' : 'Earth Normal (1g)'}</strong>
            </span>
            <span className="text-amber-400">
              O₂: <strong className="text-white">{o2Pct}%</strong>
            </span>
            <span className="text-emerald-400">
              Transport: <strong className="text-white">{regime === '0g' ? 'Diffusion' : 'Buoyancy'}</strong>
            </span>
          </div>
        </div>

        {/* Controls and Physical Science Explainer */}
        <div className="md:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-cyan-300 uppercase tracking-wider mb-2">
              Gravity Regime Toggle
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-cyan-900/50">
              <button
                type="button"
                onClick={() => setRegime('0g')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                  regime === '0g'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                0g Spherical (Micro-g)
              </button>
              <button
                type="button"
                onClick={() => setRegime('1g')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                  regime === '1g'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                1g Plume (Earth 1g)
              </button>
            </div>
            <p className="mt-1 text-[10px] text-zinc-500 font-mono">
              * Non-negotiable: PSI has no partial-g data. Only 0g and 1g physical bounds exist.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-300">Oxygen Sensitivity (O₂ %)</span>
              <span className="text-cyan-400 font-bold">{o2Pct}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={o2Pct}
              onChange={(e) => setO2Pct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>15% (Hypoxic)</span>
              <span>21% (Earth/ISS)</span>
              <span>30% (Lunar Habitats)</span>
              <span>45%</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1.5 font-sans leading-relaxed">
            <div className="font-semibold text-cyan-300 font-mono text-[11px] uppercase tracking-wide">
              Observed Combustion Physics:
            </div>
            {regime === '0g' ? (
              <p>
                In <strong>microgravity</strong>, buoyant convection ceases. Oxygen reaches the fuel solely through molecular diffusion, forming a symmetric <strong>blue spherical flame</strong> with minimal soot radiation.
              </p>
            ) : (
              <p>
                In <strong>Earth gravity (1g)</strong>, hot combustion products rise rapidly, entraining fresh air into an elongated, <strong>buoyant flickering plume</strong> with incandescent soot radiation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroFlame;
