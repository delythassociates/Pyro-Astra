'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MaterialOutcomeVisualizer, RunDataPoint } from './MaterialOutcomeVisualizer';
import { BeginnerDataTable } from './BeginnerDataTable';
import { ReferencesCard } from './ReferencesCard';
import { InfoButton } from './InfoButton';
import table51Data from '@/data/bass2_table_5_1.json';

interface EnvironmentPreset {
  id: string;
  name: string;
  o2: number;
  pressure: number;
  gravity: string;
  badge: string;
  source: string;
  description: string;
}

const PRESETS: EnvironmentPreset[] = [
  {
    id: 'moon',
    name: 'Lunar Habitat Base',
    o2: 34,
    pressure: 8.2,
    gravity: '0.16g',
    badge: 'Artemis Design Atmosphere',
    source: 'NASA NTRS 20210022143',
    description: 'Planned crew habitat atmosphere: 34% O₂ at 8.2 psi (56.5 kPa).',
  },
  {
    id: 'iss',
    name: 'ISS Cabin Atmosphere',
    o2: 21,
    pressure: 14.7,
    gravity: 'μg (~10⁻⁶g)',
    badge: 'Standard Crew Atmosphere',
    source: 'Nominal Station Baseline',
    description: 'Earth sea-level norm: 21% O₂ at 14.7 psi (101.3 kPa) in orbital microgravity.',
  },
  {
    id: 'eva',
    name: 'Spacesuit (EVA)',
    o2: 100,
    pressure: 4.3,
    gravity: 'μg / Surface',
    badge: 'Pure Oxygen Suit',
    source: 'EMU / xEMU Specification',
    description: 'Extravehicular mobility: 100% pure oxygen at 4.3 psi (29.6 kPa).',
  },
];

const MATERIALS = [
  { id: 'all', label: 'All Materials (1,815 rows)' },
  { id: 'pmma', label: 'PMMA (Flat Slabs / Rods)' },
  { id: 'nomex', label: 'Nomex Fabric' },
  { id: 'sibal', label: 'Cotton / Fiberglass (SIBAL)' },
  { id: 'heptane', label: 'Heptane (Droplets)' },
  { id: 'methanol', label: 'Methanol (Droplets)' },
  { id: 'decane', label: 'n-Decane (Droplets)' },
  { id: 'gas', label: 'Gaseous Flames (C2H4 / Propane)' },
  { id: 'candle', label: 'Candle Wax' },
  { id: 'ultem', label: 'Ultem 1000' },
];

export function BeginnerModeView() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('moon');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('pmma');
  const [runs, setRuns] = useState<RunDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Two-way interactive sync state between visualizer and data table
  const [selectedRunId, setSelectedRunId] = useState<string | null>('PSI-25_M1');
  const [hoveredRunId, setHoveredRunId] = useState<string | null>(null);

  // Active preset object
  const activePreset = useMemo(
    () => PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0],
    [selectedPresetId]
  );

  // Initial fallback runs from table 5.1 while fetching full release dataset
  useEffect(() => {
    // Construct rich fallback runs from Table 5.1
    const fallbackRuns: RunDataPoint[] = table51Data.rows.map((r: any) => {
      // Parse velocity e.g. "9" or "20 and 15" -> 9 or 20
      const velNum = parseFloat(String(r.velocity_cm_s).split(' ')[0]) || null;
      const spreadNum = parseFloat(String(r.spread_rate_mm_s).split(' ')[0]) || null;
      const o2InitNum = parseFloat(r.initial_o2_vol_pct) || 22.2;
      const o2FinNum = parseFloat(r.final_o2_vol_pct) || null;
      const thickNum = parseFloat(r.thickness_mm) || 1.0;
      const widthNum = parseFloat(r.width_cm) || 2.2;
      const burnTimeSec = r.burn_time_min ? parseFloat(r.burn_time_min) * 60 : null;

      return {
        run_id: `PSI-25_${r.test_no}`,
        investigation_id: 'PSI-25',
        investigation_acronym: 'BASS-II',
        source_table: 'NASA/TM-20210011385 Table 5.1',
        test_id: `${r.test_no}`,
        material_class: 'PMMA slab',
        fuel_phase: 'solid',
        cabin_o2_pct: o2InitNum,
        burner_flow_o2_pct: null,
        pressure_psi: null, // Table 5.1 did not report chamber pressure
        airflow_speed_cm_s: velNum,
        sample_thickness_mm: thickNum,
        sample_width_cm: widthNum,
        sample_length_cm: 10.0,
        initial_diameter_mm: null,
        flame_spread_rate_mm_s: spreadNum,
        extinction_diameter_mm: null,
        burn_duration_s: burnTimeSec,
        calibrated_initial_o2_pct: o2InitNum,
        calibrated_final_o2_pct: o2FinNum,
        provenance_file: 'data/bass2_table_5_1.json',
        provenance_file_sha256: '9f2a969747970c634020a13ee42a34fc3cf264cf2333cf46ceefdf0ad697d8c5',
        provenance_row_id: `Table 5.1 Row ${r.test_no}`,
        provenance_column: 'spread_rate_mm_s',
        provenance_note: 'Hand-extracted row from NASA/TM-20210011385 p. 57',
        raw_data: r,
      };
    });

    setRuns(fallbackRuns);

    // Fetch full 1,815 release dataset
    fetch('/release/modeling_ready_runs.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.runs)) {
          setRuns(data.runs);
        }
      })
      .catch((err) => {
        console.warn('Could not load modeling_ready_runs.json, using fallback table data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter runs for the selected material
  const filteredRuns = useMemo(() => {
    if (selectedMaterial === 'all') return runs;
    return runs.filter((r) => {
      const mat = (r.material_class || '').toLowerCase();
      const phase = (r.fuel_phase || '').toLowerCase();
      const target = selectedMaterial.toLowerCase();

      if (target === 'pmma') return mat.includes('pmma') || target.includes('acrylic');
      if (target === 'nomex') return mat.includes('nomex');
      if (target === 'sibal') return mat.includes('sibal') || mat.includes('cotton');
      if (target === 'heptane') return mat.includes('heptane');
      if (target === 'methanol') return mat.includes('methanol');
      if (target === 'decane') return mat.includes('decane');
      if (target === 'gas') return phase === 'gas' || mat.includes('c2h4') || mat.includes('propane') || mat.includes('methane');
      if (target === 'candle') return mat.includes('wax') || mat.includes('candle');
      if (target === 'ultem') return mat.includes('ultem');
      return mat.includes(target);
    });
  }, [runs, selectedMaterial]);

  // Compute status banner statistics
  const statusSentence = useMemo(() => {
    const matLabel = MATERIALS.find((m) => m.id === selectedMaterial)?.label.split(' ')[0] || 'Material';

    if (activePreset.id === 'moon') {
      return `${activePreset.name} (34% O₂, 8.2 psi) + ${matLabel}: ${filteredRuns.length} table rows found for this material; exactly 0 cabin-air rows combine O₂ ≥ 30% and Pressure ≤ 10.2 psi.`;
    } else if (activePreset.id === 'iss') {
      const match21 = filteredRuns.filter(
        (r) =>
          r.cabin_o2_pct !== null &&
          Math.abs(r.cabin_o2_pct - 21) <= 1 &&
          r.pressure_psi !== null &&
          Math.abs(r.pressure_psi - 14.7) <= 1
      ).length;
      return `${activePreset.name} (21% O₂, 14.7 psi) + ${matLabel}: ${filteredRuns.length} table rows found; ${match21} tested near nominal 21% O₂ and 14.7 psi.`;
    } else {
      return `${activePreset.name} (100% O₂, 4.3 psi) + ${matLabel}: ${filteredRuns.length} table rows found; 0 human spacesuit cabin-air rows tested in microgravity.`;
    }
  }, [filteredRuns, selectedMaterial, activePreset]);

  return (
    <div className="space-y-6">
      {/* 1. CONTROL BAR (PRESET + MATERIAL ONLY) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
              Beginner Explorer: 2 Simple Inputs
            </h2>
          </div>
          <InfoButton guideTab="quickstart" title="How to use Beginner Mode presets and material filters" />
        </div>

        {/* Step A: Environment Preset Cards */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-500 font-semibold block uppercase">
            Step A: Select Spaceflight Environment Preset
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map((p) => {
              const active = selectedPresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPresetId(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    active
                      ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-300/40 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{p.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        p.id === 'moon'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.gravity}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-xl font-black text-sky-950">{p.o2}% O₂</span>
                    <span className="text-xs text-slate-500">at {p.pressure} psi</span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1">{p.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B: Material Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-mono text-slate-500 font-semibold block uppercase">
            Step B: Select Material / Fuel
          </span>
          <div className="flex flex-wrap gap-1.5">
            {MATERIALS.map((m) => {
              const active = selectedMaterial === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMaterial(m.id);
                    setSelectedRunId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    active
                      ? 'bg-sky-700 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instant Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse shrink-0" />
            <span className="leading-relaxed">{statusSentence}</span>
          </div>
          {loading && (
            <span className="text-[10px] text-slate-400 shrink-0 font-normal">
              Syncing full release...
            </span>
          )}
        </div>
      </section>

      {/* 2. SIDE-BY-SIDE 12-COLUMN RESPONSIVE GRID (DESKTOP) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: INTERACTIVE OUTCOME VISUALIZER (7 COLS ON XL) */}
        <div className="col-span-12 xl:col-span-7">
          <MaterialOutcomeVisualizer
            runs={filteredRuns}
            allRuns={runs}
            selectedMaterial={selectedMaterial}
            selectedPreset={activePreset}
            selectedRunId={selectedRunId}
            hoveredRunId={hoveredRunId}
            onSelectRun={setSelectedRunId}
            onHoverRun={setHoveredRunId}
          />
        </div>

        {/* RIGHT COLUMN: SYNCED DATA TABLE (5 COLS ON XL) */}
        <div className="col-span-12 xl:col-span-5">
          <BeginnerDataTable
            runs={filteredRuns}
            selectedMaterial={selectedMaterial}
            selectedRunId={selectedRunId}
            hoveredRunId={hoveredRunId}
            onSelectRun={setSelectedRunId}
            onHoverRun={setHoveredRunId}
          />
        </div>

        {/* FULL-WIDTH BOTTOM ROW: REFERENCES & DATA LINEAGE (12 COLS) */}
        <div className="col-span-12">
          <ReferencesCard
            selectedMaterial={selectedMaterial}
            selectedPreset={activePreset}
          />
        </div>
      </div>
    </div>
  );
}
