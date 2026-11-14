import csv
import re

with open('data/bass2_table_5_1.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Total rows in Table 5.1: {len(rows)}")
for i in range(min(3, len(rows))):
    print(f"Row {i+1}: {rows[i]}")

print("\n=== MIN / MAX PER COLUMN ===")
headers = reader.fieldnames
for h in headers:
    vals = [r[h] for r in rows if r[h] != '']
    # Extract numbers if possible
    num_vals = []
    for v in vals:
        nums = re.findall(r"[-+]?\d*\.\d+|\d+", v)
        for n in nums:
            try:
                num_vals.append(float(n))
            except ValueError:
                pass
    if num_vals:
        print(f"{h}: min = {min(num_vals)}, max = {max(num_vals)} (raw unique sample: {list(set(vals))[:5]})")
    else:
        print(f"{h}: non-numeric (values: {list(set(vals))[:3]})")

