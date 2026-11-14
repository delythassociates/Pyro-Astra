import boto3
from botocore import UNSIGNED
from botocore.client import Config

s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))

candidate_buckets = [
    'nasa-psi',
    'nasa-psi-data',
    'nasa-psi-combustion',
    'nasa-psi-public',
    'nasa-psi-repo',
    'nasa-physical-sciences',
    'psi-nasa',
    'nasa-open-data'
]

for b in candidate_buckets:
    try:
        resp = s3.list_objects_v2(Bucket=b, Delimiter='/', MaxKeys=5)
        print(f"Bucket '{b}': ACCESSIBLE! CommonPrefixes: {[p['Prefix'] for p in resp.get('CommonPrefixes', [])]}")
    except Exception as e:
        print(f"Bucket '{b}': {type(e).__name__} - {e}")

