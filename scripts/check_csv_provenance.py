import json
import re

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for inv in data:
    inv_id = inv.get('id')
    inv_str = json.dumps(inv)
    csvs = set(re.findall(r'[\w\-]+\.csv', inv_str))
    if csvs:
        print(f"{inv_id}: {csvs}")

