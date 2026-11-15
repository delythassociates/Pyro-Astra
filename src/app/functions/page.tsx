'use client';

import React, { useState } from 'react';
import matrixData from '../../../data/analysis/function_matrix.json';
import { ShieldCheck, Info, CheckCircle2, XCircle, Grid } from 'lucide-react';

interface MatrixCell {
  function_id: string;
  investigation_id: string;
  acronym: string;
  name: string;
  doi: string;
  tagged: boolean;
  quote: string | null;
  key_path: string | null;
  source_file: string | null;
}

interface EarthTransferApp {
  id: string;
  title: string;
  description: string;
  url: string;
  provenance?: {
    source_id: string;
    doi: string | null;
    file: string | null;
    row_or_page: string | null;
    entered_by: string;
    note: string | null;
  };
}

interface FunctionRow {
  function_id: string;
  function_name: string;
  description: string;
  keywords: string[];
  earth_transfer?: EarthTransferApp;
  investigations: MatrixCell[];
}

export default function FunctionsPage() {
  const [selectedCell, setSelectedCell] = useState<{
    fnName: string;
    fnDesc: string;
    cell: MatrixCell;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'matrix' | 'transfer'>('matrix');

  const { matrix, summary, investigations_meta } = matrixData as {
    label: string;
    description: string;
    footer_notice: string;
    summary: {
      total_functions: number;
      total_deep_investigations: number;
      total_tags_with_quotes: number;
      total_empty_cells: number;
      function_stats: Record<string, { name: string; tagged_count: number; empty_count: number }>;
    };
    investigations_meta: Array<{ id: string; acronym: string; name: string; doi: string }>;
    matrix: FunctionRow[];
  };

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-800 uppercase tracking-wider font-semibold">
          <Grid className="w-4 h-4 text-sky-700" />
          <span>Combustion Function Matrix · Analytical Relationships</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Microgravity Combustion Function Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Cross-mapping the 8 deep NASA PSI investigations against fundamental combustion physics functions. Every non-empty cell is backed by an audited verbatim quote from NASA source publications.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
            activeTab === 'matrix'
              ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Function Matrix ({summary.total_functions} Functions × 8 Investigations)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transfer')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
            activeTab === 'transfer'
              ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Earth Transfer Applications
        </button>
      </div>

      {activeTab === 'matrix' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-3 font-semibold min-w-[200px]">Function / Phenomenon</th>
                  {investigations_meta.map((inv) => (
                    <th key={inv.id} className="p-3 font-semibold text-center min-w-[100px]">
                      <div>{inv.acronym}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{inv.id}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrix.map((row) => (
                  <tr key={row.function_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.function_name}</div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">{row.description}</div>
                    </td>
                    {row.investigations.map((cell) => (
                      <td key={cell.investigation_id} className="p-3 text-center">
                        {cell.tagged ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCell({
                                fnName: row.function_name,
                                fnDesc: row.description,
                                cell,
                              })
                            }
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                            title={`Inspect quote for ${cell.acronym}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 text-slate-300">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cell Inspection Popover */}
          {selectedCell && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sky-900">
                  {selectedCell.fnName} in {selectedCell.cell.acronym} ({selectedCell.cell.investigation_id})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  Close [X]
                </button>
              </div>
              <p className="font-sans italic text-slate-800 bg-white p-3 rounded border border-slate-200">
                "{selectedCell.cell.quote}"
              </p>
              <div className="text-[10px] text-slate-500 flex flex-wrap justify-between gap-2">
                <span>File: {selectedCell.cell.source_file}</span>
                <span>DOI: {selectedCell.cell.doi}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matrix
            .filter((m) => m.earth_transfer)
            .map((m) => (
              <div
                key={m.function_id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
              >
                <div className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">
                  {m.function_name}
                </div>
                <h3 className="font-bold text-base text-slate-900">{m.earth_transfer?.title}</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  {m.earth_transfer?.description}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Source: {m.earth_transfer?.provenance?.source_id}</span>
                  <a
                    href={m.earth_transfer?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:text-sky-900 font-medium"
                  >
                    Documentation Link →
                  </a>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
