import re
import urllib.request

req = urllib.request.Request('https://psi.nasa.gov/physci/repo/main.5216219a85b99359.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as res:
    js = res.read().decode('utf-8', errors='ignore')

# Search for getDataURL definition
idx = js.find('getDataURL')
if idx != -1:
    print("Found getDataURL around index:", idx)
    print(js[max(0, idx - 200): min(len(js), idx + 500)])

# Search for s3Bucket assignments
matches = [m.start() for m in re.finditer(r's3Bucket', js)]
print(f"s3Bucket occurrences: {len(matches)}")
for m in matches[:5]:
    print("--- context ---")
    print(js[max(0, m - 100): min(len(js), m + 200)])

