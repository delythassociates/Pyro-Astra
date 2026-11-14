import json

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== DEEP INVESTIGATIONS IN data/investigations.json ===")
for inv in data:
    if inv.get('depth') == 'deep':
        print(f"ID: {inv['id']} ({inv.get('acronym')}) - {inv.get('name')}")
        print(f"  cabin_o2_pct: {json.dumps(inv.get('cabin_o2_pct'), indent=4)}")
        print(f"  burner_flow_o2_pct: {json.dumps(inv.get('burner_flow_o2_pct'), indent=4)}")
        print(f"  pressure_psi: {json.dumps(inv.get('pressure_psi'), indent=4)}")
        print(f"  airflow_speed_cm_s: {json.dumps(inv.get('airflow_speed_cm_s'), indent=4)}")
        print("-" * 50)

