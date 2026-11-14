import os
import hashlib
import csv

files = [
    ('PSI-25', 'raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv', 'utf-8-sig'),
    ('PSI-68', 'raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv', 'utf-8'),
    ('PSI-69', 'raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv', 'cp1252'),
    ('PSI-99', 'raw_real/PSI-99/experimental_table/PSI-99_Experimental table_SAFFIRE-2.csv', 'utf-8'),
    ('PSI-159', 'raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (1).csv', 'utf-8'),
    ('PSI-159-dup', 'raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (2).csv', 'utf-8'),
    ('PSI-26', 'raw_real/PSI-26/experimental_table/PSI-26_Experimental table_BASS.csv', 'utf-8-sig'),
    ('PSI-101', 'raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv', 'utf-8'),
    ('PSI-102', 'raw_real/PSI-102/experimental_table/PSI-102_Experimental table_SAME.csv', 'utf-8'),
]

entries = []
for psi_id, path, enc in files:
    with open(path, 'rb') as f:
        data = f.read()
        sha = hashlib.sha256(data).hexdigest()
        b = len(data)
    with open(path, 'r', encoding=enc) as f:
        r = csv.reader(f)
        header = next(r)
        rows = list(r)
        rc = len(rows)
    entries.append({
        'psi_id': psi_id,
        'path': path.replace('\\', '/'),
        'sha256': sha,
        'bytes': b,
        'row_count': rc,
        'columns': [c.strip() for c in header]
    })

# Write root manifest.sha256
with open('manifest.sha256', 'w', encoding='utf-8') as f:
    for e in entries:
        col_str = ', '.join(e['columns'])
        f.write(f"{e['sha256']}  {e['path']}\n")
        f.write(f"row_count: {e['row_count']}\n")
        f.write(f"columns: {col_str}\n\n")

print('Updated root manifest.sha256')

# Write per-folder manifest.sha256
for e in entries:
    if e['psi_id'] in ('PSI-25', 'PSI-159-dup'):
        continue
    folder = os.path.dirname(e['path'])
    m_path = os.path.join(folder, 'manifest.sha256')
    with open(m_path, 'w', encoding='utf-8') as f:
        f.write(f"# {e['psi_id']} Experimental Table Manifest\n")
        f.write(f"{e['sha256']}  {os.path.basename(e['path'])}\n")
        f.write(f"row_count: {e['row_count']}\n")
        f.write("columns:\n")
        for c in e['columns']:
            f.write(f"  - {c}\n")
    print(f"Wrote {m_path}")

# Update data/acquisition_log.csv
acq_path = 'data/acquisition_log.csv'
with open(acq_path, 'r', encoding='utf-8') as f:
    existing = f.read()

new_lines = []
for e in entries:
    if e['psi_id'] == 'PSI-25':
        continue # already in acquisition_log
    line = f"{e['path']},{e['bytes']},{e['sha256']},raw_real/DATASET-20261114T133018Z-1-001.zip,2026-11-14T13:30:18Z"
    if e['path'] not in existing:
        new_lines.append(line)

if new_lines:
    with open(acq_path, 'a', encoding='utf-8') as f:
        for l in new_lines:
            f.write(l + '\n')
    print(f"Appended {len(new_lines)} lines to {acq_path}")
