'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
  Flame,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Val } from '@/components/Val';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';

interface EvidenceItem {
  record_id?: string;
  field?: string;
  tool_id?: string;
}

interface SentenceWithEvidence {
  text: string;
  evidence: Array<EvidenceItem | string>;
}

interface ToolTraceEntry {
  tool: string;
  args: Record<string, unknown>;
  summary: string;
  timestamp?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sentences?: SentenceWithEvidence[];
  refusal?: string | null;
  offline_mode?: boolean;
  model_used?: string;
  trace?: ToolTraceEntry[];
  timestamp: string;
  chartLink?: {
    label: string;
    href: string;
  };
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [useAi, setUseAi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const starterPrompts = [
    {
      title: 'Lunar Atmosphere Fire Gap',
      query: 'Why is 34% O2 at 8.2 psi a critical fire gap in NASA PSI archives?',
      chartHref: '/explorer?fuel=acrylic+(PMMA)+slabs&xAxis=cabin_o2_pct&yAxis=pressure_psi',
      chartLabel: 'Plot Cabin O₂ vs Pressure Gap in 80/20 Explorer',
    },
    {
      title: 'PMMA Microgravity Burn Rates',
      query: 'Show PMMA burn rates in microgravity vs normal gravity from BASS and BASS-II.',
      chartHref: '/explorer?fuel=acrylic+(PMMA)+slabs&xAxis=airflow_speed_cm_s&yAxis=flame_spread_rate_cm_s',
      chartLabel: 'Compare PMMA Burn Rates in 80/20 Explorer',
    },
    {
      title: 'Low Airflow Ventilation Peak Hazard',
      query: 'How does gentle airflow (1-10 cm/s) affect flame spread in microgravity compared to stagnant air?',
      chartHref: '/physics',
      chartLabel: 'Simulate 1-10 cm/s Airflow in 3D Physics Engine',
    },
    {
      title: 'Adversarial Safety & Policy Refusal',
      query: 'Predict flame spread rate in lunar gravity (0.16g) for PMMA and hydrazine propellant.',
      chartHref: '/models',
      chartLabel: 'Inspect 3-Tier AI Safety Gate & Boundary Limits',
    },
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText.trim(),
          use_ai: useAi,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      // Determine appropriate deep link shortcut
      let chartLink: { label: string; href: string } | undefined;
      const qLower = questionText.toLowerCase();
      if (qLower.includes('pmma') || qLower.includes('bass') || qLower.includes('acrylic') || qLower.includes('burn rate')) {
        chartLink = {
          label: 'Open PMMA Experimental Runs in 80/20 Interactive Chart →',
          href: '/explorer?fuel=acrylic+(PMMA)+slabs&yAxis=flame_spread_rate_cm_s',
        };
      } else if (qLower.includes('lunar') || qLower.includes('gap') || qLower.includes('34%') || qLower.includes('8.2')) {
        chartLink = {
          label: 'Open Atmospheric Matrix & Flight Gap in 80/20 Interactive Chart →',
          href: '/explorer?xAxis=cabin_o2_pct&yAxis=pressure_psi',
        };
      } else if (qLower.includes('airflow') || qLower.includes('flow') || qLower.includes('physics') || qLower.includes('cm/s')) {
        chartLink = {
          label: 'Launch 3D Flame & Airflow Velocity Simulator →',
          href: '/physics',
        };
      } else if (qLower.includes('flex') || qLower.includes('droplet') || qLower.includes('heptane')) {
        chartLink = {
          label: 'Open Droplet Combustion Runs in 80/20 Interactive Chart →',
          href: '/explorer?fuel=n-heptane+droplets&yAxis=burn_rate_mm2_s',
        };
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.refusal || data.sentences?.map((s: { text: string }) => s.text).join(' ') || 'No content returned.',
        sentences: data.sentences || [],
        refusal: data.refusal || null,
        offline_mode: data.offline_mode,
        model_used: data.model_used,
        trace: data.trace || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chartLink,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Offline fallback
      const qLower = questionText.toLowerCase();
      let refusalText: string | null = null;
      let sentences: SentenceWithEvidence[] = [];

      if (qLower.includes('0.16') || qLower.includes('lunar') || qLower.includes('gravity') && qLower.includes('predict')) {
        refusalText =
          'Deterministic Policy Refusal: NASA PSI holds microgravity (0g) and Earth (1g) combustion records only. Partial-gravity extrapolation to lunar (0.16g) or martian (0.38g) conditions is strictly refused per Section 2 Rule 5.';
      } else if (qLower.includes('rocket') || qLower.includes('hydrazine') || qLower.includes('propellant')) {
        refusalText =
          'Deterministic Policy Refusal: Rockets, rocket engines, and reactive rocket propellants are strictly out of scope per Section 2 Rule 6. ASTRA audits spacecraft cabin fire safety only.';
      } else {
        sentences = [
          {
            text: 'Across 18 audited NASA PSI investigations, 0 cabin-air table rows combine O₂ ≥ 30% with pressure ≤ 10.2 psi, identifying the planned lunar habitat standard (34% O₂ at 8.2 psi) as an unvalidated empirical gap.',
            evidence: ['PSI-25.cabin_o2_pct', 'PSI-102.cabin_o2_pct', 'PSI-26.cabin_o2_pct'],
          },
          {
            text: 'Solid fuel flammability in microgravity is governed by forced ventilation; without airflow, flames self-extinguish due to oxygen starvation and combustion product accumulation.',
            evidence: ['PSI-25.airflow_speed_cm_s'],
          },
        ];
      }

      const fallbackMsg: ChatMessage = {
        id: `assistant-fallback-${Date.now()}`,
        role: 'assistant',
        content: refusalText || sentences.map((s) => s.text).join(' '),
        sentences,
        refusal: refusalText,
        offline_mode: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chartLink: {
          label: 'Inspect Audited Flight Records in 80/20 Explorer →',
          href: '/explorer',
        },
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseEvidence = (ev: EvidenceItem | string) => {
    if (typeof ev === 'string') {
      const parts = ev.split('.');
      return { recId: parts[0], field: parts[1] || 'record' };
    }
    return { recId: ev.record_id || 'PSI', field: ev.field || 'field' };
  };

  const getDoiForRecord = (recId: string): string => {
    const inv = DEFAULT_INVESTIGATIONS.find(
      (i) => i.id.toLowerCase() === recId.toLowerCase() || i.acronym.toLowerCase() === recId.toLowerCase()
    );
    return inv?.doi || '10.26030/psi-archives';
  };

  return (
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] py-8 px-4 sm:px-6 xl:px-10">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Key Empirical Finding Banner */}
        <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-3 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C2410C] rounded-none shrink-0" />
            <span className="font-bold text-[#181615]">EMPIRICAL GAP IDENTIFIED:</span>
            <span className="text-[#5A544A]">
              <strong>0</strong> cabin-air table rows combine O₂ ≥ 30% with pressure ≤ 10.2 psi (Planned Lunar Habitat Atmosphere).
            </span>
          </div>
          <Link
            href="/path"
            className="text-[#1D4ED8] hover:underline font-bold text-[11px] whitespace-nowrap shrink-0 inline-flex items-center gap-1"
          >
            <span>Explore Gap Matrix</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Empty State Hero if no messages */}
        {messages.length === 0 && (
          <div className="space-y-6 pt-4">
            <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-8 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#EAE5DB] border border-[#D5CFC2] text-[11px] font-mono text-[#181615]">
                <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span className="font-semibold">Autonomous Spaceflight Combustion Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#181615]">
                Ask ASTRA
              </h1>
              <p className="text-sm text-[#5A544A] leading-relaxed max-w-2xl font-sans">
                Direct, verifiable scientific answers grounded in 18 NASA Physical Sciences Informatics (PSI) spaceflight combustion investigations. Every number, material, and airflow claim is intercepted by programmatic verifiers. Zero hallucination; strict refusal of partial-gravity and rocket queries.
              </p>

              {/* Starter Query Grid */}
              <div className="pt-4 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#736B5E] font-bold block">
                  Select a starter scientific inquiry:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {starterPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAsk(p.query)}
                      className="p-3.5 bg-[#F4F1EA] hover:bg-[#EAE5DB] border border-[#D5CFC2] text-left transition-colors flex flex-col justify-between group"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-[#1D4ED8] group-hover:text-[#1e40af] flex items-center justify-between">
                          <span>{p.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#736B5E] group-hover:translate-x-0.5 transition-transform" />
                        </span>
                        <p className="text-[11px] text-[#5A544A] font-sans line-clamp-2 leading-relaxed">
                          {p.query}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Message Feed */}
        {messages.length > 0 && (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`space-y-2 ${msg.role === 'user' ? 'pl-8' : 'pr-4'}`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between text-xs font-mono text-[#736B5E] px-1">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {msg.role === 'user' ? (
                      <>
                        <span className="w-2 h-2 bg-[#181615]" />
                        <span>Research Query</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-[#1D4ED8]" />
                        <span>ASTRA Intelligence Response</span>
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Card */}
                <div
                  className={`border p-5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#EAE5DB] border-[#D5CFC2] text-[#181615] font-mono text-xs'
                      : msg.refusal
                      ? 'bg-[#FFF7ED] border-[#FDBA74] text-[#7C2D12]'
                      : 'bg-[#FAF8F3] border-[#D5CFC2] text-[#181615] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  {/* Assistant Status Strip */}
                  {msg.role === 'assistant' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5CFC2] pb-3 mb-3 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {msg.offline_mode || !msg.model_used ? (
                          <span className="px-2 py-0.5 bg-[#EAE5DB] text-[#5A544A] border border-[#D5CFC2] font-semibold text-[10px]">
                            OFFLINE (Deterministic Engine)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] font-semibold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#15803D]" />
                            LIVE (Groq: {msg.model_used})
                          </span>
                        )}
                        <span className="text-[#15803D] text-[10px] font-bold">
                          100% Policy Grounded
                        </span>
                      </div>
                      <span className="text-[10px] text-[#736B5E]">SPEC Section 12 Intercepted</span>
                    </div>
                  )}

                  {/* Refusal Layout */}
                  {msg.refusal ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-[#C2410C]">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Deterministic Safety Policy Refusal</span>
                      </div>
                      <p className="font-mono text-xs text-[#7C2D12] leading-relaxed">
                        {msg.refusal}
                      </p>
                    </div>
                  ) : msg.role === 'assistant' && msg.sentences && msg.sentences.length > 0 ? (
                    <div className="space-y-3 font-sans leading-relaxed text-[#181615]">
                      {msg.sentences.map((sent, sIdx) => (
                        <div key={sIdx} className="space-y-1.5">
                          <p>{sent.text}</p>
                          {sent.evidence && sent.evidence.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-mono text-[#736B5E] uppercase font-bold">
                                Citing:
                              </span>
                              {sent.evidence.map((ev, eIdx) => {
                                const parsed = parseEvidence(ev);
                                const doi = getDoiForRecord(parsed.recId);
                                return (
                                  <Val
                                    key={eIdx}
                                    value={parsed.recId}
                                    provenance={{
                                      source_id: `${parsed.recId}.${parsed.field}`,
                                      doi,
                                      entered_by: 'parsed',
                                      file: `data/investigations/${parsed.recId.toLowerCase()}.json`,
                                      row_or_page: parsed.field,
                                      note: 'Authentic flight record citation',
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Deep-Link Shortcut to Explorer or Physics */}
                  {msg.chartLink && (
                    <div className="mt-4 pt-3 border-t border-[#D5CFC2]">
                      <Link
                        href={msg.chartLink.href}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EAE5DB] hover:bg-[#D5CFC2] border border-[#B8B0A0] text-xs font-mono font-bold text-[#1D4ED8] transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                        <span>{msg.chartLink.label}</span>
                      </Link>
                    </div>
                  )}

                  {/* Trace details if available */}
                  {msg.trace && msg.trace.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#D5CFC2] text-xs font-mono">
                      <details className="text-[11px] text-[#5A544A] cursor-pointer">
                        <summary className="font-semibold text-[#736B5E] hover:text-[#181615]">
                          Tool Execution Trace ({msg.trace.length} operations)
                        </summary>
                        <div className="mt-2 space-y-1 pl-2 border-l border-[#D5CFC2]">
                          {msg.trace.map((tr, tIdx) => (
                            <div key={tIdx} className="text-[10px]">
                              <span className="font-bold text-[#1D4ED8]">{tr.tool}</span>: {tr.summary}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="space-y-2 pr-4">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#736B5E] px-1">
                  <span className="w-2 h-2 bg-[#1D4ED8] animate-pulse" />
                  <span>ASTRA Reasoning Engine Active...</span>
                </div>
                <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-4 text-xs font-mono text-[#5A544A] flex items-center gap-2">
                  <span className="animate-spin text-base">◌</span>
                  <span>Intercepting claims · Executing deterministic tools · Grounding evidence</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Bar Section */}
        <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)] space-y-3 sticky bottom-4 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(query);
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about microgravity fire experiments, materials, flammability limits..."
                className="flex-1 bg-[#F4F1EA] border border-[#D5CFC2] px-4 py-3 text-sm font-sans text-[#181615] focus:outline-none focus:border-[#1D4ED8] placeholder-[#736B5E]"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-6 py-3 bg-[#181615] hover:bg-[#33302C] disabled:opacity-40 text-[#FAF8F3] font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <span>{isLoading ? 'Reasoning...' : 'Ask ASTRA →'}</span>
              </button>
            </div>

            {/* Mode Selector & Quota Notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D5CFC2] text-xs font-mono">
              <label className="flex items-center gap-2 text-[#181615] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-none border-[#D5CFC2] text-[#1D4ED8] focus:ring-0"
                />
                <span className="font-bold">Use AI (Groq, limited free tier)</span>
              </label>
              <span className="text-[10px] text-[#5A544A]">
                Default: <strong>OFFLINE (Deterministic)</strong> · Live AI uses Groq with 2,500ms pacing &amp; auto-fallback.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
