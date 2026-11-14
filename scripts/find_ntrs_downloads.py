import urllib.request
import json
import hashlib
import os

os.makedirs('raw_real/reports', exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

# 1. Check citation API for 20210011385
url_tm = "https://ntrs.nasa.gov/api/citations/20210011385"
req = urllib.request.Request(url_tm, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as res:
        meta = json.loads(res.read().decode('utf-8'))
        print("TM-20210011385 title:", meta.get('title'))
        downloads = meta.get('downloads', [])
        print("Downloads:", downloads)
except Exception as e:
    print("Error fetching TM-20210011385 citation:", e)

# 2. Search NTRS API for TP-2015-218570
url_search = "https://ntrs.nasa.gov/api/citations/search?q=2015-218570"
req2 = urllib.request.Request(url_search, headers=headers)
try:
    with urllib.request.urlopen(req2, timeout=10) as res:
        search_res = json.loads(res.read().decode('utf-8'))
        results = search_res.get('results', [])
        print(f"Search results for TP-2015-218570: {len(results)}")
        for r in results[:3]:
            print(f"  ID: {r.get('id')} Title: {r.get('title')} Downloads: {r.get('downloads')}")
except Exception as e:
    print("Error searching NTRS:", e)

