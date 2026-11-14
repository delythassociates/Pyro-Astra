import json

with open('data/analysis/readiness.json', 'r', encoding='utf-8') as f:
    r_data = json.load(f)

print("Summary counts:", r_data.get('summary'))
print("Sensitivity counts:", r_data.get('sensitivity_summary'))

for q in r_data.get('questions', []):
    print(f"\n[{q['id']}] Verdict: {q['verdict']}")
    print(f"  Req: {q['required_conditions']}")
    if q.get('evidence'):
        for ev in q['evidence']:
            print(f"  Evidence: {ev.get('record_id')} ({ev.get('acronym')}) - O2: {ev.get('tested_cabin_o2')}, P: {ev.get('tested_pressure_psi')}, Flow: {ev.get('tested_airflow_cm_s')}")
    else:
        print(f"  Reason: {q.get('reason')}")

