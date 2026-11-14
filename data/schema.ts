export type Provenance = {
  source_id: string;            // 'PSI-102'
  doi: string | null;
  file: string | null;          // file name inside /raw/PSI-xx
  row_or_page: string | null;   // row index, sheet, or report page
  entered_by: 'parsed' | 'hand';
  note: string | null;          // e.g. 'converted from kPa, exact'
};

export type Val<T> = { value: T; unit: string | null; provenance: Provenance } | null;

export type Range = { min: number | null; max: number; discrete_values?: number[] };

export type SafetyArea = 'prevention' | 'detection' | 'suppression' | 'other';
export type RecordType = 'test_matrix' | 'condition_range' | 'summary' | 'telemetry' | 'mixed';
export type GravityRegime = 'microgravity' | '1g' | 'electric-field-analog'; // no partial-g value exists
export type DataOrigin = 'flight' | 'ground' | 'simulation';

export interface Investigation {
  id: string;                   // 'PSI-102'
  acronym: string;
  name: string;
  doi: string;                  // required, copied from the PSI page
  license: string | null;
  verified: boolean;
  depth: 'deep' | 'catalog';
  record_type: RecordType;
  safety_areas: SafetyArea[];
  gravity_regimes: GravityRegime[];
  data_origin: DataOrigin[];
  hardware: Val<string>;        // ACME/CIR, MDCA/CIR, MSG flow duct, ...
  objectives: Val<string>;
  fuels: Val<string[]>;
  fuel_phase?: Val<'solid' | 'liquid droplet' | 'gas' | 'smoke'>;
  sample_shape: Val<string>;
  sample_size: Val<string>;
  cabin_o2_pct: Val<Range>;
  burner_flow_o2_pct: Val<Range>;
  pressure_psi: Val<Range>;
  airflow_speed_cm_s: Val<Range>;
  varied_variables: Val<string[]>;
  constant_variables: Val<string[]>;
  sensors: Val<string[]>;
  n_tests: Val<number>;
  not_reported: string[];       // computed by build-data.py
  stratified_o2_pct?: Record<string, { min: number; max: number; n_tests?: number }>;
  table_listed_o2_pct?: Val<Range>;
}

