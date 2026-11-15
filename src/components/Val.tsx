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

  // Rule 1: If PSI does not state it, store null and show 'not reported' badge
  if (effectiveValue === null || effectiveValue === undefined) {
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-500 border border-slate-200 ${className}`}
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
      className={`inline-flex items-center gap-1.5 font-mono group relative ${className}`}
      data-source={prov.source_id}
      data-doi={prov.doi ?? undefined}
      data-entered-by={prov.entered_by}
      data-val-rendered="true"
    >
      <span className="font-semibold text-slate-900 tracking-tight">
        {displayText}
        {effectiveUnit ? (
          <span className="ml-1 text-xs font-normal text-slate-500">{effectiveUnit}</span>
        ) : null}
      </span>

      {/* Interactive Provenance Trigger Pill */}
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center justify-center text-[10px] font-mono font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 hover:border-sky-300 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-400"
        title={`Provenance: ${prov.source_id} (${prov.entered_by})`}
        aria-label={`Provenance for ${displayText}`}
      >
        {prov.source_id}
      </button>

      {/* Provenance Card Popover (Clean Bright Daylight Card) */}
      {showTooltip && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-80 p-3.5 text-xs bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 pointer-events-auto text-left leading-relaxed font-sans normal-case animate-in fade-in zoom-in-95 duration-100"
        >
          <span className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 font-mono">
            <span className="font-bold text-sky-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {prov.source_id}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {prov.entered_by}
            </span>
          </span>
          <span className="block space-y-1.5 text-slate-600 text-[11px]">
            {prov.doi && (
              <span className="block">
                <span className="text-slate-400 font-medium">DOI:</span>{' '}
                <a
                  href={`https://doi.org/${prov.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 font-mono underline hover:text-sky-900"
                >
                  {prov.doi}
                </a>
              </span>
            )}
            {prov.file && (
              <span className="block truncate font-mono">
                <span className="text-slate-400 font-sans font-medium">File:</span> {prov.file}
              </span>
            )}
            {prov.row_or_page && (
              <span className="block font-mono">
                <span className="text-slate-400 font-sans font-medium">Row/Page:</span> {prov.row_or_page}
              </span>
            )}
            {prov.note && (
              <span className="block pt-1.5 border-t border-slate-100 text-amber-800 bg-amber-50/50 p-1.5 rounded text-[11px] italic">
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
