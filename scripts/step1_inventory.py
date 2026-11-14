import json
import os

investigations = ['PSI-69', 'PSI-68', 'PSI-25', 'PSI-26', 'PSI-102', 'PSI-101', 'PSI-99', 'PSI-159']

inventory_md = "# NASA PSI Investigation Metadata Inventory (Two Levels Deep)\n\n"
inventory_md += "Generated from authentic files in `/raw_real/<PSI-ID>/investigation_metadata.json`.\n\n"

print("=" * 80)
print("STEP 1: METADATA STRUCTURE & EXPERIMENT TABLE AUDIT")
print("=" * 80)

for inv_id in investigations:
    path = os.path.join('raw_real', inv_id, 'investigation_metadata.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    title = data.get('title', '')
    top_keys = list(data.keys())
    
    print(f"\n--- {inv_id}: {title} ---")
    print(f"Top-level keys ({len(top_keys)}): {top_keys}")
    
    inventory_md += f"## {inv_id}: {title}\n"
    inventory_md += f"- **File**: `raw_real/{inv_id}/investigation_metadata.json`\n"
    inventory_md += f"- **DOI**: `{data.get('doi')}`\n"
    inventory_md += f"- **Top-Level Keys ({len(top_keys)})**: `{', '.join(top_keys)}`\n\n"
    inventory_md += "### Structure (Two Levels Deep):\n\n"
    
    has_experiment_table = False
    has_per_test_conditions = False
    condition_findings = []
    
    for k in top_keys:
        v = data[k]
        if isinstance(v, dict):
            subkeys = list(v.keys())
            inventory_md += f"- `data['{k}']` (dict, {len(subkeys)} keys): `{subkeys[:15]}`\n"
        elif isinstance(v, list):
            n_items = len(v)
            if n_items > 0 and isinstance(v[0], dict):
                sample_subkeys = list(v[0].keys())
                inventory_md += f"- `data['{k}']` (list of {n_items} objects, item keys): `{sample_subkeys[:15]}`\n"
                # Check if this list contains runs, samples, or tests
                if any(x in k.lower() for x in ['run', 'sample', 'test', 'assay', 'condition', 'measurement']):
                    condition_findings.append(f"List key `{k}` contains {n_items} items")
            else:
                inventory_md += f"- `data['{k}']` (list of {n_items} primitives)\n"
        else:
            val_str = str(v)
            if len(val_str) > 60:
                val_str = val_str[:60] + "..."
            inventory_md += f"- `data['{k}']` ({type(v).__name__}): `{val_str}`\n"
            
        # Search for per-test condition keywords
        k_lower = k.lower()
        if any(term in k_lower for term in ['pressure', 'oxygen', 'o2', 'flow', 'fuel', 'diameter', 'sensor', 'table', 'sample', 'assay', 'run']):
            condition_findings.append(f"Key `{k}` ({type(v).__name__})")
            
    # Check text fields like approach and description for embedded mentions of conditions
    approach = data.get('approach', '')
    desc = data.get('description', '')
    
    inventory_md += "\n### Field Content & Experiment Table Assessment:\n"
    
    # Check assays and studies specifically
    assays = data.get('assays', [])
    studies = data.get('studies', [])
    
    if len(assays) > 0:
        has_experiment_table = True
        inventory_md += f"- **Assays**: Found {len(assays)} entries.\n"
    else:
        inventory_md += "- **Assays**: Empty list (`[]`). No structured assay table in this JSON.\n"
        
    if len(studies) > 0:
        has_experiment_table = True
        inventory_md += f"- **Studies**: Found {len(studies)} entries.\n"
    else:
        inventory_md += "- **Studies**: Empty list (`[]`). No structured study table in this JSON.\n"
        
    inventory_md += f"- **Per-test conditions in JSON fields**: "
    if condition_findings:
        inventory_md += f"Potentially related keys: {', '.join(condition_findings)}. However, none represent tabular per-test condition arrays.\n"
    else:
        inventory_md += "None. The JSON contains high-level investigation metadata (description, approach text, hardware list, publication list, contacts, DOI), NOT an array of individual test runs.\n"
        
    inventory_md += f"- **Summary**: No individual test run rows or condition tables exist inside `investigation_metadata.json` for {inv_id}.\n\n"

with open('data/metadata_inventory.md', 'w', encoding='utf-8') as f:
    f.write(inventory_md)

print("\nInventory saved to data/metadata_inventory.md")

