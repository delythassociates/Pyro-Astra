#!/usr/bin/env python3
"""
Generate comprehensive DIFF REPORT across ALL ingested NASA PSI investigations.
"""

import json
import os
import glob

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    invs = {inv['id']: inv for inv in json.load(f)}

all_psi = [
    'PSI-68', 'PSI-69', 'PSI-99', 'PSI-159', 'PSI-26', 'PSI-101', 'PSI-102',
    'PSI-98', 'PSI-100', 'PSI-39', 'PSI-10', 'PSI-22', 'PSI-23', 'PSI-20',
    'PSI-107', 'PSI-106', 'PSI-47', 'PSI-142'
]

reports = {}

for psi_id in all_psi:
    run_file = f'data/table_runs/{psi_id}.json'
    map_file = f'analysis/table_maps/{psi_id}.json'
    if not os.path.exists(run_file) or not os.path.exists(map_file):
        continue

    with open(run_file, 'r', encoding='utf-8') as f:
        run_data = json.load(f)
    with open(map_file, 'r', encoding='utf-8') as f:
        map_data = json.load(f)
    
    inv = invs.get(psi_id, {})
    runs = run_data['runs']
    meta = run_data['metadata']
    col_maps = map_data.get('column_mappings', {})

    mapped_cols = [k for k, v in col_maps.items() if v.get('mapped')]
    unmapped_cols = [k for k, v in col_maps.items() if not v.get('mapped')]

    # Field stats
    stats = {}
    mapped_field_keys = set()
    for r in runs:
        mapped_field_keys.update(r.get('mapped_fields', {}).keys())
    
    for k in sorted(mapped_field_keys):
        if k in ('test_id', 'fuel'):
            vals = [r['mapped_fields'].get(k) for r in runs if r['mapped_fields'].get(k)]
            stats[k] = {'n': len(vals), 'unique': len(set(vals))}
        else:
            vals = [r['mapped_fields'].get(k) for r in runs if r['mapped_fields'].get(k) is not None]
            stats[k] = {
                'n': len(vals),
                'nulls': len(runs) - len(vals),
                'min': min(vals) if vals else None,
                'max': max(vals) if vals else None
            }

    materials = sorted(list(set(r.get('fuel_raw', '') for r in runs if r.get('fuel_raw'))))
    material_classes = sorted(list(set(r.get('material_class', '') for r in runs if r.get('material_class'))))

    reports[psi_id] = {
        'title': map_data.get('investigation_title') or inv.get('title'),
        'gravity_regime': meta.get('gravity_regime'),
        'total_rows': len(runs),
        'mapped_cols': mapped_cols,
        'unmapped_cols': {u: col_maps[u].get('reason') for u in unmapped_cols},
        'stats': stats,
        'materials': materials[:10],
        'material_classes': material_classes,
        'inv_current': {
            'cabin_o2_pct': inv.get('cabin_o2_pct'),
            'pressure_psi': inv.get('pressure_psi'),
            'airflow_speed_cm_s': inv.get('airflow_speed_cm_s'),
            'n_tests': inv.get('n_tests'),
            'fuels': inv.get('fuels')
        }
    }

print(json.dumps(reports, indent=2))
