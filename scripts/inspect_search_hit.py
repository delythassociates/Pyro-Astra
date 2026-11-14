import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
}

url = "https://psi.nasa.gov/geode-py/ws/repo/search?term=PSI-69"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=10) as res:
    data = json.loads(res.read().decode('utf-8'))

hits = data.get('hits', {}).get('hits', [])
print(f"Total hits: {len(hits)}")
for h in hits:
    src = h.get('_source', {})
    print(f"Hit ID: {h.get('_id')}, Index: {h.get('_index')}, Type: {h.get('_type')}")
    print("  Title:", src.get('title'))
    print("  Accession:", src.get('accession'))
    print("  Files:", len(src.get('files', [])))
    print("  Available keys in source:", list(src.keys())[:15])

