'use client';

import React, { useState } from 'react';
import surprisesData from '@/../data/surprises.json';

export default function SurprisesPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const topics = Array.from(new Set(surprisesData.map((s) => s.topic)));

  const filteredSurprises =
    selectedTopic === 'all'
      ? surprisesData
      : surprisesData.filter((s) => s.topic === selectedTopic);

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-cyan-900/40 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              Workstream M · Opened Literature Findings
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              defined by the PYRO-ASTRA team
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Verbatim NASA Source Citations & Invariant Disclaimers
            </span>
          </div>

          <h1 className="text-3xl font-black font-mono text-white">
            Empirical Counter-Intuitions in Spaceflight Combustion
          </h1>
          <p className="text-sm text-zinc-300 font-sans max-w-4xl leading-relaxed">
            Four documented phenomena from NASA Physical Sciences Informatics and spaceflight combustion literature that challenge common terrestrial intuition. Each finding includes verbatim citations, explicit boundaries on what the evidence does not demonstrate, and research implications framed strictly as open empirical questions.
          </p>
        </div>

        {/* Topic Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 mr-2">Filter by Topic:</span>
          <button
            type="button"
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selectedTopic === 'all'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'bg-slate-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Findings ({surprisesData.length})
          </button>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedTopic === t
                  ? 'bg-cyan-600 text-white font-bold shadow'
                : 'bg-slate-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="space-y-6">
          {filteredSurprises.map((item, idx) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900/40 border border-zinc-800 hover:border-cyan-800/50 transition-all space-y-4 backdrop-blur-sm"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                      #{idx + 1}
                    </span>
                    <h2 className="text-lg font-bold font-mono text-white">
                      {item.title}
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-300">
                    {item.topic}
                  </span>
                </div>

                <div className="text-right text-xs font-mono">
                  <span className="text-zinc-400 block">{item.source_name}</span>
                  <span className="text-zinc-500 text-[11px]">Date: {item.date}</span>
                </div>
              </div>

              {/* Claim in Our Words */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block font-bold">
                  Documented Phenomenon:
                </span>
                <p className="text-xs font-sans text-zinc-200 leading-relaxed">
                  {item.claim_in_our_words}
                </p>
              </div>

              {/* Verbatim Quote Box */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-900/50 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase">
                  <span className="font-bold text-cyan-400">Verbatim Quote:</span>
                  <span className="text-zinc-500 truncate max-w-xs">{item.source_file}</span>
                </div>
                <blockquote className="text-amber-200/90 italic font-sans text-xs leading-relaxed border-l-2 border-amber-500 pl-3">
                  "{item.verbatim_quote}"
                </blockquote>
              </div>

              {/* Two Column Section: What This Does Not Show & Implication as Question */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* What This Does Not Show */}
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 space-y-1">
                  <span className="font-mono font-bold text-red-300 text-[11px] uppercase tracking-wider block">
                    What This Does Not Show:
                  </span>
                  <p className="text-zinc-300 leading-relaxed">
                    {item.what_this_does_not_show}
                  </p>
                </div>

                {/* Implication Phrased as a Question (Mandatory Rule) */}
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-700/40 space-y-1">
                  <span className="font-mono font-bold text-indigo-300 text-[11px] uppercase tracking-wider block">
                    Engineering Implication (Question):
                  </span>
                  <p className="text-indigo-200 leading-relaxed font-semibold italic">
                    "{item.implication_as_question}"
                  </p>
                </div>
              </div>

              {/* Source Link & Checksum */}
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-2 text-[11px] font-mono">
                <div className="space-x-3 text-zinc-500">
                  <span>File: <span className="text-zinc-400">{item.source_file}</span></span>
                  {item.sha256 && (
                    <span className="text-zinc-500">
                      SHA256: <code className="text-zinc-400 font-mono">{item.sha256.slice(0, 12)}...</code>
                    </span>
                  )}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  View Primary Source Record ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
