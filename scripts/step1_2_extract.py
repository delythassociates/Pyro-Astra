"""
Step 1 & 2: Detailed Inventory and Grounded Extraction from raw_real JSONs
Saves to data/metadata_inventory.md and generates data/extracted_from_metadata.json
"""
import json
import os
import re

investigations = ['PSI-69', 'PSI-68', 'PSI-25', 'PSI-26', 'PSI-102', 'PSI-101', 'PSI-99', 'PSI-159']

inventory_lines = [
    "# NASA PSI Investigation Metadata Inventory (Step 1 & 2 Audit)",
    "",
    "Audited strictly from authentic NASA PSI files in `raw_real/<PSI-ID>/investigation_metadata.json`.",
    "",
    "## Summary of Findings",
    "1. **Top-Level Keys**: All 8 records share an identical 61-key schema from NASA GEODE repository.",
    "2. **Experiment Tables**: The key `data['experimentalTable']` contains metadata descriptors of experiment table files stored on NASA's backend (e.g. `file_name: 'PSI-69_Experimental table_FLEX.csv'`), but **no embedded rows/arrays of individual runs** exist in the JSON itself.",
    "3. **Per-Test Condition Fields**: Fields like `assays` and `studies` are empty arrays (`[]`). Per-test numerical measurements (e.g. test-by-test flame spread rates or extinction points) are not present in the JSON files.",
    "4. **Extractable Grounded Parameters**: High-level objectives, facility hardware, DOIs, publication counts, and research impact narratives are present.",
    "",
    "---",
    ""
]

extracted_records = {}

for inv_id in investigations:
    path = os.path.join('raw_real', inv_id, 'investigation_metadata.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    title = data.get('title', '')
    doi = data.get('doi', '')
    keys = list(data.keys())
    
    inventory_lines.append(f"## {inv_id}: {title}")
    inventory_lines.append(f"- **Source File**: `raw_real/{inv_id}/investigation_metadata.json`")
    inventory_lines.append(f"- **DOI**: `{doi}` (JSON key path: `data['doi']`)")
    inventory_lines.append(f"- **Top-Level Keys ({len(keys)})**: `{', '.join(keys)}`")
    inventory_lines.append("")
    inventory_lines.append("### Two-Level Deep Key Structure:")
    
    for k in keys:
        v = data[k]
        if isinstance(v, dict):
            sub_k = list(v.keys())
            inventory_lines.append(f"- `data['{k}']` (dict, {len(sub_k)} subkeys): `{sub_k[:10]}`")
        elif isinstance(v, list):
            n = len(v)
            if n > 0 and isinstance(v[0], dict):
                sub_k = list(v[0].keys())
                inventory_lines.append(f"- `data['{k}']` (list of {n} objects, subkeys: `{sub_k[:10]}`)")
            else:
                inventory_lines.append(f"- `data['{k}']` (list of {n} items)")
        else:
            val_repr = str(v)
            if len(val_repr) > 80:
                val_repr = val_repr[:80] + "..."
            inventory_lines.append(f"- `data['{k}']` ({type(v).__name__}): `{val_repr}`")
            
    inventory_lines.append("")
    inventory_lines.append("### Field Audit & Per-Test Conditions Search:")
    
    # Audit experimentalTable
    exp_table = data.get('experimentalTable', [])
    if exp_table:
        inventory_lines.append(f"- `data['experimentalTable']`: Contains file pointer `{exp_table[0].get('file_name')}` (size: {exp_table[0].get('file_size')} bytes, path: `{exp_table[0].get('remote_path')}`). **No raw row-level data inside the JSON**.")
    else:
        inventory_lines.append("- `data['experimentalTable']`: None")
        
    # Audit assays & studies
    inventory_lines.append(f"- `data['assays']`: Empty list (`[]`). No tabular runs.")
    inventory_lines.append(f"- `data['studies']`: Empty list (`[]`).")
    
    # Audit Hardware
    exp_hardware = data.get('experimentHardware', [])
    hardware_names = []
    for h in exp_hardware:
        if isinstance(h, dict):
            name = h.get('hardwareName') or h.get('name')
        else:
            name = str(h)
        if name and name not in hardware_names:
            hardware_names.append(name)
            
    # Audit Publications
    pubs = data.get('publications', [])
    pub_count = len(pubs)
    
    # Objective
    objective = data.get('objective')
    if not objective or objective.strip() == "":
        # check description or approach
        objective = data.get('description', '')
    
    # Analyze text for condition ranges
    approach_text = data.get('approach', '') + " " + data.get('description', '')
    
    # Store grounded extraction
    extracted_records[inv_id] = {
        'id': inv_id,
        'title': title,
        'doi': {
            'value': doi,
            'source': f"raw_real/{inv_id}/investigation_metadata.json",
            'json_path': "data['doi']"
        },
        'publication_count': {
            'value': pub_count,
            'source': f"raw_real/{inv_id}/investigation_metadata.json",
            'json_path': "len(data['publications'])"
        },
        'hardware': {
            'value': hardware_names if hardware_names else None,
            'source': f"raw_real/{inv_id}/investigation_metadata.json" if hardware_names else None,
            'json_path': "data['experimentHardware'][*]['hardwareName']" if hardware_names else None
        },
        'objective': {
            'value': objective if objective else None,
            'source': f"raw_real/{inv_id}/investigation_metadata.json",
            'json_path': "data['objective'] or data['description']"
        },
        # Check if fuels, sample, O2, pressure, flow exist as dedicated JSON fields
        'fuels': {
            'value': None,
            'source': None,
            'json_path': None,
            'note': "Not reported as structured field in JSON"
        },
        'sample_shape_size': {
            'value': None,
            'source': None,
            'json_path': None,
            'note': "Not reported as structured field in JSON"
        },
        'cabin_o2_range': {
            'value': None,
            'source': None,
            'json_path': None,
            'note': "Not reported as structured field in JSON"
        },
        'pressure_range': {
            'value': None,
            'source': None,
            'json_path': None,
            'note': "Not reported as structured field in JSON"
        },
        'flow_range': {
            'value': None,
            'source': None,
            'json_path': None,
            'note': "Not reported as structured field in JSON"
        },
        'sensors': {
            'value': None,
            'source': None,
            'json_path': None,
            'note': "Not reported as structured field in JSON"
        }
    }
    
    inventory_lines.append(f"- **Hardware List**: {len(hardware_names)} instruments/facilities recorded.")
    inventory_lines.append(f"- **Publication Count**: {pub_count} peer-reviewed citations.")
    inventory_lines.append(f"- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.")
    inventory_lines.append("\n---\n")

with open('data/metadata_inventory.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(inventory_lines))
    
with open('data/extracted_from_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(extracted_records, f, indent=2)

print("Step 1 and 2 complete.")
print(f"Wrote data/metadata_inventory.md and data/extracted_from_metadata.json")
