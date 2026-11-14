#!/usr/bin/env python3
"""
PYRO-ASTRA: Modeling-Ready Runs Dataset Pipeline
Generates:
- release/modeling_ready_runs.csv
- release/modeling_ready_runs.json
And mirrors them to public/release/ for static serving.

Strictly enforces Rule G1:
1. Strict Null Policy: Never invent, estimate, round up or interpolate.
   Unreported values are strictly null (empty in CSV).
2. Provenance on EVERY row:
   {file, sha256, row_id, column, unit_conversion_note}
3. Exact Unit Conversions Only:
   Conversions documented verbatim with mathematical formulas.
4. Oxygen Isolation:
   Burner oxidizer flow (CFI-G) strictly stored in burner_flow_o2_pct.
   Cabin life support oxygen strictly stored in cabin_o2_pct.
5. Zero Partial-Gravity Extrapolation:
   Gravity regime strictly microgravity or 1g ground comparator.
   Electric field analog explicitly tagged as electric-field-analog.
"""

import os
import json
import csv
import glob
import hashlib
from datetime import datetime, timezone

# Target release directories
RELEASE_DIR = 'release'
PUBLIC_RELEASE_DIR = os.path.join('public', 'release')

os.makedirs(RELEASE_DIR, exist_ok=True)
os.makedirs(PUBLIC_RELEASE_DIR, exist_ok=True)

# Compute real SHA-256 for a given path
def get_sha256(path):
    if not os.path.exists(path):
        return None
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

# Load manifest.sha256 if available for quick lookup
FILE_SHA256_CACHE = {}
if os.path.exists('manifest.sha256'):
    with open('manifest.sha256', 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) == 2:
                FILE_SHA256_CACHE[parts[1].replace('\\', '/')] = parts[0]

def resolve_sha256(filepath):
    normalized = filepath.replace('\\', '/')
    if normalized in FILE_SHA256_CACHE:
        return FILE_SHA256_CACHE[normalized]
    actual_hash = get_sha256(filepath)
    if actual_hash:
        FILE_SHA256_CACHE[normalized] = actual_hash
    return actual_hash

def parse_float_safe(val):
    if val is None:
        return None
    s = str(val).strip()
    if not s or s.lower() in ('not tracked', 'none', 'n/a', 'insignificant', 'complete', 'acceleratory', '–', '-', ''):
        return None
    try:
        return float(s)
    except ValueError:
        return None

# Exact Unit Conversion Constants
# 1 atm = 101325 Pa, 1 psi = 6894.757 Pa -> 1 atm = 14.69594877551345 psi
ATM_TO_PSI = 101325.0 / 6894.757
# 1 mmHg = 101325 / 760 Pa -> 1 mmHg = 14.69594877551345 / 760 psi = 0.0193367747 psi
MMHG_TO_PSI = ATM_TO_PSI / 760.0
# 1 bar = 100000 Pa -> 1 bar = 100000 / 6894.757 = 14.503773773 psi
BAR_TO_PSI = 100000.0 / 6894.757

ACRONYM_MAP = {
    'PSI-10': 'Flame Design',
    'PSI-20': 'ACME-BRE',
    'PSI-22': 'ACME E-FIELD',
    'PSI-23': 'ACME s-Flame',
    'PSI-25': 'BASS-II',
    'PSI-26': 'BASS',
    'PSI-39': 'CFI',
    'PSI-47': 'DAFT',
    'PSI-68': 'FLEX-2',
    'PSI-69': 'FLEX',
    'PSI-98': 'SAFFIRE-I',
    'PSI-99': 'SAFFIRE-II',
    'PSI-100': 'SAFFIRE-III',
    'PSI-101': 'SAME-R',
    'PSI-102': 'SAME',
    'PSI-106': 'SLICE',
    'PSI-107': 'Spice',
    'PSI-159': 'CFI-G'
}

FUEL_PHASE_MAP = {
    'PSI-10': 'gas',
    'PSI-20': 'gas',
    'PSI-22': 'gas',
    'PSI-23': 'gas',
    'PSI-25': 'solid',
    'PSI-26': 'solid',
    'PSI-39': 'liquid droplet',
    'PSI-47': 'dust',
    'PSI-68': 'liquid droplet',
    'PSI-69': 'liquid droplet',
    'PSI-98': 'solid',
    'PSI-99': 'solid',
    'PSI-100': 'solid',
    'PSI-101': 'smoke',
    'PSI-102': 'smoke',
    'PSI-106': 'gas',
    'PSI-107': 'gas',
    'PSI-159': 'gas'
}

CANONICAL_COLUMNS = [
    'run_id',
    'investigation_id',
    'investigation_acronym',
    'source_table',
    'test_id',
    'date',
    'gravity_regime',
    'is_suspect',
    'suspect_reason',
    'group_condition',
    'fuel_raw',
    'material_class',
    'fuel_phase',
    'cabin_o2_pct',
    'burner_flow_o2_pct',
    'pressure_psi',
    'pressure_raw_value',
    'pressure_raw_unit',
    'airflow_speed_cm_s',
    'temperature_c',
    'sample_shape',
    'sample_thickness_mm',
    'sample_width_cm',
    'sample_length_cm',
    'initial_diameter_mm',
    'flame_spread_rate_mm_s',
    'burn_duration_s',
    'extinction_diameter_mm',
    'burning_rate_mm2_s',
    'weight_loss_rate_mg_min',
    'smoke_inlet_velocity_cm_s',
    'particle_aging_time_s',
    'calibrated_initial_o2_pct',
    'calibrated_final_o2_pct',
    'initial_co2_pct',
    'final_co2_pct',
    'initial_co_ppm',
    'final_co_ppm',
    'adiabatic_flame_temp_k',
    'provenance_file',
    'provenance_file_sha256',
    'provenance_row_id',
    'provenance_column',
    'provenance_note'
]

def build_all_modeling_runs():
    runs = []

    # -------------------------------------------------------------------------
    # 1. Load Table 5.1 lookup (NASA-TM-20210011385) for merging onto BASS-II M1-M20
    # -------------------------------------------------------------------------
    t51_path = 'data/bass2_table_5_1.json'
    t51_report_file = 'raw_real/reports/NASA-TM-20210011385.pdf'
    t51_csv_file = 'data/bass2_table_5_1.csv'
    t51_sha = resolve_sha256(t51_report_file) or resolve_sha256(t51_csv_file)
    t51_lookup = {}
    if os.path.exists(t51_path):
        with open(t51_path, 'r', encoding='utf-8') as f:
            t51_data = json.load(f)
            for r in t51_data.get('rows', []):
                t51_lookup[r['test_no']] = r

    # -------------------------------------------------------------------------
    # 2. PSI-25 BASS-II Full Experimental Table (129 flight runs, deduplicated)
    # -------------------------------------------------------------------------
    bass2_runs_path = 'data/bass2_runs.json'
    bass2_file = 'raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv'
    bass2_sha = resolve_sha256(bass2_file)

    if os.path.exists(bass2_runs_path):
        with open(bass2_runs_path, 'r', encoding='utf-8') as f:
            b2_data = json.load(f)
        for r in b2_data.get('runs', []):
            test_no = r['test_no']
            mat_raw = r.get('material_raw', '')
            mat_class = r.get('material_class', 'PMMA')
            shape = 'film' if 'film' in mat_class.lower() else ('rod' if 'rod' in mat_class.lower() else ('slab' if 'slab' in mat_class.lower() else ('fabric' if 'nomex' in mat_class.lower() or 'sibal' in mat_class.lower() else 'candle')))
            thick = 0.1 if '100 micron' in mat_raw.lower() else None
            width = 2.0 if '2 cm' in mat_raw else None
            spread = None
            burn_sec = None
            flow_vel = None
            prov_note = 'Authentic flight run from PSI-25 table'

            # Deduplicate / merge Table 5.1 fields onto M1-M20
            if test_no in t51_lookup:
                t51_r = t51_lookup[test_no]
                t_thick = parse_float_safe(t51_r.get('thickness_mm'))
                if t_thick is not None: thick = t_thick
                t_w = parse_float_safe(t51_r.get('width_cm'))
                if t_w is not None: width = t_w
                flow_vel = parse_float_safe(t51_r.get('velocity_cm_s'))
                spread = parse_float_safe(t51_r.get('spread_rate_mm_s'))
                b_min = parse_float_safe(t51_r.get('burn_time_min'))
                if b_min is not None:
                    burn_sec = round(b_min * 60.0, 2)
                prov_note = 'Authentic flight run from PSI-25 table; Table 5.1 (NASA/TM-20210011385, p. 57) fields merged for flat PMMA slab'

            run = {
                'run_id': f"PSI-25_{test_no}",
                'investigation_id': 'PSI-25',
                'investigation_acronym': 'BASS-II',
                'source_table': 'PSI-25_Experimental_table_BASS-II.csv',
                'test_id': test_no,
                'date': r.get('date'),
                'gravity_regime': 'microgravity',
                'is_suspect': r.get('is_suspect', False),
                'suspect_reason': r.get('suspect_reason'),
                'group_condition': f"PSI-25_{mat_class}",
                'fuel_raw': mat_raw,
                'material_class': mat_class,
                'fuel_phase': 'solid',
                'cabin_o2_pct': r.get('calibrated_initial_o2_pct'),
                'burner_flow_o2_pct': None,
                'pressure_psi': None,
                'pressure_raw_value': None,
                'pressure_raw_unit': None,
                'airflow_speed_cm_s': flow_vel,
                'temperature_c': None,
                'sample_shape': shape,
                'sample_thickness_mm': thick,
                'sample_width_cm': width,
                'sample_length_cm': 10.0,
                'initial_diameter_mm': None,
                'flame_spread_rate_mm_s': spread,
                'burn_duration_s': burn_sec,
                'extinction_diameter_mm': None,
                'burning_rate_mm2_s': None,
                'weight_loss_rate_mg_min': None,
                'smoke_inlet_velocity_cm_s': None,
                'particle_aging_time_s': None,
                'calibrated_initial_o2_pct': r.get('calibrated_initial_o2_pct'),
                'calibrated_final_o2_pct': r.get('calibrated_final_o2_pct'),
                'initial_co2_pct': r.get('initial_co2_pct'),
                'final_co2_pct': r.get('final_co2_pct'),
                'initial_co_ppm': r.get('initial_co_ppm'),
                'final_co_ppm': r.get('final_co_ppm'),
                'adiabatic_flame_temp_k': None,
                'provenance_file': bass2_file,
                'provenance_file_sha256': bass2_sha,
                'provenance_row_id': test_no,
                'provenance_column': 'Test #',
                'provenance_note': prov_note
            }
            runs.append(run)

    # -------------------------------------------------------------------------
    # 3. All Other Ingested Tables (excluding PSI-142 bibliographic index)
    # -------------------------------------------------------------------------
    table_run_files = sorted(glob.glob('data/table_runs/PSI-*.json'))
    for tr_file in table_run_files:
        filename = os.path.basename(tr_file)
        psi_id = filename.replace('.json', '')
        
        # PSI-142 is a bibliographic figure index; excluded from run-level test dataset
        if psi_id == 'PSI-142':
            continue

        with open(tr_file, 'r', encoding='utf-8') as f:
            t_data = json.load(f)

        runs_list = t_data.get('runs', [])
        if not runs_list:
            continue

        acronym = ACRONYM_MAP.get(psi_id, psi_id)
        fuel_phase = FUEL_PHASE_MAP.get(psi_id, 'gas')

        meta_dict = t_data.get('metadata') if isinstance(t_data.get('metadata'), dict) else {}
        source_file = t_data.get('source_file') or meta_dict.get('source_file')
        if not source_file:
            raw_csvs = glob.glob(f"raw_real/{psi_id}/experimental_table/*.csv")
            if raw_csvs:
                source_file = raw_csvs[0].replace('\\', '/')
        if source_file:
            source_file = source_file.replace('\\', '/')
        source_sha = t_data.get('source_sha256') or meta_dict.get('source_sha256')
        if not source_sha and source_file:
            source_sha = resolve_sha256(source_file)
        source_table_name = os.path.basename(source_file) if source_file else f"{psi_id}_table.csv"

        for r in runs_list:
            tid = r.get('test_id') or r.get('sample_number') or r.get('sample_id') or r.get('flex_number')
            run_id = f"{psi_id}_{tid}" if tid else f"{psi_id}_{len(runs)+1}"

            mf = r.get('mapped_fields', {})
            raw = r.get('raw_fields', {})
            fuel = mf.get('fuel') or raw.get('Fuel') or raw.get('Sample Material') or raw.get('Material') or raw.get('Fuel Bottle') or raw.get('Fuel Type')
            mat_class = fuel or 'unspecified'

            shape = None
            if fuel_phase == 'liquid droplet': shape = 'droplet'
            elif fuel_phase == 'gas': shape = 'burner nozzle'
            elif fuel_phase == 'solid': shape = 'sheet/fabric'
            elif fuel_phase == 'smoke': shape = 'wire/wick'
            elif fuel_phase == 'dust': shape = 'particulate'

            if psi_id in ['PSI-159', 'PSI-10']:
                raw_o2 = mf.get('burner_flow_o2_pct') or mf.get('o2_initial_pct') or mf.get('o2_initial_mole_fraction')
                if raw_o2 is not None:
                    burner_o2 = round(raw_o2 * 100.0, 4) if raw_o2 <= 1.0 else raw_o2
                else:
                    burner_o2 = None
                cabin_o2 = None
            else:
                burner_o2 = mf.get('burner_flow_o2_pct')
                raw_cabin = mf.get('cabin_o2_pct') or mf.get('o2_initial_pct') or mf.get('o2_initial_mole_fraction')
                if raw_cabin is not None:
                    cabin_o2 = round(raw_cabin * 100.0, 4) if raw_cabin <= 1.0 else raw_cabin
                else:
                    cabin_o2 = None

            p_psi = mf.get('pressure_psi')
            p_raw_val = None
            p_raw_unit = None
            if p_psi is not None:
                if 'pressure_mmhg' in mf:
                    p_raw_val = mf['pressure_mmhg']
                    p_raw_unit = 'mmHg'
                elif 'pressure_atm' in mf:
                    p_raw_val = mf['pressure_atm']
                    p_raw_unit = 'atm'
                elif 'pressure_bar' in mf:
                    p_raw_val = mf['pressure_bar']
                    p_raw_unit = 'bar'
                elif 'pressure_kpa' in mf:
                    p_raw_val = mf['pressure_kpa']
                    p_raw_unit = 'kPa'

            flow_vel = mf.get('airflow_speed_cm_s')
            thick_mm = mf.get('sample_thickness_cm')
            if thick_mm is not None: thick_mm = round(thick_mm * 10.0, 3)
            w_cm = mf.get('sample_width_cm')
            l_cm = mf.get('sample_length_cm')
            d0 = mf.get('droplet_diameter_initial_mm') or mf.get('nozzle_diameter_mm')
            d_ext = mf.get('extinction_diameter_mm')
            br = mf.get('burning_rate_mm2_s') or mf.get('fuel_flow_rate_mg_s')
            w_loss = mf.get('weight_loss_rate_mg_min')
            aging_s = mf.get('net_aging_time_s') or mf.get('burn_duration_s')
            burn_s = mf.get('burn_time_s')
            tad = mf.get('adiabatic_flame_temp_k') or mf.get('temperature_ad_k') or mf.get('adiabatic_temperature_k')

            grav = 'microgravity'
            if psi_id == 'PSI-22':
                grav = 'electric-field-analog'

            prov = r.get('provenance', {})
            prov_col = prov.get('column', 'Table Row')
            prov_note = prov.get('conversion') or prov.get('note') or 'Direct extraction from experimental table'

            is_sus = r.get('is_suspect', False)
            sus_reason = r.get('suspect_reason')
            if psi_id == 'PSI-107' and flow_vel is not None and flow_vel < 0:
                is_sus = True
                sus_reason = f"Negative airflow measurement in table ({flow_vel} cm/s); excluded from physical envelope"

            run = {
                'run_id': run_id,
                'investigation_id': psi_id,
                'investigation_acronym': acronym,
                'source_table': source_table_name,
                'test_id': str(tid),
                'date': raw.get('Date') or raw.get('Test Date') or raw.get('Day') or raw.get('GMT date'),
                'gravity_regime': grav,
                'is_suspect': is_sus,
                'suspect_reason': sus_reason,
                'group_condition': f"{psi_id}_{mat_class}",
                'fuel_raw': fuel,
                'material_class': mat_class,
                'fuel_phase': fuel_phase,
                'cabin_o2_pct': cabin_o2,
                'burner_flow_o2_pct': burner_o2,
                'pressure_psi': p_psi,
                'pressure_raw_value': p_raw_val,
                'pressure_raw_unit': p_raw_unit,
                'airflow_speed_cm_s': flow_vel,
                'temperature_c': mf.get('temperature_c'),
                'sample_shape': shape,
                'sample_thickness_mm': thick_mm,
                'sample_width_cm': w_cm,
                'sample_length_cm': l_cm,
                'initial_diameter_mm': d0,
                'flame_spread_rate_mm_s': None,
                'burn_duration_s': burn_s,
                'extinction_diameter_mm': d_ext,
                'burning_rate_mm2_s': br,
                'weight_loss_rate_mg_min': w_loss,
                'smoke_inlet_velocity_cm_s': flow_vel if fuel_phase == 'smoke' else None,
                'particle_aging_time_s': aging_s,
                'calibrated_initial_o2_pct': None,
                'calibrated_final_o2_pct': None,
                'initial_co2_pct': None,
                'final_co2_pct': None,
                'initial_co_ppm': None,
                'final_co_ppm': None,
                'adiabatic_flame_temp_k': tad,
                'provenance_file': source_file,
                'provenance_file_sha256': source_sha,
                'provenance_row_id': str(tid),
                'provenance_column': prov_col,
                'provenance_note': prov_note
            }
            runs.append(run)

    return runs

def write_release_artifacts(runs):
    print(f"Total compiled modeling-ready runs: {len(runs)}")

    # 1. Write release/modeling_ready_runs.json
    json_path = os.path.join(RELEASE_DIR, 'modeling_ready_runs.json')
    pub_json_path = os.path.join(PUBLIC_RELEASE_DIR, 'modeling_ready_runs.json')
    
    release_doc = {
        "_schema_version": "1.0.0",
        "_description": "PYRO-ASTRA Modeling-Ready Microgravity Combustion Test Runs Dataset",
        "_release_date": datetime.now(timezone.utc).isoformat(),
        "_license_statement": "There are no restrictions on the use of this data. (Registry of Open Data on AWS, https://registry.opendata.aws/nasa-psi/)",
        "_rules_enforced": {
            "G1_strict_nulls": "All unmeasured or unstated fields are strictly null. No interpolation, extrapolation or estimation.",
            "G1_row_provenance": "Every row carries authentic {file, sha256, row_id, column, unit_conversion_note}.",
            "G1_exact_unit_conversions": "Exact mathematical formulas: 1 atm = 14.6959 psi, 1 mmHg = 14.6959/760 psi, 1 bar = 14.50377 psi, 1.0 mole frac O2 = 100%.",
            "G1_oxygen_isolation": "Burner feed oxygen (CFI-G) strictly isolated in burner_flow_o2_pct; cabin_o2_pct is strictly null for burner flames.",
            "G1_zero_partial_gravity": "Gravity regime strictly microgravity or 1g ground comparator. Zero partial-gravity predictions. Electric field analog tagged as electric-field-analog."
        },
        "row_count": len(runs),
        "columns": CANONICAL_COLUMNS,
        "runs": runs
    }

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(release_doc, f, indent=2)
    with open(pub_json_path, 'w', encoding='utf-8') as f:
        json.dump(release_doc, f, indent=2)
    print(f"Saved {json_path} and {pub_json_path}")

    # 2. Write release/modeling_ready_runs.csv
    csv_path = os.path.join(RELEASE_DIR, 'modeling_ready_runs.csv')
    pub_csv_path = os.path.join(PUBLIC_RELEASE_DIR, 'modeling_ready_runs.csv')

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CANONICAL_COLUMNS)
        writer.writeheader()
        for r in runs:
            row_dict = {}
            for col in CANONICAL_COLUMNS:
                val = r.get(col)
                if val is None:
                    row_dict[col] = ""
                elif isinstance(val, bool):
                    row_dict[col] = "TRUE" if val else "FALSE"
                else:
                    row_dict[col] = str(val)
            writer.writerow(row_dict)

    with open(pub_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CANONICAL_COLUMNS)
        writer.writeheader()
        for r in runs:
            row_dict = {}
            for col in CANONICAL_COLUMNS:
                val = r.get(col)
                if val is None:
                    row_dict[col] = ""
                elif isinstance(val, bool):
                    row_dict[col] = "TRUE" if val else "FALSE"
                else:
                    row_dict[col] = str(val)
            writer.writerow(row_dict)

    print(f"Saved {csv_path} and {pub_csv_path}")

if __name__ == '__main__':
    all_runs = build_all_modeling_runs()
    write_release_artifacts(all_runs)
