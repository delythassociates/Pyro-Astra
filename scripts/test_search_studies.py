import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
}

eps = [
    'https://psi.nasa.gov/geode-py/ws/studies/PSI-69',
    'https://psi.nasa.gov/geode-py/ws/repo/search?q=PSI-69',
    'https://psi.nasa.gov/geode-py/ws/repo/search?term=PSI-69',
    'https://psi.nasa.gov/geode-py/ws/repo/search?keywords=PSI-69',
    'https://psi.nasa.gov/geode-py/ws/repo/filter-options'
]

for ep in eps:
    try:
        req = urllib.request.Request(ep, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as res:
            content = res.read().decode('utf-8')
            print(f"SUCCESS {ep}: Status {res.status}, Len {len(content)}")
            print("Preview:", content[:200])
    except urllib.error.HTTPError as e:
        print(f"HTTPError {ep}: {e.code} {e.reason}")
    except Exception as e:
        print(f"Error {ep}: {e}")

