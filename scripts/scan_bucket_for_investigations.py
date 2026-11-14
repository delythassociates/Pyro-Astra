import boto3
from botocore import UNSIGNED
from botocore.client import Config

s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))

keywords = ['FLEX', 'BASS', 'SAME', 'SAFFIRE', 'CFI', 'PSI-69', 'PSI-68', 'PSI-25', 'PSI-26', 'PSI-102', 'PSI-101', 'PSI-99', 'PSI-159']

paginator = s3.get_paginator('list_objects_v2')
pages = paginator.paginate(Bucket='nasa-psi')

matching_keys = []
total_objects = 0

for page in pages:
    contents = page.get('Contents', [])
    total_objects += len(contents)
    for c in contents:
        k = c['Key']
        k_upper = k.upper()
        for kw in keywords:
            if kw in k_upper:
                matching_keys.append((k, c['Size']))
                print(f"MATCH: {k} ({c['Size']} bytes)")
                break

print(f"Total objects scanned in s3://nasa-psi/: {total_objects}")
print(f"Total matching objects found: {len(matching_keys)}")

