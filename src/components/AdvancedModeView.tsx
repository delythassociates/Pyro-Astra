'use client';

import React, { useState, useEffect } from 'react';
import { AdvancedParameterWorkbench } from './AdvancedParameterWorkbench';
import { IntuitiveFlowRegimeBar } from './IntuitiveFlowRegimeBar';
import { CustomizableXYChart, RunDataPoint } from './CustomizableXYChart';
import { Bass2SpreadRateChart } from './Bass2SpreadRateChart';
import { DualSourceComparisonChart } from './DualSourceComparisonChart';
import { SurrogateDomainWidget } from './SurrogateDomainWidget';
import { InfoButton } from './InfoButton';
import table51Data from '../../data/bass2_table_5_1.json';

export function AdvancedModeView() {
  // Workbench state
  const [o2, setO2] = useState<number>(34.0);
  const [pressure, setPressure] = useState<number>(8.2);
  const [gravity, setGravity] = useState<'0g' | '0.16g' | '0.38g'>('0g');
  const [airflow, setAirflow] = useState<number>(9.0);
  const [direction, setDirection] = useState<'opposed' | 'concurrent' | 'quiescent'>('opposed');
  const [includeBurner, setIncludeBurner] = useState<boolean>(false);
  const [o2Timing, setO2Timing] = useState<'initial' | 'final'>('initial');
  const [includeDialUnits, setIncludeDialUnits] = useState<boolean>(false);

  // Tabbed container state for Panel 3
  const [activeTab, setActiveTab] = useState<'xy' | 'bass2' | 'dualsource' | 'surrogate'>('xy');

  // Runs data state
  const [runs, setRuns] = useState<RunDataPoint[]>([]);

  useEffect(() => {
    // Initial fallback
    const fallbackRuns: RunDataPoint[] = table51Data.rows.map((r: any) => ({
      run_id: `BASS-II_M${r.test_no}`,
      investigation_id: 'PSI-25',
      investigation_acronym: 'BASS-II',
      source_table: 'NASA/TM-20210011385 Table 5.1',
      test_id: `M${r.test_no}`,
      material_class: 'PMMA slab',
      fuel_phase: 'solid',
      cabin_o2_pct: r.initial_o2_vol_pct,
      burner_flow_o2_pct: null,
      pressure_psi: null,
      airflow_speed_cm_s: r.velocity_cm_s,
      sample_thickness_mm: r.thickness_mm,
      initial_diameter_mm: null,
      flame_spread_rate_mm_s: r.spread_rate_mm_s,
      extinction_diameter_mm: null,
      provenance_file: 'data/bass2_table_5_1.json',
      provenance_file_sha256: '9f2a969747970c634020a13ee42a34fc3cf264cf2333cf46ceefdf0ad697d8c5',
      provenance_row_id: `Table 5.1 Row ${r.test_no}`,
      provenance_column: 'spread_rate_mm_s',
      provenance_note: 'Hand-extracted row from NASA/TM-20210011385 p. 57',
    }));

    setRuns(fallbackRuns);

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
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* PANEL 1: FULL PARAMETER WORKBENCH & CLOSENESS SPECIFICATION */}
      <AdvancedParameterWorkbench
        runs={runs}
        o2={o2}
        setO2={setO2}
        pressure={pressure}
        setPressure={setPressure}
        gravity={gravity}
        setGravity={setGravity}
        airflow={airflow}
        setAirflow={setAirflow}
        direction={direction}
        setDirection={setDirection}
        includeBurner={includeBurner}
        setIncludeBurner={setIncludeBurner}
        o2Timing={o2Timing}
        setO2Timing={setO2Timing}
        includeDialUnits={includeDialUnits}
        setIncludeDialUnits={setIncludeDialUnits}
      />

      {/* PANEL 2: INTUITIVE VISUAL FLOW REGIME INDICATOR */}
      <IntuitiveFlowRegimeBar
        airflowSpeed={airflow}
        flowDirection={direction}
        gravityRegime={gravity}
      />

      {/* PANEL 3: ADVANCED COMPARISON GRAPHS & SURROGATE DOMAIN GATE (TABBED - ONLY 1 VISIBLE) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
              Advanced Analytical Views & Surrogate Gates
            </span>
            <InfoButton guideTab="surrogate-models" title="Learn about regression models, LOCO-CV, and domain gates" />
          </div>

          {/* 4 Clean Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setActiveTab('xy')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'xy'
                  ? 'bg-white text-sky-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom X-Y Coverage
            </button>
            <button
              onClick={() => setActiveTab('bass2')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'bass2'
                  ? 'bg-white text-sky-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BASS-II Flame Spread Rate
            </button>
            <button
              onClick={() => setActiveTab('dualsource')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dualsource'
                  ? 'bg-white text-sky-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dual-Source Discrepancies
            </button>
            <button
              onClick={() => setActiveTab('surrogate')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'surrogate'
                  ? 'bg-white text-sky-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Surrogate Model & 3-Tier Gate
            </button>
          </div>
        </div>

        {/* Tab 1: Custom X-Y with Target Marker */}
        {activeTab === 'xy' && (
          <CustomizableXYChart
            runs={runs}
            selectedMaterial="all"
            selectedPreset={{
              id: 'custom',
              name: 'Workbench Target',
              o2,
              pressure,
              gravity,
            }}
          />
        )}

        {/* Tab 2: BASS-II Spread Rate Chart */}
        {activeTab === 'bass2' && <Bass2SpreadRateChart />}

        {/* Tab 3: Dual-Source Discrepancy Chart */}
        {activeTab === 'dualsource' && <DualSourceComparisonChart />}

        {/* Tab 4: Surrogate Model & 3-Tier Domain Gate */}
        {activeTab === 'surrogate' && <SurrogateDomainWidget />}
      </section>
    </div>
  );
}
