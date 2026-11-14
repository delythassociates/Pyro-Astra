import json

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    invs = json.load(f)

for inv in invs:
    if inv.get('depth') == 'deep':
        inv_id = inv['id']
        acronym = inv.get('acronym')
        print(f"=== {inv_id} ({acronym}) ===")
        for fld in ['cabin_o2_pct', 'burner_flow_o2_pct', 'pressure_psi', 'airflow_speed_cm_s']:
            v = inv.get(fld)
            if v is not None:
                val = v.get('value')
                unit = v.get('unit')
                prov = v.get('provenance', {})
                print(f"  {fld}: {val} {unit}")
                print(f"    Source JSON key path: investigations[id='{inv_id}'].{fld}")
                print(f"    Provenance: file={prov.get('file')}, row_or_page={prov.get('row_or_page')}, note={prov.get('note')}")
            else:
                print(f"  {fld}: null (not reported)")
                print(f"    Source JSON key path: investigations[id='{inv_id}'].{fld} = null")

