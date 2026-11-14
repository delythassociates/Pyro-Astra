import boto3
from botocore import UNSIGNED
from botocore.client import Config

s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))
resp = s3.get_object(Bucket='nasa-psi', Key='index.html')
content = resp['Body'].read().decode('utf-8', errors='ignore')

print("index.html size:", len(content))
print("Preview:")
print(content[:1000])

with open('data/s3_index.html', 'w', encoding='utf-8') as f:
    f.write(content)

