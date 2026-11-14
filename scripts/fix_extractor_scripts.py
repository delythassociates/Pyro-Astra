import os
import re

files_to_clean = [
    'scripts/extract-psi-101.py',
    'scripts/extract-psi-102.py',
    'scripts/extract-psi-159.py',
    'scripts/extract-psi-26.py',
    'scripts/extract-psi-68.py',
    'scripts/extract-psi-69.py',
    'scripts/extract-psi-99.py'
]

# Map of fake csv to authentic replacement
for fpath in files_to_clean:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace any *.csv with investigation_metadata.json
    # Except if it's bass2_table_5_1.csv or investigations.csv
    new_content = re.sub(r'\"([A-Za-z0-9_\-]+)\.csv\"', r'"investigation_metadata.json"', content)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Cleaned {fpath}")


