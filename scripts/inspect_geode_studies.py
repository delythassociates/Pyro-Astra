import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
}

investigations = ['PSI-69', 'PSI-68', 'PSI-25', 'PSI-26', 'PSI-102', 'PSI-101', 'PSI-99', 'PSI-159']

for inv_id in investigations:
    url = f"https://psi.nasa.gov/geode-py/ws/repo/investigations/{inv_id}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as res:
        data = json.loads(res.read().decode('utf-8'))
        
    print(f"=== {inv_id}: {data.get('title')} ===")
    print("  totalFileSize:", data.get('totalFileSize'))
    print("  studies count:", len(data.get('studies', [])))
    print("  assays count:", len(data.get('assays', [])))
    
    # Check studies
    for st in data.get('studies', []):
        print(f"    Study: {st.get('accession')} - {st.get('title')}")
        # check if study has assays or files
        print(f"      assays in study: {len(st.get('assays', []))}")
        print(f"      files in study: {len(st.get('files', []))}")

