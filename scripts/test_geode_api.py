import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
}

endpoints = [
    'https://psi.nasa.gov/geode-py/ws/repo/investigation/PSI-69',
    'https://psi.nasa.gov/geode-py/ws/repo/investigation/69',
    'https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-69',
    'https://psi.nasa.gov/geode-py/ws/repo/investigation/PSI-102',
    'https://psi.nasa.gov/geode-py/ws/repo/investigation/PSI-25',
    'https://psi.nasa.gov/geode-py/ws/repo/investigations'
]

for ep in endpoints:
    try:
        req = urllib.request.Request(ep, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as res:
            content = res.read().decode('utf-8')
            print(f"SUCCESS {ep}: Status {res.status}, Length {len(content)}")
            print("Preview:", content[:300])
    except urllib.error.HTTPError as e:
        print(f"HTTPError {ep}: {e.code} {e.reason}")
    except Exception as e:
        print(f"Error {ep}: {e}")

