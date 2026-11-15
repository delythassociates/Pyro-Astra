'use client';

import React, { useState } from 'react';
import readinessData from '../../../data/analysis/readiness.json';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Layers,
} from 'lucide-react';

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

type VerdictFilter = 'All' | 'Documented' | 'Partially documented' | 'Not documented' | 'Not assessable';

export default function ReadinessPage() {
  const [selectedVerdict, setSelectedVerdict] = useState<VerdictFilter>('All');
  const [expandedId, setExpandedId] = useState<string | null>('Q01');

  const { summary } = readinessData as any;
  const questions = (readinessData as any).questions as QuestionItem[];

  const filteredQuestions = questions.filter((q) => {
    if (selectedVerdict === 'All') return true;
    return q.verdict === selectedVerdict;
  });

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Documented':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Documented
          </span>
        );
      case 'Partially documented':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300">
            <AlertTriangle className="w-3.5 h-3.5 text-sky-600" />
            Partially Documented
          </span>
        );
      case 'Not assessable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            Not Assessable
          </span>
        );
      case 'Not documented':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
            <XCircle className="w-3.5 h-3.5 text-amber-600" />
            Not Documented
          </span>
        );
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-800 uppercase tracking-wider font-semibold">
          <ShieldCheck className="w-4 h-4 text-sky-700" />
          <span>Spacecraft Fire Safety Readiness · 20 Benchmark Criteria</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Habitat Safety Readiness & Question Audit Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Pre-registered evaluation of 20 critical habitat-safety combustion questions against authentic NASA PSI flight investigations. Material-matched parameter coverage per PREREGISTERED Rev 5.
        </p>
      </div>

      {/* Summary Score Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-emerald-700 block text-[11px] font-medium mb-1">Documented</span>
          <span className="text-2xl font-bold text-emerald-950">
            {summary.documented_count} / {summary.total_questions}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Full material & parameter match</span>
        </div>

        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
          <span className="text-sky-700 block text-[11px] font-medium mb-1">Partially Documented</span>
          <span className="text-2xl font-bold text-sky-950">
            {summary.partially_documented_count} / {summary.total_questions}
          </span>
          <span className="text-[10px] text-sky-600 block mt-0.5 font-medium">Material match; partial envelope</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-amber-700 block text-[11px] font-medium mb-1">Not Documented</span>
          <span className="text-2xl font-bold text-amber-950">
            {summary.not_documented_count} / {summary.total_questions}
          </span>
          <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">Missing flight testing</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
          <span className="text-slate-600 block text-[11px] font-medium mb-1">Not Assessable</span>
          <span className="text-2xl font-bold text-slate-900">
            {summary.not_assessable_count} / {summary.total_questions}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Unmeasured flight domains</span>
        </div>
      </div>

      {/* 4-State Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Filter by Verdict:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Documented', 'Partially documented', 'Not documented', 'Not assessable'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVerdict(v)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors border ${
                  selectedVerdict === v
                    ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing <strong>{filteredQuestions.length}</strong> of {questions.length} questions
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {q.id}
                    </span>
                    {getVerdictBadge(q.verdict)}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 font-sans">{q.text}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Target: {q.required_conditions.material_class} · {q.required_conditions.gravity_regime}
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs font-mono">
                  {/* Verdict Reason */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 font-sans leading-relaxed">
                    <strong className="text-slate-900 block font-mono text-xs mb-1 uppercase">
                      Audit Reason & Findings:
                    </strong>
                    {q.reason}
                  </div>

                  {/* Conditions Check Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Material Match</span>
                      <strong className={q.material_matched ? 'text-emerald-700' : 'text-slate-500'}>
                        {q.material_matched ? '✓ Matched' : '✗ Not Matched'}
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">O₂ Covered</span>
                      <strong className={q.o2_covered ? 'text-emerald-700' : 'text-slate-500'}>
                        {q.o2_covered ? '✓ Covered' : '✗ Uncovered'}
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Pressure Covered</span>
                      <strong className={q.pressure_covered ? 'text-emerald-700' : 'text-slate-500'}>
                        {q.pressure_covered ? '✓ Covered' : '✗ Uncovered'}
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Airflow Covered</span>
                      <strong className={q.airflow_covered ? 'text-emerald-700' : 'text-slate-500'}>
                        {q.airflow_covered ? '✓ Covered' : '✗ Uncovered'}
                      </strong>
                    </div>
                  </div>

                  {/* Literature Verbatim Quote */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-600 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Literature Grounding Citation:
                    </span>
                    <p className="font-sans italic">"{q.source.verbatim_quote}"</p>
                    <div className="text-[10px] text-slate-400 pt-1 font-mono">
                      Source: {q.source.file} ({q.source.citation})
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
