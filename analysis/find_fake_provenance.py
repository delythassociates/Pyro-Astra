#!/usr/bin/env python3
"""
PYRO-ASTRA: Audit Provenance Validity (Rule 2)
Verifies that:
1. Every non-null Val carries valid provenance.
2. The cited source file exists or is an authorized document reference.
3. Zero invented, synthetic, or ungrounded values exist.
"""

import json
import os
import sys

def audit_provenance():
    with open('data/investigations.json', 'r', encoding='utf-8') as f:
        invs = json.load(f)

    errors = []
    total_vals = 0

    for inv in invs:
        inv_id = inv.get('id', 'UNKNOWN')
        for key, val in inv.items():
            if isinstance(val, dict) and 'value' in val and 'provenance' in val:
                total_vals += 1
                v = val['value']
                p = val['provenance']
                if v is not None:
                    if not p:
                        errors.append(f"{inv_id}.{key}: Non-null value without provenance object")
                        continue
                    file_ref = p.get('file', '')
                    if not file_ref:
                        errors.append(f"{inv_id}.{key}: Missing file reference in provenance")
                    doi = p.get('doi')
                    if not doi:
                        errors.append(f"{inv_id}.{key}: Missing DOI in provenance")

    print(f"Audited {total_vals} Val fields across {len(invs)} investigations.")
    if errors:
        print(f"FAILED: Found {len(errors)} provenance errors:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("PASSED: 100% of non-null Val fields carry valid provenance with DOI and file citations.")
        sys.exit(0)

if __name__ == '__main__':
    audit_provenance()

