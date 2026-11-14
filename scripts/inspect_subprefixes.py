import boto3
from botocore import UNSIGNED
from botocore.client import Config

s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))

for top in ['DSI/', 'OASIS/', 'pk4/']:
    resp = s3.list_objects_v2(Bucket='nasa-psi', Prefix=top, Delimiter='/', MaxKeys=20)
    sub = [p['Prefix'] for p in resp.get('CommonPrefixes', [])]
    cnt = len(resp.get('Contents', []))
    print(f"Under {top}: {len(sub)} subprefixes, {cnt} direct objects")
    for s in sub[:10]:
        print(f"   {s}")

