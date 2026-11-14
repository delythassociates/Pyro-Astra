import json
import os
import re

ids = ['PSI-102', 'PSI-101', 'PSI-26', 'PSI-25', 'PSI-99', 'PSI-69', 'PSI-159', 'PSI-68']

functions = {
    'detection': ['smoke', 'detector', 'detection', 'aerosol', 'particulate'],
    'suppression': ['suppression', 'extinguish', 'fire extinguishing', 'extinguishment', 'suppressant', 'suppress'],
    'material_screening': ['NASA-STD-6001', 'screening', 'materials selection', 'standard test method', 'standard test'],
    'fire_growth_spread': ['fire grow', 'flame spread', 'fire growth', 'spread rate', 'flame propagation', 'growth', 'spread'],
    'ventilation_airflow': ['airflow', 'ventilation', 'convection', 'forced flow', 'flow duct', 'convective flow', 'low-velocity flows', 'flow velocity'],
    'extinction_limits': ['extinction', 'limiting oxygen', 'extinction limits', 'quench', 'flammability boundary', 'extinction limit']
}

for inv_id in ids:
    p = os.path.join('raw_real', inv_id, 'investigation_metadata.json')
    with open(p, 'r', encoding='utf-8') as f:
        meta = json.load(f)
    print(f"=== {inv_id} ===")
    for f_id, kws in functions.items():
        found = False
        for field in ['objective', 'hypothesis', 'approach', 'researchImpacts', 'title', 'experimentHardware']:
            text = meta.get(field)
            if not text or not isinstance(text, str):
                continue
            for kw in kws:
                pattern = rf'([^.?!;\n]*?\b{re.escape(kw)}\b[^.?!;\n]*)'
                m = re.search(pattern, text, re.IGNORECASE)
                if m:
                    quote = m.group(0).strip()
                    if len(quote) > 15:
                        # Ensure verbatim match
                        if quote in text:
                            print(f"  [{f_id}] field='{field}': \"{quote[:60]}...\"")
                            found = True
                            break
            if found:
                break
        if not found:
            print(f"  [{f_id}] EMPTY CELL")
