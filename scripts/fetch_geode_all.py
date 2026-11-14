import urllib.request
import json
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
}

investigations = [
    'PSI-69',  # FLEX
    'PSI-68',  # FLEX-2
    'PSI-25',  # BASS-II
    'PSI-26',  # BASS
    'PSI-102', # SAME
    'PSI-101', # SAME-R
    'PSI-99',  # SAFFIRE-II
    'PSI-159'  # CFI-G
]

results = {}

for inv_id in investigations:
    url = f"https://psi.nasa.gov/geode-py/ws/repo/investigations/{inv_id}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            results[inv_id] = data
            print(f"SUCCESS {inv_id}: Title: '{data.get('title')}' Keys: {list(data.keys())[:10]}")
    except Exception as e:
        print(f"FAILED {inv_id}: {e}")

# Save sample to data/
with open('data/geode_sample_psi69.json', 'w') as f:
    if 'PSI-69' in results:
        json.dump(results['PSI-69'], f, indent=2)

