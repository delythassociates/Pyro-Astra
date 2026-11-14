import re

with open('data/s3_index.html', 'r', encoding='utf-8') as f:
    s3_index = f.read()

# Also search the main bundle we fetched earlier or fetch and search it
import urllib.request

req = urllib.request.Request('https://psi.nasa.gov/physci/repo/main.5216219a85b99359.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as res:
    js = res.read().decode('utf-8', errors='ignore')

# Search for s3 occurrences
matches = set(re.findall(r'[\w\-.]+\.s3[\w\-.]*', js, re.IGNORECASE))
print("S3 domain matches in main.js:")
for m in sorted(matches):
    print("  ", m)

# Search for s3://
s3_uris = set(re.findall(r's3://[^\s\'"`]+', js, re.IGNORECASE))
print("s3:// URIs in main.js:")
for u in s3_uris:
    print("  ", u)

# Search for api endpoints for investigation metadata
inv_endpoints = set(re.findall(r'[\'"`][^\'"`]*(?:investigation|experiment|download|dataset)[^\'"`]*[\'"`]', js, re.IGNORECASE))
print(f"Investigation endpoints count: {len(inv_endpoints)}")
for e in sorted(inv_endpoints)[:20]:
    if any(k in e for k in ['http', 'api', '/']):
        print("  ", e)

