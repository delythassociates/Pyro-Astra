import urllib.request
import urllib.parse

urls = [
    'https://psi.nasa.gov/datamanager/file/Home/psi-data/PSI-69/Experimental%20table/PSI-69_Experimental%20table_FLEX.csv',
    'https://psi.nasa.gov/geode-py/ws/file/Home/psi-data/PSI-69/Experimental%20table/PSI-69_Experimental%20table_FLEX.csv',
    'https://psi.nasa.gov/physci/repo/datamanager/file/Home/psi-data/PSI-69/Experimental%20table/PSI-69_Experimental%20table_FLEX.csv'
]

headers = {'User-Agent': 'Mozilla/5.0'}

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as res:
            data = res.read()
            print(f"SUCCESS {u}: Status {res.status}, Len {len(data)}")
            print("Preview:", data[:200])
    except urllib.error.HTTPError as e:
        print(f"HTTPError {u}: {e.code} {e.reason}")
    except Exception as e:
        print(f"Error {u}: {e}")

