#!/usr/bin/env python3
import os
import shutil
import hashlib
import csv

dump_dir = os.path.join("raw_real", "_drive_dump", "DATASET")

# Mapping of file to target relative path
file_targets = [
    # PSI-98
    ("PSI-98_Experimental table_SAFFIRE-1.csv", os.path.join("raw_real", "PSI-98", "experimental_table", "PSI-98_Experimental table_SAFFIRE-1.csv")),
    # PSI-100
    ("PSI-100_Experimental table_SAFFIRE-3.csv", os.path.join("raw_real", "PSI-100", "experimental_table", "PSI-100_Experimental table_SAFFIRE-3.csv")),
    # PSI-39
    ("PSI-39_Experimental table_CFI.csv", os.path.join("raw_real", "PSI-39", "experimental_table", "PSI-39_Experimental table_CFI.csv")),
    # PSI-10
    ("PSI-10_Experimental table_Flame Design_Normal Flame (1).csv", os.path.join("raw_real", "PSI-10", "experimental_table", "PSI-10_Experimental table_Flame Design_Normal Flame (1).csv")),
    ("PSI-10_Experimental table_Flame Design_Inverse Flame.csv", os.path.join("raw_real", "PSI-10", "experimental_table", "PSI-10_Experimental table_Flame Design_Inverse Flame.csv")),
    # PSI-22
    ("PSI-22_Experimental table_ACME E-FIELD Flames.csv", os.path.join("raw_real", "PSI-22", "experimental_table", "PSI-22_Experimental table_ACME E-FIELD Flames.csv")),
    # PSI-23
    ("PSI-23_Experimental table_ACME s-Flame.csv", os.path.join("raw_real", "PSI-23", "experimental_table", "PSI-23_Experimental table_ACME s-Flame.csv")),
    # PSI-20
    ("PSI-20_Experimental table_ACME BRE.csv", os.path.join("raw_real", "PSI-20", "experimental_table", "PSI-20_Experimental table_ACME BRE.csv")),
    # PSI-107
    ("PSI-107_Experimental table_Spice.csv", os.path.join("raw_real", "PSI-107", "experimental_table", "PSI-107_Experimental table_Spice.csv")),
    # PSI-106
    ("PSI-106_Experimental table_Slice.csv", os.path.join("raw_real", "PSI-106", "experimental_table", "PSI-106_Experimental table_Slice.csv")),
    # PSI-47
    ("PSI-47_Experimental table_DAFT.csv", os.path.join("raw_real", "PSI-47", "experimental_table", "PSI-47_Experimental table_DAFT.csv")),
    # PSI-142
    ("PSI-142_Experimental table_Data Summary Table.csv", os.path.join("raw_real", "PSI-142", "experimental_table", "PSI-142_Experimental table_Data Summary Table.csv")),
    # PSI-117 Analyzed CSVs
    ("PSI-117_Analyzed Data_MST_2024_Burning_history_Flame_diameter.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_MST_2024_Burning_history_Flame_diameter.csv")),
    ("PSI-117_Analyzed Data_MST_2024_Dext.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_MST_2024_Dext.csv")),
    ("PSI-117_Analyzed Data_MST_2024_Kavg.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_MST_2024_Kavg.csv")),
    ("PSI-117_Analyzed Data_MST_2024_Radiance_Flame_Diameter.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_MST_2024_Radiance_Flame_Diameter.csv")),
    ("PSI-117_Analyzed Data_PROCI_2019_Oscillatory_Cool_Flame.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_PROCI_2019_Oscillatory_Cool_Flame.csv")),
    ("PSI-117_Analyzed Data_PROCI_2019_Stable_Cool.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_PROCI_2019_Stable_Cool.csv")),
    ("PSI-117_Analyzed Data_PROCI_2023_Alkane_Extinction_Diameter_1atm.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_PROCI_2023_Alkane_Extinction_Diameter_1atm.csv")),
    ("PSI-117_Analyzed Data_PROCI_2023_C12_Extinction_Diameter_vs_pressure.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_PROCI_2023_C12_Extinction_Diameter_vs_pressure.csv")),
    ("PSI-117_Analyzed Data_PROCI_C12_2019_Three_Stage.csv", os.path.join("raw_real", "PSI-117", "analyzed_csv", "PSI-117_Analyzed Data_PROCI_C12_2019_Three_Stage.csv")),
    # Zip files
    ("PSI-60_metadata_NEWID-5_Computational and Ex.zip", os.path.join("raw_real", "PSI-60", "PSI-60_metadata_NEWID-5_Computational and Ex.zip")),
    ("PSI-106_metadata_PSI-174_SLICE.zip", os.path.join("raw_real", "PSI-106", "PSI-106_metadata_PSI-174_SLICE.zip")),
]

copied_entries = []

for src_name, dst_path in file_targets:
    src_file = os.path.join(dump_dir, src_name)
    if not os.path.exists(src_file):
        print(f"MISSING: {src_file}")
        continue
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    shutil.copy2(src_file, dst_path)

    with open(dst_path, "rb") as f:
        data = f.read()
        sha = hashlib.sha256(data).hexdigest()
        byte_len = len(data)

    row_count = None
    columns = []
    if dst_path.endswith(".csv"):
        for enc in ["utf-8", "utf-8-sig", "cp1252", "latin1"]:
            try:
                with open(dst_path, "r", encoding=enc) as f:
                    r = list(csv.reader(f))
                if r:
                    row_count = len(r) - 1
                    columns = [c.strip() for c in r[0]]
                break
            except Exception:
                pass

    copied_entries.append({
        "src_name": src_name,
        "dst_path": dst_path.replace("\\", "/"),
        "sha256": sha,
        "bytes": byte_len,
        "row_count": row_count,
        "columns": columns
    })
    print(f"Copied {src_name} -> {dst_path} | {byte_len} bytes | sha256: {sha}")

# Append to data/acquisition_log.csv
acq_path = os.path.join("data", "acquisition_log.csv")
with open(acq_path, "r", encoding="utf-8") as f:
    existing = f.read()

new_acq_lines = []
for entry in copied_entries:
    if entry["dst_path"] not in existing:
        new_acq_lines.append(f"{entry['dst_path']},{entry['bytes']},{entry['sha256']},raw_real/DATASET-20261114T133018Z-1-001.zip,2026-11-14T13:30:18Z")

if new_acq_lines:
    with open(acq_path, "a", encoding="utf-8") as f:
        for l in new_acq_lines:
            f.write(l + "\n")
    print(f"Appended {len(new_acq_lines)} lines to {acq_path}")

# Append to manifest.sha256
with open("manifest.sha256", "a", encoding="utf-8") as f:
    for entry in copied_entries:
        f.write(f"{entry['sha256']}  {entry['dst_path']}\n")
        if entry["row_count"] is not None:
            f.write(f"row_count: {entry['row_count']}\n")
            f.write(f"columns: {', '.join(entry['columns'])}\n")
        f.write("\n")
print("Appended entries to manifest.sha256")
