import boto3
from botocore import UNSIGNED
from botocore.client import Config

s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))

# Check pagination of list_objects_v2 with Delimiter='/'
resp = s3.list_objects_v2(Bucket='nasa-psi', Delimiter='/')
print("IsTruncated with Delimiter='/':", resp.get('IsTruncated'))
print("KeyCount:", resp.get('KeyCount'))
print("CommonPrefixes:", [p['Prefix'] for p in resp.get('CommonPrefixes', [])])
if 'NextContinuationToken' in resp:
    print("NextContinuationToken:", resp['NextContinuationToken'])

