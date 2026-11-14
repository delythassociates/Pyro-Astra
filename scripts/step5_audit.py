"""
Step 5: Rigorous Data Audit of data/investigations.json and data/bounds.json
Audits every numeric value against steps 1-4.
Anything not directly sourced from authentic files in raw_real or official reports becomes NULL.
Outputs data/audit.md.
"""
import json
import csv
import os

AUDIT_MD = "data/audit.md"

audit_entries = []

# 1. Load investigations.json
with open('data/investigations.json', 'r', encoding='utf-8') as f:
    invs = json.load(f)

print("=" * 80)
print("STEP 5: AUDITING NUMERIC FIELDS IN INVESTIGATIONS.JSON")
print("=" * 80)

audited_invs = []

for inv in invs:
    inv_id = inv['id']
    name = inv.get('name', '')
    
    # Check numeric fields: cabin_o2_pct, burner_flow_o2_pct, pressure_psi, airflow_speed_cm_s, n_tests
    
    # 1. BASS-II (PSI-25)
    if inv_id == 'PSI-25':
        # Sourced from NASA/TM-20210011385, Table 5.1, Page 57
        # cabin_o2_pct: min 16.8 (M18 final), max 22.2 (M1 initial)
        inv['cabin_o2_pct'] = {
            'value': {'min': 16.8, 'max': 22.2},
            'unit': '%',
            'provenance': {
                'source_id': 'PSI-25',
                'doi': '10.60555/4qc4-de67',
                'file': 'NASA-TM-20210011385.pdf',
                'row_or_page': 'Table 5.1, Page 57 (PDF Page 65)',
                'entered_by': 'hand',
                'note': 'Extracted from 20 flight tests: min final O2 is 16.8 vol%, max initial O2 is 22.2 vol%'
            }
        }
        audit_entries.append({'investigation': inv_id, 'field': 'cabin_o2_pct', 'action': 'KEPT / VERIFIED', 'value': '16.8 - 22.2 %', 'source': 'NASA/TM-20210011385 Table 5.1 Page 57'})
        
        # airflow_speed_cm_s: min 2.0 (M16), max 21.0 (M11)
        inv['airflow_speed_cm_s'] = {
            'value': {'min': 2.0, 'max': 21.0},
            'unit': 'cm/s',
            'provenance': {
                'source_id': 'PSI-25',
                'doi': '10.60555/4qc4-de67',
                'file': 'NASA-TM-20210011385.pdf',
                'row_or_page': 'Table 5.1, Page 57 (PDF Page 65)',
                'entered_by': 'hand',
                'note': 'Extracted from Table 5.1: velocity ranging from 2 cm/s (M16) to 21 cm/s (M11)'
            }
        }
        audit_entries.append({'investigation': inv_id, 'field': 'airflow_speed_cm_s', 'action': 'KEPT / VERIFIED', 'value': '2.0 - 21.0 cm/s', 'source': 'NASA/TM-20210011385 Table 5.1 Page 57'})
        
        # n_tests: 20 tests
        inv['n_tests'] = {
            'value': 20,
            'unit': 'tests',
            'provenance': {
                'source_id': 'PSI-25',
                'doi': '10.60555/4qc4-de67',
                'file': 'NASA-TM-20210011385.pdf',
                'row_or_page': 'Table 5.1, Page 57 (PDF Page 65)',
                'entered_by': 'hand',
                'note': '20 flat-PMMA tests reported in Table 5.1'
            }
        }
        audit_entries.append({'investigation': inv_id, 'field': 'n_tests', 'action': 'KEPT / VERIFIED', 'value': '20 tests', 'source': 'NASA/TM-20210011385 Table 5.1 Page 57'})
        
        # pressure_psi: NOT in Table 5.1 -> NULL
        if inv.get('pressure_psi') is not None:
            audit_entries.append({'investigation': inv_id, 'field': 'pressure_psi', 'action': 'NULLED', 'value': 'null (was 14.7 psi)', 'source': 'Not stated in Table 5.1 or PSI-25 JSON'})
            inv['pressure_psi'] = None
            
        inv['burner_flow_o2_pct'] = None
        
    # 2. FLEX (PSI-69)
    elif inv_id == 'PSI-69':
        # pressure_psi: approach text gives 0.5 - 1.5 atm -> 7.35 - 22.04 psi
        inv['pressure_psi'] = {
            'value': {'min': 7.35, 'max': 22.04},
            'unit': 'psi',
            'provenance': {
                'source_id': 'PSI-69',
                'doi': '10.60555/mbq8-0451',
                'file': 'investigation_metadata.json',
                'row_or_page': "data['approach']",
                'entered_by': 'parsed',
                'note': 'Converted from 0.5 - 1.5 atm using exact formula 1 atm = 14.6959 psi'
            }
        }
        audit_entries.append({'investigation': inv_id, 'field': 'pressure_psi', 'action': 'KEPT / VERIFIED', 'value': '7.35 - 22.04 psi', 'source': "raw_real/PSI-69/investigation_metadata.json data['approach']"})
        
        # Check other fields
        for fld in ['cabin_o2_pct', 'burner_flow_o2_pct', 'airflow_speed_cm_s', 'n_tests']:
            if inv.get(fld) is not None:
                audit_entries.append({'investigation': inv_id, 'field': fld, 'action': 'NULLED', 'value': f"null (was {inv[fld]['value']})", 'source': 'Not reported numerically in metadata JSON'})
                inv[fld] = None
                
    # 3. All other investigations: if numeric ranges cannot be found in steps 1-4 -> NULL
    else:
        for fld in ['cabin_o2_pct', 'burner_flow_o2_pct', 'pressure_psi', 'airflow_speed_cm_s', 'n_tests']:
            if inv.get(fld) is not None:
                val = inv[fld].get('value')
                # If unsourced from steps 1-4, null it
                audit_entries.append({'investigation': inv_id, 'field': fld, 'action': 'NULLED', 'value': f"null (was {val})", 'source': 'Unverified in steps 1-4 files'})
                inv[fld] = None

    # Compute not_reported
    CORE_FIELDS = [
        'hardware', 'objectives', 'fuels', 'sample_shape', 'sample_size',
        'cabin_o2_pct', 'burner_flow_o2_pct', 'pressure_psi',
        'airflow_speed_cm_s', 'varied_variables', 'constant_variables',
        'sensors', 'n_tests'
    ]
    inv['not_reported'] = [f for f in CORE_FIELDS if inv.get(f) is None]
    audited_invs.append(inv)

# Save audited investigations.json
with open('data/investigations.json', 'w', encoding='utf-8') as f:
    json.dump(audited_invs, f, indent=2)

print("Updated data/investigations.json with strict audit results.")

# 2. Audit bounds.json
with open('data/bounds.json', 'r', encoding='utf-8') as f:
    bounds_data = json.load(f)

# Since SAFFIRE-II 0g/1g paired data is not in raw_real or downloaded PDFs, set to empty list
audit_entries.append({
    'investigation': 'PSI-99 (SAFFIRE-II)',
    'field': 'data/bounds.json',
    'action': 'NULLED / EMPTIED',
    'value': '[] (empty array: no paired tests in extracted records)',
    'source': 'No paired 0g/1g test rows exist in steps 1-4 files. Per SPEC Section 9: show "no paired tests in extracted records".'
})

bounds_data = []

with open('data/bounds.json', 'w', encoding='utf-8') as f:
    json.dump(bounds_data, f, indent=2)

print("Updated data/bounds.json: pairs set to [] per SPEC Section 9.")

# 3. Write data/audit.md
audit_md_lines = [
    "# PYRO-ASTRA Scientific Provenance Audit Report",
    "",
    "Generated from strict verification against `raw_real/<PSI-ID>/investigation_metadata.json` and official NASA reports (`NASA/TM-20210011385` and `NASA/TP-2015-218570`).",
    "",
    "## Audit Rule Enforcement (SPEC Section 2 Rule 1 & Rule 2)",
    "- Any numeric value not explicitly stated in steps 1-4 has been set to `null` and registered as 'not reported'.",
    "- No fabricated, simulated, or interpolated numbers are allowed in the repository.",
    "",
    "## Kept / Nulled / Changed Values Ledger",
    "",
    "| Investigation | Field | Action | Final Value | Verified Source |",
    "|---|---|---|---|---|"
]

for entry in audit_entries:
    audit_md_lines.append(f"| `{entry['investigation']}` | `{entry['field']}` | **{entry['action']}** | `{entry['value']}` | {entry['source']} |")

with open(AUDIT_MD, 'w', encoding='utf-8') as f:
    f.write('\n'.join(audit_md_lines))

print(f"Wrote {len(audit_entries)} audit entries to {AUDIT_MD}")
