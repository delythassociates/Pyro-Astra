import csv

with open('raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv', 'r', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

print(f"Total data rows in SAME-R CSV: {len(rows)}")

mat_counts = {}
for i, r in enumerate(rows):
    m = r.get('Sample Type', '').strip()
    test_id = r.get('SAME Test #', '').strip()
    vel = r.get('Inlet velocity (cm/s)', '').strip()
    mat_counts[m] = mat_counts.get(m, 0) + 1
    if not m or not test_id or not vel:
        print(f"Row {i+1} (Test {test_id}): mat='{m}', vel='{vel}'")

print("\nMaterial Breakdown:")
for m, c in sorted(mat_counts.items()):
    print(f"  {m}: {c} rows")

print(f"\nTotal: {sum(mat_counts.values())} rows")

# Check manifest or metadata references to SAME-R row count
with open('data/investigations.json', 'r', encoding='utf-8') as f:
    import json
    invs = json.load(f)
    for inv in invs:
        if inv['id'] == 'PSI-101':
            print("\nPSI-101 in investigations.json:")
            print("  n_tests:", inv.get('n_tests'))
            print("  airflow_speed_cm_s provenance:", (inv.get('airflow_speed_cm_s') or {}).get('provenance'))


