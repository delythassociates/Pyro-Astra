'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileText,
  Filter,
  BarChart2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import readinessData from '../../../data/analysis/readiness.json';

interface QuestionItem {
  id: string;
  text: string;
  required_conditions: {
    material_class: string;
    o2_range: { min: number; max: number };
    pressure_range: { min: number; max: number };
    airflow_range: { min: number; max: number } | null;
    gravity_regime: string;
  };
  source: {
    file: string;
    citation: string;
    verbatim_quote: string;
  };
  material_matched: boolean;
  material_quote: string | null;
  material_quote_source: {
    file: string;
    key_path: string;
  } | null;
  o2_covered: boolean;
  pressure_covered: boolean;
  airflow_covered: boolean;
  verdict: string;
  reason: string;
  evidence: Array<{
    record_id: string;
    acronym: string;
    name: string;
    doi: string;
    [key: string]: any;
  }>;
}

type Verdict = 'All' | 'Documented' | 'Partially documented' | 'Not documented' | 'Not assessable';

export default function ReadinessPage() {
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict>('All');
  const [expandedId, setExpandedId] = useState<string | null>('Q01');
  const [showSensitivity, setShowSensitivity] = useState<boolean>(false);

  const { summary, sensitivity_report } = readinessData;
  const questions = readinessData.questions as unknown as QuestionItem[];

  const filteredQuestions = questions.filter((q) => {
    if (selectedVerdict === 'All') return true;
    return q.verdict === selectedVerdict;
  });

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Documented':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Documented
          </span>
        );
      case 'Partially documented':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Partially Documented
          </span>
        );
      case 'Not assessable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            Not Assessable
          </span>
        );
      case 'Not documented':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Not Documented
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
              Workstream J
            </span>
            <span className="px-2.5 py-1 text-xs font-mono tracking-wider uppercase bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
              defined by the PYRO-ASTRA team
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Habitat Fire-Safety Documentation Readiness
          </h1>
          <p className="text-zinc-400 max-w-3xl">
            A deterministic documentation check evaluating 20 target crewed habitat fire-safety questions
            against the 8 deep NASA PSI investigations.
          </p>

          {/* Mandatory Section 2 & Workstream J Notice */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                A documentation check, not a safety assessment. Ranges are envelopes; individual combinations are not confirmed.
              </p>
              <p className="text-xs text-amber-200/80">
                Rule 5 Notice: NASA PSI contains no partial-gravity combustion data. All lunar and Martian partial-gravity queries evaluate strictly as &apos;Not assessable&apos;. Burner-flow oxygen never counts as cabin air (Rule 4).
              </p>
              <p className="text-xs text-amber-300 font-mono">
                Scientific Context: the only solid-fuel O2 values we could source are BASS-II Table 5.1 (20 flat-PMMA tests, 16.8-22.2% O2); BASS, SAFFIRE-II and SAME do not report O2 in the public metadata.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedVerdict('Documented')}
            className={`p-4 rounded-lg border text-left transition-all ${
              selectedVerdict === 'Documented'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400">Documented</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {summary.counts.Documented}
              <span className="text-xs text-zinc-400 font-normal ml-1">
                ({summary.percentages.Documented}%)
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Both O2 & pressure tested</div>
          </button>

          <button
            onClick={() => setSelectedVerdict('Partially documented')}
            className={`p-4 rounded-lg border text-left transition-all ${
              selectedVerdict === 'Partially documented'
                ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-400">Partially</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {summary.counts['Partially documented']}
              <span className="text-xs text-zinc-400 font-normal ml-1">
                ({summary.percentages['Partially documented']}%)
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Bounds or 1g companion</div>
          </button>

          <button
            onClick={() => setSelectedVerdict('Not documented')}
            className={`p-4 rounded-lg border text-left transition-all ${
              selectedVerdict === 'Not documented'
                ? 'bg-zinc-800/60 border-zinc-500 ring-1 ring-zinc-500'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Not Documented</span>
              <XCircle className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {summary.counts['Not documented']}
              <span className="text-xs text-zinc-400 font-normal ml-1">
                ({summary.percentages['Not documented']}%)
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Unmined / unmeasured</div>
          </button>

          <button
            onClick={() => setSelectedVerdict('Not assessable')}
            className={`p-4 rounded-lg border text-left transition-all ${
              selectedVerdict === 'Not assessable'
                ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-400">Not Assessable</span>
              <HelpCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {summary.counts['Not assessable']}
              <span className="text-xs text-zinc-400 font-normal ml-1">
                ({summary.percentages['Not assessable']}%)
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Partial gravity (Rule 5)</div>
          </button>
        </div>

        {/* Sensitivity Analysis Toggle */}
        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Threshold Sensitivity Report</span>
            </div>
            <button
              onClick={() => setShowSensitivity(!showSensitivity)}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono"
            >
              {showSensitivity ? 'Hide Breakdown' : 'View Sensitivity Comparison'}
            </button>
          </div>

          {showSensitivity && (
            <div className="pt-3 border-t border-zinc-800 space-y-3 text-xs text-zinc-300">
              <p>{sensitivity_report.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white mb-1">Baseline (Envelope Overlap &gt; 0)</div>
                  <div>Documented: {sensitivity_report.baseline_counts.Documented}</div>
                  <div>Partially: {sensitivity_report.baseline_counts['Partially documented']}</div>
                  <div>Not Documented: {sensitivity_report.baseline_counts['Not documented']}</div>
                  <div>Not Assessable: {sensitivity_report.baseline_counts['Not assessable']}</div>
                </div>
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white mb-1">Strict (&ge; 50% Overlap)</div>
                  <div>Documented: {sensitivity_report.strict_counts.Documented}</div>
                  <div>Partially: {sensitivity_report.strict_counts['Partially documented']}</div>
                  <div>Not Documented: {sensitivity_report.strict_counts['Not documented']}</div>
                  <div>Not Assessable: {sensitivity_report.strict_counts['Not assessable']}</div>
                </div>
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
                  <div className="font-bold text-white mb-1">Broad (Relaxed Envelope)</div>
                  <div>Documented: {sensitivity_report.broad_counts.Documented}</div>
                  <div>Partially: {sensitivity_report.broad_counts['Partially documented']}</div>
                  <div>Not Documented: {sensitivity_report.broad_counts['Not documented']}</div>
                  <div>Not Assessable: {sensitivity_report.broad_counts['Not assessable']}</div>
                </div>
              </div>
              <p className="text-zinc-400 italic">
                {sensitivity_report.stability_note}
              </p>
            </div>
          )}
        </div>

        {/* Per-Parameter Reporting Summary for the 8 Deep Investigations */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-bold font-mono text-white">
                Metadata-Mined Investigations Parameter Reporting Audit (8 Priority Records)
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Exact reporting status (yes / no) and source key path for cabin O₂, pressure, and airflow.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              PREREGISTERED.md Revision 3
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800/80 bg-black/40">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-slate-900/80 text-[11px] text-zinc-400">
                  <th className="py-2.5 px-3">Investigation</th>
                  <th className="py-2.5 px-3">Phase</th>
                  <th className="py-2.5 px-3">Cabin O₂ Reported?</th>
                  <th className="py-2.5 px-3">Pressure Reported?</th>
                  <th className="py-2.5 px-3">Airflow Reported?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-[11px]">
                {readinessData.parameter_reporting_summary.map((rec: any) => (
                  <tr key={rec.investigation_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-bold text-white">{rec.acronym}</span>{' '}
                      <span className="text-zinc-500 text-[10px]">({rec.investigation_id})</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 uppercase">
                        {rec.fuel_phase}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.cabin_o2.reported === 'yes'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700/50'
                      }`}>
                        {rec.cabin_o2.reported}
                      </span>
                      <span className="text-[9px] text-zinc-500 block truncate max-w-[180px] mt-0.5" title={rec.cabin_o2.key_path}>
                        {rec.cabin_o2.key_path}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.pressure.reported === 'yes'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700/50'
                      }`}>
                        {rec.pressure.reported}
                      </span>
                      <span className="text-[9px] text-zinc-500 block truncate max-w-[180px] mt-0.5" title={rec.pressure.key_path}>
                        {rec.pressure.key_path}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.airflow.reported === 'yes'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700/50'
                      }`}>
                        {rec.airflow.reported}
                      </span>
                      <span className="text-[9px] text-zinc-500 block truncate max-w-[180px] mt-0.5" title={rec.airflow.key_path}>
                        {rec.airflow.key_path}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Questions:</span>
            {(['All', 'Documented', 'Partially documented', 'Not documented', 'Not assessable'] as Verdict[]).map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVerdict(v)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedVerdict === v
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Showing {filteredQuestions.length} of {questions.length}
          </span>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-4 cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs bg-zinc-800 text-zinc-300">
                        {q.id}
                      </span>
                      {getVerdictBadge(q.verdict)}
                      <span className="text-xs font-mono text-zinc-500 uppercase">
                        {q.required_conditions?.gravity_regime?.replace('_', ' ') ?? 'microgravity'}
                      </span>

                      {/* Per-Question Verification Indicators */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        q.material_matched ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' : 'bg-red-950/40 text-red-300 border-red-800'
                      }`}>
                        Material: {q.material_matched ? 'Matched' : 'Not Matched'}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        q.o2_covered ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        O₂: {q.o2_covered ? 'Reported' : 'Not Reported'}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        q.pressure_covered ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        Pressure: {q.pressure_covered ? 'Reported' : 'Not Reported'}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        q.airflow_covered ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        Airflow: {q.airflow_covered ? 'Reported' : 'Not Reported'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-white">
                      {q.text}
                    </h3>
                  </div>
                  <button className="text-zinc-500 hover:text-white mt-1">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-800/80 space-y-4 text-xs">
                    {/* Verdict Explanation */}
                    <div className="p-3 rounded bg-zinc-950/70 border border-zinc-800/60">
                      <div className="text-zinc-400 font-semibold mb-1">Verdict Determination:</div>
                      <p className="text-zinc-200">{q.reason}</p>
                    </div>

                    {/* Target Condition Envelope */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800/50">
                        <span className="text-zinc-500 block text-[10px]">MATERIAL CLASS</span>
                        <span className="text-zinc-200">{q.required_conditions.material_class}</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800/50">
                        <span className="text-zinc-500 block text-[10px]">CABIN O2 ENVELOPE</span>
                        <span className="text-zinc-200">
                          {q.required_conditions.o2_range.min}% - {q.required_conditions.o2_range.max}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800/50">
                        <span className="text-zinc-500 block text-[10px]">PRESSURE ENVELOPE</span>
                        <span className="text-zinc-200">
                          {q.required_conditions.pressure_range.min} - {q.required_conditions.pressure_range.max} psi
                        </span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800/50">
                        <span className="text-zinc-500 block text-[10px]">AIRFLOW SPEED</span>
                        <span className="text-zinc-200">
                          {q.required_conditions.airflow_range
                            ? `${q.required_conditions.airflow_range.min} - ${q.required_conditions.airflow_range.max} cm/s`
                            : 'Unconstrained'}
                        </span>
                      </div>
                    </div>

                    {/* Material Verification Quote */}
                    {q.material_matched && q.material_quote && (
                      <div className="p-3 rounded bg-zinc-950/70 border border-emerald-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Material Match Provenance ({q.material_quote_source?.file} [{q.material_quote_source?.key_path}]):</span>
                        </div>
                        <blockquote className="italic text-zinc-300 pl-3 border-l-2 border-emerald-500">
                          &quot;{q.material_quote}&quot;
                        </blockquote>
                      </div>
                    )}

                    {/* Verbatim Source Quote */}
                    <div className="p-3 rounded bg-zinc-950/70 border border-zinc-800/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Source: {q.source.citation}</span>
                      </div>
                      <blockquote className="italic text-zinc-300 pl-3 border-l-2 border-blue-500">
                        &quot;{q.source.verbatim_quote}&quot;
                      </blockquote>
                    </div>

                    {/* Evidence Investigations */}
                    {q.evidence && q.evidence.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
                          Supporting Investigation Evidence ({q.evidence.length}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.evidence.map((ev: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] flex items-center justify-between"
                            >
                              <div>
                                <span className="font-mono text-blue-400 font-bold mr-1.5">
                                  {ev.record_id}
                                </span>
                                <span className="text-white font-medium">{ev.acronym}</span>
                                <div className="text-zinc-400 truncate max-w-[280px]">{ev.name}</div>
                              </div>
                              <a
                                href={`https://doi.org/${ev.doi}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                title="Open official NASA DOI"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-500">
          <div>PYRO-ASTRA Space Apps 2026 Challenge · Pre-registered Documentation Protocol</div>
          <div className="flex gap-4">
            <Link href="/path" className="text-blue-400 hover:underline">
              Exploration Transit Path →
            </Link>
            <Link href="/functions" className="text-blue-400 hover:underline">
              Function Matrix →
            </Link>
            <Link href="/proposals" className="text-blue-400 hover:underline">
              Proposed Experiments →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
