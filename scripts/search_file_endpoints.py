import re
import urllib.request

req = urllib.request.Request('https://psi.nasa.gov/physci/repo/main.5216219a85b99359.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as res:
    js = res.read().decode('utf-8', errors='ignore')

# Search for /geode-py/ws/
matches = set(re.findall(r'[\'"`]/geode-py/ws/[^\'"`]+[\'"`]', js))
print(f"geode-py endpoints count: {len(matches)}")
for m in sorted(matches):
    print("  ", m)

# Search for file listing endpoints
file_eps = set(re.findall(r'[\'"`][^\'"`]*(?:file|download|tree)[^\'"`]*[\'"`]', js))
print(f"File/download/tree occurrences: {len(file_eps)}")
for f in sorted(file_eps)[:25]:
    if any(k in f for k in ['/geode', '/physci', 'api']):
        print("   ->", f)

