import urllib.request
import re

url = 'https://psi.nasa.gov/physci/repo/main.5216219a85b99359.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=15) as res:
        js = res.read().decode('utf-8', errors='ignore')
    print('Fetched JS, length:', len(js))
    
    # Search for api paths
    api_paths = set(re.findall(r'[\'"`](/physci/repo/[^\'"`]+|api/[^\'"`]+)[\'"`]', js))
    print('Potential API paths:')
    for p in sorted(api_paths)[:30]:
        print('  ', p)
except Exception as e:
    print('Error:', e)
