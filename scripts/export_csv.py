import json
import csv

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    invs = json.load(f)

CORE_VAL_FIELDS = [
    'hardware', 'objectives', 'fuels', 'sample_shape', 'sample_size',
    'cabin_o2_pct', 'burner_flow_o2_pct', 'pressure_psi', 'airflow_speed_cm_s',
    'varied_variables', 'constant_variables', 'sensors', 'n_tests'
]

fieldnames = [
    'id', 'acronym', 'name', 'doi', 'license', 'verified', 'depth', 'record_type',
    'safety_areas', 'gravity_regimes', 'data_origin'
]

for f in CORE_VAL_FIELDS:
    fieldnames.extend([f"{f}_value", f"{f}_unit", f"{f}_provenance_source", f"{f}_provenance_file", f"{f}_provenance_page", f"{f}_provenance_note"])

fieldnames.append('not_reported')

rows = []
for inv in invs:
    row = {
        'id': inv.get('id'),
        'acronym': inv.get('acronym'),
        'name': inv.get('name'),
        'doi': inv.get('doi'),
        'license': inv.get('license'),
        'verified': inv.get('verified'),
        'depth': inv.get('depth'),
        'record_type': inv.get('record_type'),
        'safety_areas': '; '.join(inv.get('safety_areas', [])),
        'gravity_regimes': '; '.join(inv.get('gravity_regimes', [])),
        'data_origin': '; '.join(inv.get('data_origin', []))
    }
    for f in CORE_VAL_FIELDS:
        val_obj = inv.get(f)
        if val_obj:
            v = val_obj.get('value')
            if isinstance(v, dict):
                v_str = f"{v.get('min')}-{v.get('max')}"
            elif isinstance(v, list):
                v_str = '; '.join(str(x) for x in v)
            else:
                v_str = str(v)
            prov = val_obj.get('provenance', {})
            row[f"{f}_value"] = v_str
            row[f"{f}_unit"] = val_obj.get('unit')
            row[f"{f}_provenance_source"] = prov.get('source_id')
            row[f"{f}_provenance_file"] = prov.get('file')
            row[f"{f}_provenance_page"] = prov.get('row_or_page')
            row[f"{f}_provenance_note"] = prov.get('note')
        else:
            row[f"{f}_value"] = None
            row[f"{f}_unit"] = None
            row[f"{f}_provenance_source"] = None
            row[f"{f}_provenance_file"] = None
            row[f"{f}_provenance_page"] = None
            row[f"{f}_provenance_note"] = None
            
    row['not_reported'] = '; '.join(inv.get('not_reported', []))
    rows.append(row)

with open('data/investigations.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("Updated data/investigations.csv")

