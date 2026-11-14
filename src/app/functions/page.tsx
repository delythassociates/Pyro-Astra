'use client';

import React, { useState } from 'react';
import matrixData from '@/data/analysis/function_matrix.json';
import { ShieldCheck, ExternalLink, Info, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Workstream I
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-950 text-amber-400 border border-amber-800/60">
                  defined by the PYRO-ASTRA team
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                Spacecraft Fire Safety Function Matrix
              </h1>
              <p className="mt-2 text-slate-400 max-w-3xl text-sm leading-relaxed">
                A deterministic cross-reference mapping 6 fire safety operational functions against NASA's 8 deep microgravity investigations.
                Every tagged cell is backed by an audited verbatim quote and its exact JSON key path in the official metadata.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono">
              <div className="text-right">
                <div className="text-slate-400">Total Statements Tagged</div>
                <div className="text-lg font-bold text-cyan-400">{summary.total_tags_with_quotes}</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <div className="text-slate-400">Empty Cells (Unstated)</div>
                <div className="text-lg font-bold text-slate-500">{summary.total_empty_cells}</div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Matrix View (6 Functions × 8 Investigations)
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'transfer'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Earth-Transfer Technology Column
            </button>
          </div>
        </div>

        {/* Matrix View */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800">
                    <th className="py-4 px-4 font-semibold text-slate-300 w-64 min-w-[220px]">
                      Function Domain
                      <div className="text-xs font-normal text-slate-500 mt-0.5">Defined by PYRO-ASTRA</div>
                    </th>
                    {investigations_meta.map((inv) => (
                      <th key={inv.id} className="py-4 px-3 font-semibold text-slate-300 min-w-[130px] text-center border-l border-slate-800/60">
                        <div className="font-mono text-cyan-400 text-xs font-bold">{inv.acronym}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{inv.id}</div>
                      </th>
                    ))}
                    <th className="py-4 px-4 font-semibold text-amber-400 min-w-[180px] border-l border-slate-800">
                      Earth-Transfer Spinoff
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matrix.map((row) => (
                    <tr key={row.function_id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Function Description Column */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-slate-200 text-sm">{row.function_name}</div>
                        <div className="text-xs text-slate-400 mt-1 leading-snug">{row.description}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {row.keywords.slice(0, 3).map((kw) => (
                            <span key={kw} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 8 Investigation Cells */}
                      {row.investigations.map((cell) => {
                        const isTagged = cell.tagged;
                        return (
                          <td
                            key={cell.investigation_id}
                            className={`p-2 align-middle text-center border-l border-slate-800/60 transition-all ${
                              isTagged ? 'cursor-pointer hover:bg-cyan-950/40' : 'bg-slate-950/20'
                            }`}
                            onClick={() => {
                              if (isTagged) {
                                setSelectedCell({
                                  fnName: row.function_name,
                                  fnDesc: row.description,
                                  cell,
                                });
                              }
                            }}
                          >
                            {isTagged ? (
                              <div className="inline-flex flex-col items-center justify-center p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 w-full hover:border-cyan-400 transition-colors">
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 mb-1" />
                                <span className="text-[10px] font-mono font-medium text-cyan-200">
                                  {cell.key_path}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center justify-center p-2 rounded-lg text-slate-600">
                                <span className="text-slate-600 text-xs">—</span>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Earth Transfer Link */}
                      <td className="py-4 px-4 align-top border-l border-slate-800 bg-slate-900/30 text-xs">
                        {row.earth_transfer ? (
                          <div>
                            <div className="font-semibold text-amber-300 flex items-center gap-1">
                              {row.earth_transfer.title}
                            </div>
                            <p className="text-slate-400 mt-1 text-[11px] leading-tight line-clamp-2">
                              {row.earth_transfer.description}
                            </p>
                            <a
                              href={row.earth_transfer.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                            >
                              Source Spinoff <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">None reported</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Rule Notice */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Strict Rule Notice:</strong> empty cell = no matching statement in the metadata we processed.
                </span>
              </div>
              <span className="text-slate-500">
                Audit Status: 25 quotes verified verbatim via Rule 10 (npm run analyze)
              </span>
            </div>
          </div>
        )}

        {/* Earth Transfer Tab */}
        {activeTab === 'transfer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matrix.map((row) => {
              const transfer = row.earth_transfer;
              if (!transfer) return null;
              return (
                <div
                  key={row.function_id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                        {row.function_name}
                      </span>
                      {transfer.provenance && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {transfer.provenance.source_id}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{transfer.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{transfer.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">
                      {transfer.provenance?.row_or_page ?? 'Official NASA Publication'}
                    </span>
                    <a
                      href={transfer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Visit Spinoff <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Verbatim Quote Detail Modal */}
        {selectedCell && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCell(null)}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {selectedCell.cell.investigation_id} ({selectedCell.cell.acronym})
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Function: {selectedCell.fnName}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedCell.cell.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Verbatim Quote Card */}
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Verbatim Source Statement (Rule 10 Verified Substring)
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 text-cyan-200 text-sm font-sans italic leading-relaxed">
                  &ldquo;{selectedCell.cell.quote}&rdquo;
                </div>
              </div>

              {/* Provenance Metadata Details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 mb-1">JSON Key Path</div>
                  <div className="text-white font-semibold">{selectedCell.cell.key_path}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 mb-1">Persistent DOI</div>
                  <div className="text-cyan-400 font-semibold">{selectedCell.cell.doi}</div>
                </div>
                <div className="col-span-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 mb-1">Source Metadata Location</div>
                  <div className="text-slate-300 break-all">{selectedCell.cell.source_file}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <a
                  href={`https://doi.org/${selectedCell.cell.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  Open PSI Record DOI <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
