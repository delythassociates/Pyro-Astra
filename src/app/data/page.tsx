'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import manifestData from '../../../release/manifest.json';
import extractionsData from '../../../release/extractions.json';
import fieldDictionaryData from '../../../release/field_dictionary.json';
import table51Data from '../../../data/bass2_table_5_1.json';

export default function DataDownloadCenter() {
  const [activeTab, setActiveTab] = useState<'investigations' | 'table51' | 'extractions' | 'dictionary' | 'manifest'>('investigations');
  const [codeTab, setCodeTab] = useState<'python' | 'curl' | 'ts'>('python');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepth, setFilterDepth] = useState<'all' | 'deep' | 'catalog'>('all');
  const [selectedExtractionsId, setSelectedExtractionsId] = useState<string>('PSI-102');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const filteredInvs = DEFAULT_INVESTIGATIONS.filter((inv) => {
    const matchesDepth = filterDepth === 'all' || inv.depth === filterDepth;
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.safety_areas.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDepth && matchesSearch;
  });

  const deepInvIds = Object.keys(extractionsData.investigations);

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Banner */}
        <div className="border-b border-cyan-900/40 pb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            <span>NASA Physical Sciences Informatics (PSI)</span>
            <span>·</span>
            <span>Workstream N Release Package</span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 text-[10px]">
              defined by the PYRO-ASTRA team
            </span>
            <span>·</span>
            <span>Challenge: Flame in Freefall</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
            Data Release & Download Center
          </h1>
          <p className="text-base text-zinc-300 font-sans mt-2 max-w-4xl">
            Official scientific data distribution package for microgravity combustion investigations.
            Every record carries verifiable provenance to authentic NASA PSI records and official technical memoranda.
            Zero synthetic, interpolated, or ungrounded values.
          </p>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-800/40">
              <span className="text-xs font-mono text-cyan-400 uppercase block">Total Packaged</span>
              <span className="text-2xl font-mono font-bold text-white">18 Investigations</span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">8 Deep · 10 Catalog</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-800/40">
              <span className="text-xs font-mono text-cyan-400 uppercase block">Table 5.1 Burn Runs</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">20 Flight Tests</span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">BASS-II Flight Matrix</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-800/40">
              <span className="text-xs font-mono text-cyan-400 uppercase block">Scientific Provenance</span>
              <span className="text-2xl font-mono font-bold text-cyan-300">100.0% Grounded</span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">0 Ungrounded Numbers</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-800/40">
              <span className="text-xs font-mono text-cyan-400 uppercase block">Integrity Verification</span>
              <span className="text-2xl font-mono font-bold text-indigo-300">SHA-256</span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">Signed Release Manifest</span>
            </div>
          </div>
        </div>

        {/* Registry of Open Data on AWS License Banner (CRITICAL REQUIREMENT) */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/60 border border-cyan-500/40 shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  OPEN DATA STATEMENT
                </span>
                <span className="text-xs font-mono text-zinc-400">Registry of Open Data on AWS</span>
              </div>
              <blockquote className="text-lg sm:text-xl font-mono font-bold text-cyan-100 border-l-2 border-cyan-400 pl-3 italic">
                &ldquo;There are no restrictions on the use of this data.&rdquo;
              </blockquote>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-3xl">
                NASA Physical Sciences Informatics combustion research is dedicated to open science.
                Underlying data is public domain (Creative Commons CC0-1.0 Universal).
                Platform transformation code and models are published under the MIT License.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
              <a
                href="https://registry.opendata.aws/nasa-psi/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 text-center"
              >
                <span>AWS Open Data Registry</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://psi.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
              >
                <span>NASA PSI Portal</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Release Artifacts Download Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
                <span>Release Artifacts</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  v1.0.0
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Downloadable package containing tabular matrices, grounded extractions with quotes, schema definitions, and checksum manifests.
              </p>
            </div>
            <button
              onClick={() => {
                const allUrls = manifestData.artifacts.map((a) => a.download_url);
                allUrls.forEach((url, i) => {
                  setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = url.split('/').pop() || 'download';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }, i * 300);
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download All Artifacts</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {manifestData.artifacts.map((art) => {
              const formatColors: Record<string, string> = {
                CSV: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
                JSON: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
                MD: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
                TXT: 'bg-zinc-800 text-zinc-300 border-zinc-700',
              };
              const colorClass = formatColors[art.format] || 'bg-slate-800 text-slate-300 border-slate-700';
              const kbSize = (art.byte_size / 1024).toFixed(1);

              return (
                <div
                  key={art.file_name}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-800/60 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colorClass}`}>
                        {art.format}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{kbSize} KB</span>
                    </div>

                    <div>
                      <h3 className="font-mono text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {art.file_name}
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans mt-1 line-clamp-2">
                        {art.description}
                      </p>
                    </div>

                    {/* SHA256 snippet */}
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>SHA-256</span>
                        <button
                          onClick={() => handleCopy(art.sha256, art.file_name)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {copiedKey === art.file_name ? 'Copied!' : 'Copy Hash'}
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-zinc-400 truncate">
                        {art.sha256}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <a
                      href={art.download_url}
                      download={art.file_name}
                      className="flex-1 py-2 px-3 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/50 text-cyan-200 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </a>
                    {art.file_name.endsWith('.csv') && (
                      <button
                        onClick={() => setActiveTab(art.file_name.includes('table_5_1') ? 'table51' : 'investigations')}
                        className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-zinc-300 font-mono text-xs transition-colors"
                      >
                        Preview
                      </button>
                    )}
                    {art.file_name === 'extractions.json' && (
                      <button
                        onClick={() => setActiveTab('extractions')}
                        className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-zinc-300 font-mono text-xs transition-colors"
                      >
                        Quotes
                      </button>
                    )}
                    {art.file_name === 'field_dictionary.json' && (
                      <button
                        onClick={() => setActiveTab('dictionary')}
                        className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-zinc-300 font-mono text-xs transition-colors"
                      >
                        Schema
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive In-Browser Data Previewer */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-mono font-bold text-white">Live Data Previewer</h2>
              <p className="text-xs text-zinc-400 font-sans">
                Inspect authentic tables, quotes, and schemas directly in your browser.
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab('investigations')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeTab === 'investigations'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Investigations ({DEFAULT_INVESTIGATIONS.length})
              </button>
              <button
                onClick={() => setActiveTab('table51')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeTab === 'table51'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Table 5.1 BASS-II ({table51Data.row_count} Tests)
              </button>
              <button
                onClick={() => setActiveTab('extractions')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeTab === 'extractions'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Grounded Quotes ({deepInvIds.length} Deep)
              </button>
              <button
                onClick={() => setActiveTab('dictionary')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeTab === 'dictionary'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Field Dictionary ({fieldDictionaryData.fields.length} Fields)
              </button>
              <button
                onClick={() => setActiveTab('manifest')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeTab === 'manifest'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Manifest Hashes
              </button>
            </div>
          </div>

          {/* TAB 1: Investigations Table */}
          {activeTab === 'investigations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-mono text-zinc-400">Filter Depth:</span>
                  {(['all', 'deep', 'catalog'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDepth(d)}
                      className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
                        filterDepth === d
                          ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/60 font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search acronym, name, area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950/90 sticky top-0 border-b border-slate-800 text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Acronym</th>
                        <th className="py-2.5 px-3">Title / Safety Area</th>
                        <th className="py-2.5 px-3">DOI</th>
                        <th className="py-2.5 px-3">Cabin O₂ %</th>
                        <th className="py-2.5 px-3">Pressure</th>
                        <th className="py-2.5 px-3">Airflow</th>
                        <th className="py-2.5 px-3">Tests</th>
                        <th className="py-2.5 px-3">Depth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredInvs.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-cyan-400">{inv.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-white">{inv.acronym}</td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="truncate text-zinc-200" title={inv.name}>
                              {inv.name}
                            </div>
                            <div className="flex gap-1 mt-0.5">
                              {inv.safety_areas.map((sa) => (
                                <span key={sa} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                                  {sa}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">
                            <a
                              href={`https://doi.org/${inv.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-cyan-300 underline"
                            >
                              {inv.doi}
                            </a>
                          </td>
                          <td className="py-2.5 px-3">
                            {inv.cabin_o2_pct ? (
                              <span className="text-emerald-400 font-semibold">
                                {inv.cabin_o2_pct.value.min !== null ? `${inv.cabin_o2_pct.value.min}-` : ''}
                                {inv.cabin_o2_pct.value.max}%
                              </span>
                            ) : (
                              <span className="text-zinc-600 italic">not reported</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {inv.pressure_psi ? (
                              <span className="text-zinc-200">
                                {inv.pressure_psi.value.min !== null ? `${inv.pressure_psi.value.min}-` : ''}
                                {inv.pressure_psi.value.max} psi
                              </span>
                            ) : (
                              <span className="text-zinc-600 italic">not reported</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {inv.airflow_speed_cm_s ? (
                              <span className="text-zinc-200">
                                {inv.airflow_speed_cm_s.value.min !== null ? `${inv.airflow_speed_cm_s.value.min}-` : ''}
                                {inv.airflow_speed_cm_s.value.max} cm/s
                              </span>
                            ) : (
                              <span className="text-zinc-600 italic">not reported</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {inv.n_tests ? (
                              <span className="text-cyan-300 font-bold">{inv.n_tests.value}</span>
                            ) : (
                              <span className="text-zinc-600 italic">not reported</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                inv.depth === 'deep'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {inv.depth}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Table 5.1 BASS-II Burn Matrix */}
          {activeTab === 'table51' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">
                    {table51Data.table}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Hand-entered directly from official technical report: <span className="text-cyan-300">{table51Data.source}</span>, {table51Data.page}.
                  </p>
                </div>
                <a
                  href="/release/table_5_1_bass2.csv"
                  download="table_5_1_bass2.csv"
                  className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-mono text-xs font-semibold"
                >
                  Download CSV
                </a>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3">Test No</th>
                        <th className="py-2.5 px-3">Thickness (mm)</th>
                        <th className="py-2.5 px-3">Width (cm)</th>
                        <th className="py-2.5 px-3">Sides Burning</th>
                        <th className="py-2.5 px-3">Airflow (cm/s)</th>
                        <th className="py-2.5 px-3">Spread Rate (mm/s)</th>
                        <th className="py-2.5 px-3">Burn Time (min)</th>
                        <th className="py-2.5 px-3">Initial O₂ %</th>
                        <th className="py-2.5 px-3">Final O₂ %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {table51Data.rows.map((r) => (
                        <tr key={r.test_no} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 font-bold text-cyan-400">{r.test_no}</td>
                          <td className="py-2 px-3 text-zinc-200">{r.thickness_mm}</td>
                          <td className="py-2 px-3 text-zinc-200">{r.width_cm}</td>
                          <td className="py-2 px-3 text-zinc-200">{r.sides_burning}</td>
                          <td className="py-2 px-3 text-zinc-200">{r.velocity_cm_s}</td>
                          <td className="py-2 px-3 text-emerald-400 font-semibold">{r.spread_rate_mm_s}</td>
                          <td className="py-2 px-3 text-zinc-200">{r.burn_time_min}</td>
                          <td className="py-2 px-3 text-zinc-200">{r.initial_o2_vol_pct}%</td>
                          <td className="py-2 px-3 text-zinc-200">{r.final_o2_vol_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Grounded Extractions with Quotes & Key Paths */}
          {activeTab === 'extractions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs font-mono text-zinc-400">Select Investigation:</span>
                {deepInvIds.map((id) => {
                  const invMeta = extractionsData.investigations[id as keyof typeof extractionsData.investigations];
                  const isSelected = selectedExtractionsId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedExtractionsId(id)}
                      className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/70 font-bold'
                          : 'text-zinc-400 hover:text-white bg-slate-950/60 border border-slate-800'
                      }`}
                    >
                      {id} ({invMeta.acronym})
                    </button>
                  );
                })}
              </div>

              {(() => {
                const currentInv = extractionsData.investigations[selectedExtractionsId as keyof typeof extractionsData.investigations];
                if (!currentInv) return null;

                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                        <div>
                          <h3 className="text-base font-mono font-bold text-white">
                            {currentInv.acronym} · {currentInv.name}
                          </h3>
                          <span className="text-xs font-mono text-cyan-400">DOI: {currentInv.doi}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {currentInv.fields.length} Grounded Extractions
                        </span>
                      </div>

                      <div className="space-y-4">
                        {currentInv.fields.map((f: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 hover:border-cyan-800/60 transition-colors"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                              <span className="font-bold text-cyan-300 uppercase tracking-wider">
                                {f.field}
                              </span>
                              <div className="flex items-center gap-2 text-zinc-400">
                                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                                  Path: {f.key_path}
                                </span>
                                <span className="text-[11px] text-zinc-500">{f.source_file}</span>
                              </div>
                            </div>

                            {/* Exact Verbatim Quote */}
                            <div className="p-2.5 rounded bg-slate-900/90 border-l-2 border-cyan-500 font-sans text-xs text-zinc-200 italic">
                              &ldquo;{f.exact_quote}&rdquo;
                            </div>

                            {/* Parsed / Hand Extracted Value */}
                            <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500">Value:</span>
                                <span className="text-emerald-400 font-semibold">
                                  {typeof f.value === 'object' && f.value !== null
                                    ? JSON.stringify(f.value)
                                    : String(f.value)}
                                  {f.unit ? ` ${f.unit}` : ''}
                                </span>
                              </div>
                              {f.note && (
                                <span className="text-[11px] text-zinc-400 font-sans italic">
                                  Note: {f.note}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: Field Dictionary */}
          {activeTab === 'dictionary' && (
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-zinc-400">
                    <tr>
                      <th className="py-2.5 px-3">Field Name</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Physical Unit</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {fieldDictionaryData.fields.map((fld: any) => (
                      <tr key={fld.name} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-cyan-400">{fld.name}</td>
                        <td className="py-2.5 px-3 text-amber-300">{fld.type}</td>
                        <td className="py-2.5 px-3 text-emerald-400">{fld.unit || '—'}</td>
                        <td className="py-2.5 px-3 font-sans text-zinc-300 max-w-sm">{fld.description}</td>
                        <td className="py-2.5 px-3 text-zinc-400 truncate max-w-xs">
                          {typeof fld.example === 'object' ? JSON.stringify(fld.example) : String(fld.example)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SHA-256 Manifest */}
          {activeTab === 'manifest' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400 border-b border-slate-800 pb-2">
                <span>Release SHA-256 Manifest Ledger (GNU / BSD Format)</span>
                <a
                  href="/release/manifest.sha256"
                  download="manifest.sha256"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Download manifest.sha256
                </a>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1.5 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                {manifestData.artifacts.map((a) => (
                  <div key={a.file_name} className="flex gap-4">
                    <span className="text-cyan-300 font-bold">{a.sha256}</span>
                    <span className="text-zinc-400">{a.file_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Developer & Researcher Ingestion Snippets */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <h2 className="text-xl font-mono font-bold text-white">Researcher Ingestion Quickstart</h2>
            <p className="text-xs text-zinc-400 font-sans">
              Load clean tabular data, extract quotes, or verify hashes directly in your script.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {(['python', 'curl', 'ts'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeTab(lang)}
                    className={`px-3 py-1 rounded text-xs font-mono uppercase transition-colors ${
                      codeTab === lang
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang === 'python' ? 'Python (Pandas)' : lang === 'curl' ? 'cURL / Shell' : 'TypeScript / JS'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const snippets: Record<string, string> = {
                    python: `import pandas as pd\nimport json\n\n# Load 18 NASA investigations\ndf = pd.read_csv("https://pyro-astra.vercel.app/release/investigations.csv")\nprint(f"Loaded {len(df)} investigations.")\n\n# Load BASS-II Table 5.1 flight burn tests (20 runs)\nburn_df = pd.read_csv("https://pyro-astra.vercel.app/release/table_5_1_bass2.csv")\nprint(f"BASS-II Tests: {len(burn_df)} flight burn runs.")`,
                    curl: `# Download the dataset and verify SHA-256 integrity\ncurl -O https://pyro-astra.vercel.app/release/manifest.sha256\ncurl -O https://pyro-astra.vercel.app/release/investigations.csv\ncurl -O https://pyro-astra.vercel.app/release/extractions.json\n\n# Verify checksums\nsha256sum -c manifest.sha256 --ignore-missing`,
                    ts: `// Ingest investigations in Node.js / TypeScript\nasync function loadInvestigations() {\n  const res = await fetch('https://pyro-astra.vercel.app/release/availability.json');\n  const data = await res.json();\n  console.log(\`NASA PSI Catalog: \${data.summary.total_investigations} investigations.\`);\n}`,
                  };
                  handleCopy(snippets[codeTab], 'code-snippet');
                }}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedKey === 'code-snippet' ? 'Copied to Clipboard!' : 'Copy Snippet'}
              </button>
            </div>

            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {codeTab === 'python' && (
                <code>
{`import pandas as pd
import json

# 1. Load flattened investigations CSV
df = pd.read_csv("https://pyro-astra.vercel.app/release/investigations.csv")
print(f"Loaded {len(df)} investigations.")

# 2. Inspect cabin oxygen ranges (excluding burner flow)
cabin_o2_df = df[df["cabin_o2_pct_value"].notna()][["id", "acronym", "cabin_o2_pct_value", "cabin_o2_pct_provenance_page"]]
print(cabin_o2_df)

# 3. Load BASS-II Table 5.1 flight burn tests (20 runs)
burn_df = pd.read_csv("https://pyro-astra.vercel.app/release/table_5_1_bass2.csv")
print(f"BASS-II Tests: {len(burn_df)} flight burn runs.")`}
                </code>
              )}
              {codeTab === 'curl' && (
                <code>
{`# 1. Download release manifest and CSV dataset
curl -O https://pyro-astra.vercel.app/release/manifest.sha256
curl -O https://pyro-astra.vercel.app/release/investigations.csv
curl -O https://pyro-astra.vercel.app/release/extractions.json
curl -O https://pyro-astra.vercel.app/release/table_5_1_bass2.csv

# 2. Verify SHA-256 integrity
sha256sum -c manifest.sha256 --ignore-missing`}
                </code>
              )}
              {codeTab === 'ts' && (
                <code>
{`// Ingest NASA PSI availability & extractions in TypeScript / Node.js
async function loadPyroAstraData() {
  const res = await fetch('https://pyro-astra.vercel.app/release/availability.json');
  const catalog = await res.json();
  console.log(\`NASA PSI Catalog: \${catalog.summary.total_investigations} records.\`);
  console.log(\`Deep investigations: \${catalog.summary.deep_investigations}\`);
}`}
                </code>
              )}
            </pre>
          </div>
        </div>

        {/* Non-Negotiable Physical Grounding Notice */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Scientific Grounding & Physical Constraints (SPEC Section 2)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans text-zinc-300">
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-white block">Rule 1 & 2: Zero Fabrication</span>
              <p className="text-zinc-400">
                Values not stated by NASA are stored as null (&apos;not reported&apos;). Every displayed number carries full provenance (source_id, doi, file/page, entered_by, note).
              </p>
            </div>
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-white block">Rule 4: Oxygen Isolation</span>
              <p className="text-zinc-400">
                Burner flow oxygen (e.g. CFI-G up to 85% O₂) is strictly partitioned into burner_flow_o2_pct and never mixed with crew cabin oxygen.
              </p>
            </div>
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-white block">Rule 5: Zero Partial-Gravity Extrapolation</span>
              <p className="text-zinc-400">
                NASA PSI has no partial-gravity combustion data. Predictions for Moon (0.16g) or Mars (0.38g) are prohibited. 0g and 1g are shown as bounds.
              </p>
            </div>
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-mono font-bold text-white block">Rule 6: Rockets & Propellants Excluded</span>
              <p className="text-zinc-400">
                Dataset focuses strictly on human crew spacecraft and habitat fire safety. Rocket propulsion is out of scope.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
