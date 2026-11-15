'use client';

import React, { useState } from 'react';
import surprisesData from '@/../data/surprises.json';
import { Lightbulb, Info, AlertTriangle, BookOpen } from 'lucide-react';

export default function SurprisesPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const topics = Array.from(new Set(surprisesData.map((s) => s.topic)));

  const filteredSurprises =
    selectedTopic === 'all'
      ? surprisesData
      : surprisesData.filter((s) => s.topic === selectedTopic);

  return (
    <div className="flex-1 w-full bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 xl:px-10 space-y-8 max-w-[1840px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-800 uppercase tracking-wider font-semibold">
          <Lightbulb className="w-4 h-4 text-sky-700" />
          <span>Microgravity Combustion Counter-Intuitions & Anomalies</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Empirical Counter-Intuitions in Spaceflight Combustion
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Documented phenomena from NASA Physical Sciences Informatics and microgravity combustion flight literature that challenge common 1g terrestrial intuitions. Each finding pairs verbatim citations with explicit negative-boundary disclaimers.
        </p>
      </div>

      {/* Topic Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Filter by Topic:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedTopic('all')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors border ${
                selectedTopic === 'all'
                  ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Findings ({surprisesData.length})
            </button>
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors border ${
                  selectedTopic === t
                    ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {filteredSurprises.map((item, idx) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
          >
            {/* Card Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center font-mono text-xs font-bold text-sky-800">
                    #{idx + 1}
                  </span>
                  <h2 className="text-base font-bold font-mono text-slate-900">
                    {item.title}
                  </h2>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                  {item.topic}
                </span>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="text-slate-700 font-semibold block">{item.source_name}</span>
                <span className="text-slate-400 text-[11px]">Date: {item.date}</span>
              </div>
            </div>

            {/* Claim in Our Words */}
            <div className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed">
              {item.claim_in_our_words}
            </div>

            {/* Verbatim Literature Quote */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verbatim Literature Quote (Rule 10 Verified):
              </span>
              <p className="font-sans italic text-slate-700">&ldquo;{item.verbatim_quote}&rdquo;</p>
              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Source: {item.source_file}
              </div>
            </div>

            {/* Boundaries & Implications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pt-1">
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-950 space-y-1">
                <strong className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                  What This Does NOT Show:
                </strong>
                <p className="leading-relaxed">{item.what_this_does_not_show}</p>
              </div>

              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-lg text-sky-950 space-y-1">
                <strong className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                  Open Research Questions:
                </strong>
                <p className="leading-relaxed">{item.implication_as_question}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
