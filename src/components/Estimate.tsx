'use client';

import React from 'react';

export interface EstimateProps {
  estimate: number | string;
  unit?: string | null;
  interval?: { min: number; max: number } | null;
  modelId: string;
  applicability: {
    status: 'in-domain' | 'out-of-domain' | 'boundary';
    reason?: string;
  };
  confidenceLevel?: number; // e.g. 0.90 (90% prediction interval)
  className?: string;
}

export function Estimate({
  estimate,
  unit,
  interval,
  modelId,
  applicability,
  confidenceLevel = 0.9,
  className = '',
}: EstimateProps) {
  const isOutOfDomain = applicability.status === 'out-of-domain';
  const isBoundary = applicability.status === 'boundary';

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isOutOfDomain
          ? 'bg-red-950/20 border-red-500/40 text-red-200'
          : isBoundary
          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
          : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-100'
      } ${className}`}
      data-estimate-model={modelId}
      data-applicability={applicability.status}
    >
      {/* Header with Model Estimate Badge & Model ID */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/30 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ⚠ Model Estimate
          </span>
          <span className="text-xs font-mono text-zinc-400">
            ID: <span className="text-zinc-200 font-semibold">{modelId}</span>
          </span>
        </div>

        {/* Applicability Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isOutOfDomain
                ? 'bg-red-500 animate-pulse'
                : isBoundary
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <span
            className={`capitalize font-medium ${
              isOutOfDomain
                ? 'text-red-400 font-bold'
                : isBoundary
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {applicability.status}
          </span>
        </div>
      </div>

      {/* Primary Value Display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold font-mono tracking-tight text-white">
          {typeof estimate === 'number' ? estimate.toFixed(2) : estimate}
        </span>
        {unit && <span className="text-sm font-mono text-zinc-400">{unit}</span>}
      </div>

      {/* Prediction Interval Whisker */}
      {interval && (
        <div className="mb-3 space-y-1.5 bg-black/30 p-2.5 rounded-lg border border-indigo-900/40">
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>
              {Math.round(confidenceLevel * 100)}% Prediction Interval
            </span>
            <span className="text-indigo-300">
              [{interval.min.toFixed(2)}, {interval.max.toFixed(2)}] {unit}
            </span>
          </div>

          {/* Visual Whisker Bar */}
          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden flex items-center px-1">
            <div className="absolute inset-y-0 left-1/4 right-1/4 bg-indigo-500/50 rounded-full" />
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-3 bg-amber-400 rounded-full shadow" />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
            <span>Min: {interval.min.toFixed(2)}</span>
            <span>Point Est.</span>
            <span>Max: {interval.max.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Applicability Note / Warnings */}
      {applicability.reason && (
        <p className="text-xs text-zinc-300 mb-2 font-sans bg-black/20 p-2 rounded border border-white/5">
          <span className="font-semibold text-zinc-400">Domain Note:</span> {applicability.reason}
        </p>
      )}

      {/* Non-negotiable Rule Notice */}
      <div className="text-[10px] text-zinc-400/80 border-t border-zinc-800/60 pt-2 flex items-center justify-between">
        <span>Non-PSI observation · Zero/1g domain bounds only</span>
        <span className="text-amber-400/80 font-mono">No partial-g validity</span>
      </div>
    </div>
  );
}

export default Estimate;
