import re
import urllib.request

req = urllib.request.Request('https://psi.nasa.gov/physci/repo/main.5216219a85b99359.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as res:
    js = res.read().decode('utf-8', errors='ignore')

matches = [m.start() for m in re.finditer(r'getDataURL\s*\(', js)]
print(f"getDataURL definitions: {len(matches)}")
for m in matches:
    print("--- def ---")
    print(js[max(0, m - 100): min(len(js), m + 300)])

