import json

with open("analysis/questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

for q in questions:
    if q["id"] in ["Q02", "Q11"]:
        print(f"=== {q['id']} ===")
        print(f"Question: {q['question']}")
        print(f"Matched materials: {q.get('matched_materials')}")
        print(f"Matched investigations: {q.get('matched_investigations')}")
        print(f"Required params: {q.get('required_params')}")

with open("data/analysis/readiness.json", "r", encoding="utf-8") as f:
    readiness = json.load(f)

print("\nCurrent readiness evaluation for Q02 and Q11:")
for r in readiness.get("questions", []):
    if r["id"] in ["Q02", "Q11"]:
        print(f"\n{r['id']}: verdict = {r.get('verdict')}")
        print(f"  material_matched: {r.get('material_matched')}")
        print(f"  o2_covered: {r.get('o2_covered')}")
        print(f"  pressure_covered: {r.get('pressure_covered')}")
        print(f"  airflow_covered: {r.get('airflow_covered')}")
        print(f"  reason: {r.get('reason')}")
