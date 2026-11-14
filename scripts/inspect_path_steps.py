import json

with open('data/analysis/path.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for s in d.get('path_steps', []):
    if s['step'] in [0, 50, 100]:
        print(f"Step {s['step']}:")
        print(json.dumps(s, indent=2))
