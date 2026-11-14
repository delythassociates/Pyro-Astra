import os
import glob
import csv
import json

print("=== 1. AUDITING ALL INGESTED EXPERIMENTAL TABLES ===")

# List of all experimental table files
table_files = {
    # Droplets
    "PSI-69": ("FLEX", "Droplet", "raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv"),
    "PSI-68": ("FLEX-2", "Droplet", "raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv"),
    "PSI-39": ("CFI", "Droplet", "raw_real/PSI-39/experimental_table/PSI-39_Experimental table_CFI.csv"),
    # Solids
    "PSI-25": ("BASS-II", "Solid", "raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv"),
    "PSI-26": ("BASS", "Solid", "raw_real/PSI-26/experimental_table/PSI-26_Experimental table_BASS.csv"),
    "PSI-98": ("SAFFIRE-I", "Solid", "raw_real/PSI-98/experimental_table/PSI-98_Experimental table_SAFFIRE-1.csv"),
    "PSI-99": ("SAFFIRE-II", "Solid", "raw_real/PSI-99/experimental_table/PSI-99_Experimental table_SAFFIRE-2.csv"),
    "PSI-100": ("SAFFIRE-III", "Solid", "raw_real/PSI-100/experimental_table/PSI-100_Experimental table_SAFFIRE-3.csv"),
    "PSI-101": ("SAME-R", "Solid", "raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv"),
    "PSI-102": ("SAME", "Solid", "raw_real/PSI-102/experimental_table/PSI-102_Experimental table_SAME.csv"),
    # Gases
    "PSI-159": ("CFI-G", "Gas", "raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (1).csv"),
    "PSI-10_norm": ("Flame Design Normal", "Gas", "raw_real/PSI-10/experimental_table/PSI-10_Experimental table_Flame Design_Normal Flame (1).csv"),
    "PSI-10_inv": ("Flame Design Inverse", "Gas", "raw_real/PSI-10/experimental_table/PSI-10_Experimental table_Flame Design_Inverse Flame.csv"),
    "PSI-20": ("ACME BRE", "Gas", "raw_real/PSI-20/experimental_table/PSI-20_Experimental table_ACME BRE.csv"),
    "PSI-22": ("ACME E-FIELD", "Gas", "raw_real/PSI-22/experimental_table/PSI-22_Experimental table_ACME E-FIELD Flames.csv"),
    "PSI-23": ("ACME s-Flame", "Gas", "raw_real/PSI-23/experimental_table/PSI-23_Experimental table_ACME s-Flame.csv"),
    "PSI-106": ("SLICE", "Gas", "raw_real/PSI-106/experimental_table/PSI-106_Experimental table_Slice.csv"),
    "PSI-107": ("Spice", "Gas", "raw_real/PSI-107/experimental_table/PSI-107_Experimental table_Spice.csv"),
    # Dust / Particulate
    "PSI-47": ("DAFT", "Particulate", "raw_real/PSI-47/experimental_table/PSI-47_Experimental table_DAFT.csv"),
    # Bibliographic summary
    "PSI-142": ("CFE Summary", "Summary", "raw_real/PSI-142/experimental_table/PSI-142_Experimental table_Data Summary Table.csv")
}

table_counts = {}
phase_sums = {"Droplet": 0, "Solid": 0, "Gas": 0, "Particulate": 0, "Summary": 0}

for key, (name, phase, path) in table_files.items():
    if os.path.exists(path):
        with open(path, "r", encoding="latin-1") as f:
            reader = csv.reader(f)
            header = next(reader)
            rows = list(reader)
            count = len(rows)
            table_counts[key] = (name, phase, count)
            phase_sums[phase] += count
    else:
        print(f"MISSING: {path}")

total_raw_rows = sum(c[2] for c in table_counts.values())
print(f"Per-table raw row counts:")
for key, (name, phase, count) in table_counts.items():
    print(f"  {key:12} ({name:20}): {count:4} rows | Phase: {phase}")

print(f"\nPhase sums from raw CSVs:")
for phase, s in phase_sums.items():
    print(f"  {phase:12}: {s:4} rows")
print(f"Total across all tables: {total_raw_rows} rows")

print("\n=== 2. AUDITING modeling_ready_runs.csv / .json ===")
mr_csv = "release/modeling_ready_runs.csv"
mr_json = "release/modeling_ready_runs.json"
if os.path.exists(mr_csv):
    with open(mr_csv, "r", encoding="utf-8") as f:
        mr_rows = list(csv.DictReader(f))
    print(f"modeling_ready_runs.csv total rows: {len(mr_rows)}")
    mr_phases = {}
    mr_invs = {}
    for r in mr_rows:
        p = r.get("fuel_phase", "")
        mr_phases[p] = mr_phases.get(p, 0) + 1
        inv = r.get("investigation_id", "")
        mr_invs[inv] = mr_invs.get(inv, 0) + 1

    print("Phases in modeling_ready_runs.csv:")
    for p, c in sorted(mr_phases.items()):
        print(f"  {p:15}: {c:4} rows")

    print("\nInvestigations in modeling_ready_runs.csv:")
    for inv, c in sorted(mr_invs.items()):
        print(f"  {inv:15}: {c:4} rows")

print("\n=== 3. EXPLAINING THE DISCREPANCIES (1,823 vs 1,843, Solid 292 vs 389, Gas 1,063 vs 1,055) ===")
# Let's see:
# Total in table_files without PSI-142? Or Table 5.1?
# Let's inspect differences between table_counts and mr_invs:
for inv in sorted(set(list(table_files.keys()) + list(mr_invs.keys()))):
    base_id = inv.split("_")[0]
    raw_count = table_counts.get(inv, (None, None, 0))[2]
    mr_count = mr_invs.get(base_id, 0)
    print(f"  {inv:15}: raw_table = {raw_count}, in modeling_ready = {mr_count}")

