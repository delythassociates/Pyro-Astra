#!/usr/bin/env python3
"""
PYRO-ASTRA: Ingest BASS-II (PSI-25) Experimental Table
Parses raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv
Strict rules:
- Normalizes header whitespace only.
- Keeps every cell verbatim in a "raw" field.
- Adds material_class via reviewable mapping table analysis/bass2_material_map.json
- Parses O2/CO2/CO as numbers; non-numeric becomes null with raw string kept.
- Flags rows where final O2 > initial O2 + 1 as "suspect" (P22b, T28b).
- Fan/Air display NOT converted to cm/s. Pressure stays null.
- Per-row provenance: {file, Test #, column}.
"""

import os
import csv
import json
import re

SOURCE_CSV = os.path.join('raw_real', 'PSI-25', 'experimental_table', 'PSI-25_Experimental_table_BASS-II.csv')
MATERIAL_MAP_FILE = os.path.join('analysis', 'bass2_material_map.json')
OUTPUT_JSON = os.path.join('data', 'bass2_runs.json')

def parse_num(v):
    if v is None:
        return None
    s = v.strip()
    if not s or s.lower() in ('none', 'or', 'over', 'video'):
        return None
    try:
        return float(s)
    except ValueError:
        return None

def main():
    if not os.path.exists(SOURCE_CSV):
        raise FileNotFoundError(f"Source file not found: {SOURCE_CSV}")
    if not os.path.exists(MATERIAL_MAP_FILE):
        raise FileNotFoundError(f"Material map not found: {MATERIAL_MAP_FILE}")

    with open(MATERIAL_MAP_FILE, 'r', encoding='utf-8') as f:
        material_map = json.load(f)

    with open(SOURCE_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        raw_header = next(reader)
        # Normalize header whitespace only
        norm_header = [re.sub(r'\s+', ' ', h).strip() for h in raw_header]

        rows = []
        for row_idx, raw_cells in enumerate(reader, start=1):
            raw_dict = dict(zip(norm_header, raw_cells))
            test_no = raw_dict.get('Test #', '').strip()
            pi = raw_dict.get('PI', '').strip()
            mat_raw = raw_dict.get('Fuel Sample Material', '').strip()

            # Map material class; anything unmapped stays 'unmapped' (no guessing)
            mat_class = material_map.get(mat_raw, 'unmapped')

            # Parse numeric gas concentrations
            init_o2 = parse_num(raw_dict.get('Calibrated initial O2 % by vol'))
            final_o2 = parse_num(raw_dict.get('Calibrated final O2 % by vol'))
            init_co2 = parse_num(raw_dict.get('Initial CO2 % by vol'))
            final_co2 = parse_num(raw_dict.get('Final CO2 % by vol'))
            init_co = parse_num(raw_dict.get('Initial CO (ppm)'))
            final_co = parse_num(raw_dict.get('Final CO (ppm)'))

            # Suspect check: final O2 > initial O2 + 1.0
            is_suspect = False
            suspect_reason = None
            if init_o2 is not None and final_o2 is not None:
                if final_o2 > init_o2 + 1.0:
                    is_suspect = True
                    suspect_reason = f"Final O2 ({final_o2}%) exceeds initial O2 ({init_o2}%) by >1.0%"

            # Provenance builder helper
            def prov(col_name):
                return {
                    "file": SOURCE_CSV.replace('\\', '/'),
                    "test_no": test_no,
                    "column": col_name
                }

            row_record = {
                "row_index": row_idx,
                "test_no": test_no,
                "pi": pi,
                "date": raw_dict.get('Date', '').strip(),
                "gmt": raw_dict.get('GMT', '').strip(),
                "sample_no": raw_dict.get('Sample #', '').strip(),
                "material_raw": mat_raw,
                "material_class": mat_class,
                "flow_restrictor": raw_dict.get('Flow restrictor', '').strip(),
                "fan_display": raw_dict.get('Fan display', '').strip(),
                "air_display": raw_dict.get('Air display', '').strip(),
                "radiometer_gain": raw_dict.get('Radiometer gain (1000 250 50 10)', '').strip(),
                "total_frames_shot": raw_dict.get('Total Frames Shot', '').strip(),
                "calibrated_initial_o2_pct": init_o2,
                "calibrated_final_o2_pct": final_o2,
                "initial_co2_pct": init_co2,
                "final_co2_pct": final_co2,
                "initial_co_ppm": init_co,
                "final_co_ppm": final_co,
                "pressure_psi": None,  # Pressure not reported in flight display table
                "is_suspect": is_suspect,
                "suspect_reason": suspect_reason,
                "raw": raw_dict,
                "provenance": {
                    "test_no": prov("Test #"),
                    "material_raw": prov("Fuel Sample Material"),
                    "calibrated_initial_o2_pct": prov("Calibrated initial O2 % by vol"),
                    "calibrated_final_o2_pct": prov("Calibrated final O2 % by vol"),
                    "initial_co2_pct": prov("Initial CO2 % by vol"),
                    "final_co2_pct": prov("Final CO2 % by vol"),
                    "initial_co_ppm": prov("Initial CO (ppm)"),
                    "final_co_ppm": prov("Final CO (ppm)")
                }
            }
            rows.append(row_record)

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    payload = {
        "metadata": {
            "source_file": SOURCE_CSV.replace('\\', '/'),
            "total_rows": len(rows),
            "columns_normalized": norm_header,
            "suspect_rows": [r["test_no"] for r in rows if r["is_suspect"]],
            "note": "Parsed directly from authentic NASA PSI BASS-II experimental table. Display values are not converted to cm/s; chamber pressure is not reported."
        },
        "runs": rows
    }

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2)

    print(f"Successfully ingested {len(rows)} rows into {OUTPUT_JSON}")
    print(f"Suspect rows flagged: {payload['metadata']['suspect_rows']}")

if __name__ == "__main__":
    main()

