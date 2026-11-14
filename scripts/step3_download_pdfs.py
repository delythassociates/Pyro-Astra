"""
Step 3: Download official NASA PDFs from ntrs.nasa.gov
1. NASA/TM-20210011385: BASS-II Summary Report
2. NASA/TP-2015-218570: Life Support Baseline Values and Assumptions Document
Computes SHA-256 and logs to data/acquisition_log.csv
"""
import urllib.request
import urllib.error
import hashlib
import os
import csv
from datetime import datetime

os.makedirs('raw_real/reports', exist_ok=True)

REPORTS = [
    {
        'id': 'NASA-TM-20210011385',
        'citation_id': '20210011385',
        'url': 'https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf',
        'filename': 'raw_real/reports/NASA-TM-20210011385.pdf'
    },
    {
        'id': 'NASA-TP-2015-218570',
        'citation_id': '20150002905',
        'url': 'https://ntrs.nasa.gov/api/citations/20150002905/downloads/20150002905.pdf',
        'filename': 'raw_real/reports/NASA-TP-2015-218570.pdf'
    }
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

log_entries = []

for rep in REPORTS:
    url = rep['url']
    dest = rep['filename']
    print(f"Downloading {rep['id']} from {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as res:
            data = res.read()
            with open(dest, 'wb') as f:
                f.write(data)
                
        size = len(data)
        h = hashlib.sha256(data).hexdigest()
        print(f"  SUCCESS: {dest} ({size} bytes, sha256: {h})")
        
        log_entries.append({
            'path': dest,
            'bytes': size,
            'sha256': h,
            'source': url,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })
    except urllib.error.HTTPError as e:
        print(f"  [ERROR] HTTPError downloading {rep['id']}: {e.code} {e.reason}")
        raise e
    except Exception as e:
        print(f"  [ERROR] Failed to download {rep['id']}: {e}")
        raise e

# Append to data/acquisition_log.csv
log_file = 'data/acquisition_log.csv'
fieldnames = ['path', 'bytes', 'sha256', 'source', 'timestamp']

with open(log_file, 'a', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    for entry in log_entries:
        writer.writerow(entry)

print(f"\nAppended {len(log_entries)} report entries to {log_file}")

