'use client';

import React, { useState } from 'react';
import type { Provenance, Range, Val as ValType } from '@/data/schema';

export interface ValProps<T = number | string | Range | string[]> {
  val?: ValType<T> | null;
  value?: T | null;
  unit?: string | null;
  provenance?: Provenance | null;
  fallbackText?: string;
  className?: string;
  showBadge?: boolean;
}

export function Val<T = number | string | Range | string[]>({
  val,
  value: propValue,
  unit: propUnit,
  provenance: propProvenance,
  fallbackText = 'not reported',
  className = '',
  showBadge = false,
}: ValProps<T>) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Normalize inputs (support either val object or individual props)
  const effectiveValue = val !== undefined ? val?.value : propValue;
  const effectiveUnit = val !== undefined ? val?.unit : propUnit;
  const effectiveProvenance = val !== undefined ? val?.provenance : propProvenance;

  // Rule 1: If PSI does not state it, store null and show 'not reported'
  if (effectiveValue === null || effectiveValue === undefined) {
    return (
      <span
        className={`text-zinc-500 dark:text-zinc-400 italic text-sm ${className}`}
        data-not-reported="true"
      >
        {fallbackText}
      </span>
    );
  }

  // Rule 2 & Section 13: Every stored value carries provenance. The UI must refuse to render a number without it.
  if (!effectiveProvenance || !effectiveProvenance.source_id) {
    throw new Error(
      `[SPEC Section 13 Violation] Refusing to render value without valid provenance: ${JSON.stringify(
        { value: effectiveValue, unit: effectiveUnit }
      )}`
    );
  }

  // Format the display string
  const formatValue = (v: unknown): string => {
    if (v === null || v === undefined) return fallbackText;
    if (typeof v === 'object' && v !== null && 'min' in v && 'max' in v) {
      const r = v as Range;
      if (r.min === null || r.min === undefined) return `up to ${r.max}`;
      if (r.min === r.max) return `${r.min}`;
      return `${r.min} – ${r.max}`;
    }
    if (Array.isArray(v)) {
      return v.join(', ');
    }
    return String(v);
  };

  const displayText = formatValue(effectiveValue);
  const prov = effectiveProvenance;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono group relative ${className}`}
      data-source={prov.source_id}
      data-doi={prov.doi ?? undefined}
      data-entered-by={prov.entered_by}
      data-val-rendered="true"
    >
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
        {displayText}
        {effectiveUnit ? <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">{effectiveUnit}</span> : null}
      </span>

      {/* Interactive Provenance Trigger */}
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center justify-center text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-cyan-950/20 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-700/30 hover:border-cyan-500 transition-colors focus:outline-none"
        title={`Provenance: ${prov.source_id} (${prov.entered_by})`}
        aria-label={`Provenance for ${displayText}`}
      >
        {prov.source_id}
      </button>

      {/* Provenance Card Popover */}
      {showTooltip && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 text-xs bg-slate-900/95 text-slate-100 rounded-lg shadow-xl border border-cyan-800/50 backdrop-blur-md pointer-events-auto text-left leading-relaxed font-sans normal-case"
        >
          <span className="flex items-center justify-between border-b border-cyan-800/40 pb-1.5 mb-2 font-mono">
            <span className="font-bold text-cyan-400">{prov.source_id}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-cyan-700/40">
              {prov.entered_by}
            </span>
          </span>
          <span className="block space-y-1 text-zinc-300 text-[11px]">
            {prov.doi && (
              <span className="block">
                <span className="text-zinc-400 font-semibold">DOI:</span>{' '}
                <a
                  href={`https://doi.org/${prov.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 underline hover:text-cyan-200"
                >
                  {prov.doi}
                </a>
              </span>
            )}
            {prov.file && (
              <span className="block truncate">
                <span className="text-zinc-400 font-semibold">File:</span> {prov.file}
              </span>
            )}
            {prov.row_or_page && (
              <span className="block">
                <span className="text-zinc-400 font-semibold">Row/Page:</span> {prov.row_or_page}
              </span>
            )}
            {prov.note && (
              <span className="block pt-1 border-t border-slate-800 text-amber-300/90 italic">
                Note: {prov.note}
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  );
}

export default Val;
