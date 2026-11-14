import json

with open("data/investigations.json", "r", encoding="utf-8") as f:
    invs = json.load(f)

for inv in invs:
    iid = inv.get("id")
    if iid in ["PSI-68", "PSI-69", "PSI-99"]:
        print(f"=== {iid} ({inv.get('acronym')}) ===")
        print("cabin_o2_pct:", json.dumps(inv.get("cabin_o2_pct"), indent=2))
        print("pressure_psi:", json.dumps(inv.get("pressure_psi"), indent=2))
        print("airflow_speed_cm_s:", json.dumps(inv.get("airflow_speed_cm_s"), indent=2))
        print("dual_sources:", json.dumps(inv.get("dual_sources"), indent=2))
        print()

