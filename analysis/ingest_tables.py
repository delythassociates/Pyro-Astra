#!/usr/bin/env python3
"""
PYRO-ASTRA Comprehensive Multi-Table Ingestion Pipeline
Parses experimental tables for all NASA PSI investigations in the raw repository:
- Priority deep investigations: PSI-68, PSI-69, PSI-99, PSI-159, PSI-26, PSI-101, PSI-102
- Additional experimental tables: PSI-98, PSI-100, PSI-39, PSI-10 (Normal & Inverse), PSI-22, PSI-23, PSI-20, PSI-107, PSI-106, PSI-47, PSI-142
- Analyzed droplet combustion data: PSI-117 (9 analyzed CSV datasets)
- Zip metadata inventories: PSI-60, PSI-106

Strictly enforces PYRO-ASTRA core rules:
- Reads explicit column mappings from analysis/table_maps/<PSI-ID>.json
- Keeps every cell verbatim in 'raw'
- Maps only unambiguous quantity and unit headers
- Exact unit conversions where applicable with conversion note in provenance
- Normalizes header whitespace only
- Classifies material_class using explicit mapping table; unmapped remains 'unmapped'
- Flags suspect rows if final O2 > initial O2 + 1.0 (or > 0.01 for mole fraction)
- PSI-22 ACME E-FIELD Flames tagged as 'electric-field-analog' only, NEVER partial gravity
- PSI-107 Spice: 8 negative airflow rows flagged suspect and excluded from airflow envelope (0.66 to 85.28 cm/s, n=436)
- Emits data/table_runs/<PSI-ID>.json with per-row provenance {file, test_id, column}
"""

import os
import csv
import json
import re
import zipfile

TARGETS = [
    # Initial batch
    {
        "psi_id": "PSI-68",
        "csv_path": os.path.join("raw_real", "PSI-68", "experimental_table", "PSI-68_Experimental table_Flex2.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-68.json"),
        "encoding": "utf-8",
        "test_id_col": None,
        "fuel_col": "Sample (Fuel Type)"
    },
    {
        "psi_id": "PSI-69",
        "csv_path": os.path.join("raw_real", "PSI-69", "experimental_table", "PSI-69_Experimental table_FLEX.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-69.json"),
        "encoding": "cp1252",
        "test_id_col": "FLEX Test #",
        "fuel_col": "Fuel"
    },
    {
        "psi_id": "PSI-99",
        "csv_path": os.path.join("raw_real", "PSI-99", "experimental_table", "PSI-99_Experimental table_SAFFIRE-2.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-99.json"),
        "encoding": "utf-8",
        "test_id_col": "Sample Number",
        "fuel_col": "Material"
    },
    {
        "psi_id": "PSI-159",
        "csv_path": os.path.join("raw_real", "PSI-159", "experimental_table", "PSI-159_Experimental table_CFI-G_Normal Flames (1).csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-159.json"),
        "encoding": "utf-8",
        "test_id_col": "Test",
        "fuel_col": "Fuel"
    },
    {
        "psi_id": "PSI-26",
        "csv_path": os.path.join("raw_real", "PSI-26", "experimental_table", "PSI-26_Experimental table_BASS.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-26.json"),
        "encoding": "utf-8-sig",
        "test_id_col": "Test #",
        "fuel_col": "Fuel Sample Material"
    },
    {
        "psi_id": "PSI-101",
        "csv_path": os.path.join("raw_real", "PSI-101", "experimental_table", "PSI-101_Experimental table_SAME-R.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-101.json"),
        "encoding": "utf-8",
        "test_id_col": "SAME Test #",
        "fuel_col": "Sample Type"
    },
    {
        "psi_id": "PSI-102",
        "csv_path": os.path.join("raw_real", "PSI-102", "experimental_table", "PSI-102_Experimental table_SAME.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-102.json"),
        "encoding": "utf-8",
        "test_id_col": "Sample #",
        "fuel_col": "Sample Material"
    },
    # Phase 1 expansion batch
    {
        "psi_id": "PSI-98",
        "csv_path": os.path.join("raw_real", "PSI-98", "experimental_table", "PSI-98_Experimental table_SAFFIRE-1.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-98.json"),
        "encoding": "utf-8",
        "test_id_col": "Sample Number",
        "fuel_col": "Material"
    },
    {
        "psi_id": "PSI-100",
        "csv_path": os.path.join("raw_real", "PSI-100", "experimental_table", "PSI-100_Experimental table_SAFFIRE-3.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-100.json"),
        "encoding": "utf-8",
        "test_id_col": "Sample Number",
        "fuel_col": "Material"
    },
    {
        "psi_id": "PSI-39",
        "csv_path": os.path.join("raw_real", "PSI-39", "experimental_table", "PSI-39_Experimental table_CFI.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-39.json"),
        "encoding": "utf-8",
        "test_id_col": "Flex Number",
        "fuel_col": "Fuel"
    },
    {
        "psi_id": "PSI-10",
        "csv_path": os.path.join("raw_real", "PSI-10", "experimental_table", "PSI-10_Experimental table_Flame Design_Normal Flame (1).csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-10.json"),
        "encoding": "utf-8",
        "test_id_col": "Test",
        "fuel_col": "Fuel",
        "extra_csv": {
            "csv_path": os.path.join("raw_real", "PSI-10", "experimental_table", "PSI-10_Experimental table_Flame Design_Inverse Flame.csv"),
            "flame_type": "Inverse",
            "fuel_default": "C2H4"
        }
    },
    {
        "psi_id": "PSI-22",
        "csv_path": os.path.join("raw_real", "PSI-22", "experimental_table", "PSI-22_Experimental table_ACME E-FIELD Flames.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-22.json"),
        "encoding": "utf-8",
        "test_id_col": "Test Day",
        "fuel_col": "Fuel Bottle"
    },
    {
        "psi_id": "PSI-23",
        "csv_path": os.path.join("raw_real", "PSI-23", "experimental_table", "PSI-23_Experimental table_ACME s-Flame.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-23.json"),
        "encoding": "utf-8",
        "test_id_col": "Test Day*",
        "fuel_col": "Fuel Bottle"
    },
    {
        "psi_id": "PSI-20",
        "csv_path": os.path.join("raw_real", "PSI-20", "experimental_table", "PSI-20_Experimental table_ACME BRE.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-20.json"),
        "encoding": "utf-8",
        "test_id_col": None,
        "fuel_col": "Fuel Bottle"
    },
    {
        "psi_id": "PSI-107",
        "csv_path": os.path.join("raw_real", "PSI-107", "experimental_table", "PSI-107_Experimental table_Spice.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-107.json"),
        "encoding": "utf-8",
        "test_id_col": None,
        "fuel_col": "Fuel"
    },
    {
        "psi_id": "PSI-106",
        "csv_path": os.path.join("raw_real", "PSI-106", "experimental_table", "PSI-106_Experimental table_Slice.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-106.json"),
        "encoding": "utf-8",
        "test_id_col": None,
        "fuel_col": "Fuel Type"
    },
    {
        "psi_id": "PSI-47",
        "csv_path": os.path.join("raw_real", "PSI-47", "experimental_table", "PSI-47_Experimental table_DAFT.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-47.json"),
        "encoding": "utf-8",
        "test_id_col": "Session Name",
        "fuel_col": "Sample Material"
    },
    {
        "psi_id": "PSI-142",
        "csv_path": os.path.join("raw_real", "PSI-142", "experimental_table", "PSI-142_Experimental table_Data Summary Table.csv"),
        "map_path": os.path.join("analysis", "table_maps", "PSI-142.json"),
        "encoding": "utf-8-sig",
        "test_id_col": "Data ID",
        "fuel_col": None
    }
]

def norm_ws(s):
    if s is None:
        return ""
    s = str(s).lstrip('\ufeff')
    return re.sub(r"\s+", " ", s).strip()

def parse_num(v):
    if v is None:
        return None
    s = str(v).strip().lstrip('\ufeff')
    if not s or s.lower() in ('none', 'or', 'over', 'video', 'n/a', 'insignificant', 'complete', 'acceleratory', '–', '-', '', 'ramped'):
        return None
    try:
        return float(s)
    except ValueError:
        pass
    m = re.match(r'^([+-]?[0-9]+(?:\.[0-9]+)?)\s*(?:cm/s|W|s|sec|mm|cm|mg/s|mg/min|minutes|min|K|bar|mmHg|atm|C)?$', s, re.IGNORECASE)
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            return None
    return None

def ingest_investigation(config):
    psi_id = config["psi_id"]
    csv_path = config["csv_path"]
    map_path = config["map_path"]
    encoding = config["encoding"]
    test_id_col = config["test_id_col"]
    fuel_col = config["fuel_col"]

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Missing source CSV: {csv_path}")
    if not os.path.exists(map_path):
        raise FileNotFoundError(f"Missing table map: {map_path}")

    with open(map_path, "r", encoding="utf-8") as f:
        mapping_data = json.load(f)

    raw_col_maps = mapping_data.get("column_mappings", {})
    column_mappings = {norm_ws(k): v for k, v in raw_col_maps.items()}
    material_map = {norm_ws(k): v for k, v in mapping_data.get("material_map", {}).items()}
    gravity_regime = mapping_data.get("gravity_regime", "microgravity")

    runs = []
    suspect_rows = []

    def process_csv_file(c_path, enc, default_fuel=None, flame_type_tag=None):
        file_runs = []
        with open(c_path, "r", encoding=enc, errors="replace") as f:
            reader = csv.reader(f)
            raw_header = next(reader)
            norm_header = [norm_ws(h) for h in raw_header]

            for row_idx, raw_cells in enumerate(reader, start=1):
                raw_dict = dict(zip(norm_header, raw_cells))

                # Determine test_id
                norm_test_col = norm_ws(test_id_col) if test_id_col else None
                if norm_test_col and norm_test_col in raw_dict and raw_dict[norm_test_col].strip():
                    test_id = raw_dict[norm_test_col].strip()
                elif "Test" in raw_dict and raw_dict["Test"].strip():
                    test_id = raw_dict["Test"].strip()
                else:
                    test_id = f"{psi_id}-ROW-{len(runs) + len(file_runs) + 1}"

                # Determine fuel raw and material class
                norm_fuel_col = norm_ws(fuel_col) if fuel_col else None
                fuel_raw = ""
                if norm_fuel_col and norm_fuel_col in raw_dict:
                    fuel_raw = raw_dict[norm_fuel_col].strip()
                elif "Fuel" in raw_dict:
                    fuel_raw = raw_dict["Fuel"].strip()
                elif "Fuel Type" in raw_dict:
                    fuel_raw = raw_dict["Fuel Type"].strip()
                elif "Fuel Bottle" in raw_dict:
                    fuel_raw = raw_dict["Fuel Bottle"].strip()
                elif "Sample (Fuel Type)" in raw_dict:
                    fuel_raw = raw_dict["Sample (Fuel Type)"].strip()
                elif default_fuel:
                    fuel_raw = default_fuel

                material_class = material_map.get(norm_ws(fuel_raw), "unmapped")

                # Footnote check
                is_footnote = False
                if psi_id in ("PSI-98", "PSI-99") and (test_id.startswith("Note") or "flow visulation" in fuel_raw.lower()):
                    is_footnote = True

                record_mapped = {}
                provenance = {}

                def make_prov(col_name, extra_note=None):
                    p = {
                        "file": c_path.replace("\\", "/"),
                        "test_id": test_id,
                        "column": col_name
                    }
                    if extra_note:
                        p["note"] = extra_note
                    return p

                init_o2 = None
                final_o2 = None

                for norm_col, val_str in raw_dict.items():
                    col_spec = column_mappings.get(norm_col)
                    if not col_spec or not col_spec.get("mapped"):
                        continue

                    canonical_field = col_spec["canonical_field"]
                    num_val = parse_num(val_str)

                    if canonical_field == "test_id":
                        record_mapped["test_id"] = test_id
                        provenance["test_id"] = make_prov(norm_col)
                    elif canonical_field == "fuel":
                        record_mapped["fuel"] = fuel_raw
                        provenance["fuel"] = make_prov(norm_col)
                    else:
                        record_mapped[canonical_field] = num_val
                        provenance[canonical_field] = make_prov(norm_col)

                    if canonical_field in ("o2_initial_mole_fraction", "o2_initial_pct", "calibrated_initial_o2_pct"):
                        init_o2 = num_val
                    elif canonical_field in ("o2_final_mole_fraction", "o2_final_pct", "calibrated_final_o2_pct"):
                        final_o2 = num_val

                # Pressure conversions
                if "pressure_atm" in record_mapped and record_mapped["pressure_atm"] is not None:
                    p_atm = record_mapped["pressure_atm"]
                    record_mapped["pressure_psi"] = round(p_atm * 14.6959488, 5)
                    record_mapped["pressure_kpa"] = round(p_atm * 101.325, 5)
                    provenance["pressure_psi"] = make_prov("pressure_atm", "Exact conversion: 1 atm = 14.6959488 psi")
                    provenance["pressure_kpa"] = make_prov("pressure_atm", "Exact conversion: 1 atm = 101.325 kPa")

                if "pressure_mmhg" in record_mapped and record_mapped["pressure_mmhg"] is not None:
                    p_mmhg = record_mapped["pressure_mmhg"]
                    record_mapped["pressure_psi"] = round(p_mmhg * (14.6959488 / 760.0), 5)
                    record_mapped["pressure_kpa"] = round(p_mmhg * (101.325 / 760.0), 5)
                    provenance["pressure_psi"] = make_prov("pressure_mmhg", "Exact conversion: 1 mmHg = 14.6959488/760 psi")
                    provenance["pressure_kpa"] = make_prov("pressure_mmhg", "Exact conversion: 1 mmHg = 101.325/760 kPa")

                if "pressure_bar" in record_mapped and record_mapped["pressure_bar"] is not None:
                    p_bar = record_mapped["pressure_bar"]
                    record_mapped["pressure_psi"] = round(p_bar * 14.50377, 5)
                    record_mapped["pressure_kpa"] = round(p_bar * 100.0, 5)
                    provenance["pressure_psi"] = make_prov("pressure_bar", "Exact conversion: 1 bar = 100 kPa = 14.50377 psi")
                    provenance["pressure_kpa"] = make_prov("pressure_bar", "Exact conversion: 1 bar = 100.0 kPa")

                # Suspect check 1: O2 final > initial + threshold
                is_suspect = False
                suspect_reason = None
                if init_o2 is not None and final_o2 is not None:
                    threshold = 1.0 if init_o2 > 1.0 else 0.01
                    if final_o2 > (init_o2 + threshold):
                        is_suspect = True
                        suspect_reason = f"Final O2 ({final_o2}) exceeds initial O2 ({init_o2}) by > threshold"
                        suspect_rows.append(test_id)

                # Suspect check 2 (Condition 2): PSI-107 Spice negative airflow values
                if psi_id == "PSI-107" and record_mapped.get("airflow_speed_cm_s") is not None:
                    if record_mapped["airflow_speed_cm_s"] < 0:
                        is_suspect = True
                        suspect_reason = f"Negative airflow ({record_mapped['airflow_speed_cm_s']} cm/s) flagged suspect per Condition 2; excluded from physical airflow envelope."
                        if test_id not in suspect_rows:
                            suspect_rows.append(test_id)

                entry = {
                    "row_index": len(runs) + len(file_runs) + 1,
                    "test_id": test_id,
                    "fuel_raw": fuel_raw,
                    "material_class": material_class,
                    "gravity_regime": gravity_regime,
                    "is_footnote_or_non_test": is_footnote,
                    "is_suspect": is_suspect,
                    "suspect_reason": suspect_reason,
                    "mapped_fields": record_mapped,
                    "raw": raw_dict,
                    "provenance": provenance
                }
                if psi_id == "PSI-22":
                    entry["analogue_evidence_only"] = True
                    entry["is_partial_gravity"] = False
                    entry["analogue_note"] = "ACME E-FIELD Flames uses high-voltage electric fields to mimic buoyant convection. Classified strictly as analogue evidence, never partial-gravity per PYRO-ASTRA Rule 5."

                if flame_type_tag:
                    entry["flame_type"] = flame_type_tag

                file_runs.append(entry)
        return file_runs

    # Process primary CSV
    runs.extend(process_csv_file(csv_path, encoding))

    # Process extra CSV if present (e.g. PSI-10 Inverse Flame)
    if "extra_csv" in config:
        ec = config["extra_csv"]
        if os.path.exists(ec["csv_path"]):
            extra_runs = process_csv_file(ec["csv_path"], encoding, default_fuel=ec.get("fuel_default"), flame_type_tag=ec.get("flame_type"))
            runs.extend(extra_runs)

    out_json = os.path.join("data", "table_runs", f"{psi_id}.json")
    os.makedirs(os.path.dirname(out_json), exist_ok=True)

    payload = {
        "metadata": {
            "psi_id": psi_id,
            "source_file": csv_path.replace("\\", "/"),
            "encoding": encoding,
            "total_rows": len(runs),
            "columns_normalized": list(column_mappings.keys()),
            "suspect_rows": suspect_rows,
            "gravity_regime": gravity_regime,
            "note": f"Ingested directly from authentic NASA PSI {psi_id} experimental table."
        },
        "runs": runs
    }

    if psi_id == "PSI-22":
        payload["metadata"]["analogue_evidence_only"] = True
        payload["metadata"]["partial_gravity_disclaimer"] = "Electric-field-induced buoyancy analog only; never to be cited or displayed as partial gravity data."

    if psi_id == "PSI-107":
        valid_af = [r["mapped_fields"]["airflow_speed_cm_s"] for r in runs if r.get("mapped_fields", {}).get("airflow_speed_cm_s") is not None and r["mapped_fields"]["airflow_speed_cm_s"] >= 0]
        payload["metadata"]["airflow_envelope"] = {
            "min": min(valid_af) if valid_af else None,
            "max": max(valid_af) if valid_af else None,
            "n": len(valid_af),
            "excluded_suspect_negative_count": len(suspect_rows)
        }

    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"[{psi_id}] Ingested {len(runs)} rows into {out_json} (suspect rows: {len(suspect_rows)})")
    return payload

def ingest_psi117_analyzed():
    """Ingest PSI-117 Droplet Combustion analyzed CSV datasets."""
    analyzed_dir = os.path.join("raw_real", "PSI-117", "analyzed_csv")
    if not os.path.exists(analyzed_dir):
        print("PSI-117 analyzed directory not found.")
        return

    csv_files = sorted([f for f in os.listdir(analyzed_dir) if f.endswith(".csv")])
    datasets = []
    total_rows = 0

    for fn in csv_files:
        fp = os.path.join(analyzed_dir, fn)
        with open(fp, "r", encoding="utf-8", errors="replace") as f:
            r = list(csv.reader(f))
        header = [norm_ws(h) for h in r[0]] if r else []
        rows = r[1:] if len(r) > 1 else []
        total_rows += len(rows)

        datasets.append({
            "filename": fn,
            "path": fp.replace("\\", "/"),
            "row_count": len(rows),
            "header": header,
            "sample_rows": rows[:3]
        })

    payload = {
        "metadata": {
            "psi_id": "PSI-117",
            "title": "Droplet Combustion Analyzed Datasets",
            "gravity_regime": "microgravity",
            "total_datasets": len(datasets),
            "total_rows": total_rows,
            "datasets": [d["filename"] for d in datasets],
            "note": "Analyzed research datasets for droplet extinction diameter, burning history, flame radiance, and cool flames from PSI-117 papers."
        },
        "datasets": datasets
    }

    out_json = os.path.join("data", "table_runs", "PSI-117.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"[PSI-117] Ingested {len(datasets)} datasets ({total_rows} total rows) into {out_json}")

def inventory_zips():
    """Inventory metadata zip archives for PSI-60 and PSI-106."""
    zips = [
        ("PSI-60", os.path.join("raw_real", "PSI-60", "PSI-60_metadata_NEWID-5_Computational and Ex.zip")),
        ("PSI-106", os.path.join("raw_real", "PSI-106", "PSI-106_metadata_PSI-174_SLICE.zip"))
    ]

    records = []
    for psi_id, zp in zips:
        if not os.path.exists(zp):
            continue
        with zipfile.ZipFile(zp, "r") as z:
            file_list = []
            for info in z.infolist():
                file_list.append({
                    "filename": info.filename,
                    "bytes": info.file_size
                })
        records.append({
            "psi_id": psi_id,
            "zip_path": zp.replace("\\", "/"),
            "file_count": len(file_list),
            "files": file_list
        })

    out_json = os.path.join("data", "table_runs", "zip_inventory.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({"metadata_zips": records}, f, indent=2)
    print(f"[ZIP INVENTORY] Cataloged {len(records)} archives into {out_json}")

def main():
    print("Executing comprehensive experimental table ingestion pipeline...")
    for target in TARGETS:
        ingest_investigation(target)
    ingest_psi117_analyzed()
    inventory_zips()
    print("Multi-table ingestion complete.")

if __name__ == "__main__":
    main()
