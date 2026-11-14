import boto3
from botocore import UNSIGNED
from botocore.client import Config

s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))

# List top-level common prefixes with delimiter='/'
paginator = s3.get_paginator('list_objects_v2')
pages = paginator.paginate(Bucket='nasa-psi', Delimiter='/')

prefixes = []
keys = []

for page in pages:
    if 'CommonPrefixes' in page:
        for p in page['CommonPrefixes']:
            prefixes.append(p['Prefix'])
    if 'Contents' in page:
        for c in page['Contents']:
            keys.append((c['Key'], c['Size']))

print(f"Top-level prefixes count: {len(prefixes)}")
for p in prefixes:
    print(f"  PRE {p}")

print(f"Top-level root keys count: {len(keys)}")
for k, s in keys[:20]:
    print(f"  KEY {k} ({s} bytes)")

# Save to data/s3_top_level.txt exactly as 'aws s3 ls --no-sign-request s3://nasa-psi/' would format it
with open('data/s3_top_level.txt', 'w', encoding='utf-8') as f:
    for p in prefixes:
        f.write(f"                           PRE {p}\n")
    for k, s in keys:
        f.write(f"                {s:>10} {k}\n")

