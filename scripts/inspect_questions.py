import json

with open('analysis/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    investigations = json.load(f)

deep_invs = {inv['id']: inv for inv in investigations if inv.get('depth') == 'deep'}

print(f"Total questions: {len(questions)}")
for q in questions:
    req = q['required_conditions']
    print(f"[{q['id']}] {q['text']}")
    print(f"  Material: {req['material_class']}, Gravity: {req['gravity_regime']}")
    print(f"  Req O2: {req['o2_range']}, Req P: {req['pressure_range']}, Req Airflow: {req['airflow_range']}")
    print(f"  Source: {q['source']}")
    print("-" * 50)

