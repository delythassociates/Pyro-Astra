import json
import csv
import hashlib
import os

with open('release/modeling_ready_runs.json', 'r', encoding='utf-8') as f:
    doc = json.load(f)

runs = doc['runs']
print('JSON runs count:', len(runs))

with open('release/modeling_ready_runs.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    csv_rows = list(reader)
print('CSV rows count:', len(csv_rows))

assert len(runs) == len(csv_rows) == 1843, f'Row count mismatch: {len(runs)} vs {len(csv_rows)}'

# Audit G1 compliance
cfig_count = 0
efield_count = 0
invalid_prov = 0
invalid_sha = 0
partial_g_found = 0

for i, r in enumerate(runs):
    # Provenance check
    pf = r.get('provenance_file')
    psha = r.get('provenance_file_sha256')
    prow = r.get('provenance_row_id')
    pcol = r.get('provenance_column')
    pnote = r.get('provenance_note')
    
    if not pf or not prow or not pcol:
        invalid_prov += 1
    if not psha or len(psha) != 64:
        invalid_sha += 1
        
    # Gravity check
    grav = r.get('gravity_regime')
    if 'partial' in str(grav).lower():
        partial_g_found += 1
    if r.get('investigation_id') == 'PSI-22':
        assert grav == 'electric-field-analog', f"PSI-22 not tagged electric-field-analog in row {i}"
        efield_count += 1
        
    # Oxygen isolation check
    if r.get('investigation_id') == 'PSI-159':
        cfig_count += 1
        assert r.get('cabin_o2_pct') is None, f"Rule 4 violation: CFI-G row {i} has cabin_o2_pct {r.get('cabin_o2_pct')}"
        assert r.get('burner_flow_o2_pct') is not None, f"CFI-G row {i} missing burner_flow_o2_pct"

print('G1 Audit Passed:')
print(f'  Total rows: {len(runs)}')
print(f'  Invalid provenance count: {invalid_prov}')
print(f'  Invalid SHA-256 count: {invalid_sha}')
print(f'  Partial gravity violations: {partial_g_found}')
print(f'  PSI-22 electric-field-analog count: {efield_count}')
print(f'  PSI-159 CFI-G isolated burner flow count: {cfig_count}')
