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
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : isBoundary
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : 'bg-sky-50/70 border-sky-200 text-sky-950'
      } ${className}`}
      data-estimate-model={modelId}
      data-applicability={applicability.status}
    >
      {/* Header with Model Estimate Badge & Model ID */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300">
            ⚠ Model Estimate
          </span>
          <span className="text-xs font-mono text-slate-500">
            ID: <span className="text-slate-800 font-semibold">{modelId}</span>
          </span>
        </div>

        {/* Applicability Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isOutOfDomain
                ? 'bg-rose-600 animate-pulse'
                : isBoundary
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
          />
          <span
            className={`capitalize font-semibold ${
              isOutOfDomain
                ? 'text-rose-700'
                : isBoundary
                ? 'text-amber-800'
                : 'text-emerald-700'
            }`}
          >
            {applicability.status}
          </span>
        </div>
      </div>

      {/* Primary Value Display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
          {typeof estimate === 'number' ? estimate.toFixed(2) : estimate}
        </span>
        {unit && <span className="text-sm font-mono text-slate-600 font-medium">{unit}</span>}
      </div>

      {/* Prediction Interval Whisker */}
      {interval && (
        <div className="mb-3 space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between text-[11px] font-mono text-slate-600">
            <span>{Math.round(confidenceLevel * 100)}% Prediction Interval</span>
            <span className="text-sky-800 font-semibold">
              [{interval.min.toFixed(2)}, {interval.max.toFixed(2)}] {unit}
            </span>
          </div>

          {/* Visual Whisker Bar */}
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden flex items-center px-1 border border-slate-200">
            <div className="absolute inset-y-0 left-1/4 right-1/4 bg-sky-200 rounded-full" />
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-3 bg-amber-500 rounded-full shadow" />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>Min: {interval.min.toFixed(2)}</span>
            <span>Point Est.</span>
            <span>Max: {interval.max.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Applicability Note / Warnings */}
      {applicability.reason && (
        <p className="text-xs text-slate-700 mb-2 font-sans bg-white/80 p-2 rounded border border-slate-200">
          <span className="font-semibold text-slate-900">Domain Note:</span> {applicability.reason}
        </p>
      )}

      {/* Non-negotiable Rule Notice */}
      <div className="text-[10px] text-slate-500 border-t border-slate-200/80 pt-2 flex items-center justify-between">
        <span>Non-PSI observation · Zero/1g domain bounds only</span>
        <span className="text-rose-700 font-mono font-medium">No partial-g validity</span>
      </div>
    </div>
  );
}

export default Estimate;
