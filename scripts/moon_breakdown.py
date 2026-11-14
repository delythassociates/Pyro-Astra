import glob
import json
import os

results = []
for tr_file in sorted(glob.glob('data/table_runs/PSI-*.json')):
    if 'PSI-142' in tr_file or 'PSI-117' in tr_file:
        continue
    with open(tr_file, 'r', encoding='utf-8') as f:
        d = json.load(f)
    runs = d.get('runs', [])
    if not runs:
        continue
    psi = os.path.basename(tr_file).replace('.json', '')
    
    both_cabin = 0
    both_burner = 0
    neither = 0
    o2_only = 0
    p_only = 0
    
    for r in runs:
        mf = r.get('mapped_fields', {})
        p = mf.get('pressure_psi')
        
        # Check O2
        if psi in ['PSI-159', 'PSI-10']:
            bo2 = mf.get('burner_flow_o2_pct') or mf.get('o2_initial_pct') or mf.get('o2_initial_mole_fraction')
            if bo2 is not None and p is not None:
                both_burner += 1
            elif bo2 is not None:
                o2_only += 1
            elif p is not None:
                p_only += 1
            else:
                neither += 1
        else:
            co2 = mf.get('cabin_o2_pct') or mf.get('o2_initial_pct') or mf.get('o2_initial_mole_fraction')
            if co2 is not None and p is not None:
                both_cabin += 1
            elif co2 is not None:
                o2_only += 1
            elif p is not None:
                p_only += 1
            else:
                neither += 1
                
    results.append({
        'psi': psi,
        'total': len(runs),
        'both_cabin': both_cabin,
        'both_burner': both_burner,
        'o2_only': o2_only,
        'p_only': p_only,
        'neither': neither
    })

# Also check BASS-II
with open('data/bass2_runs.json', 'r', encoding='utf-8') as f:
    b2_data = json.load(f)
b2_runs = b2_data if isinstance(b2_data, list) else b2_data.get('runs', [])
results.insert(0, {
    'psi': 'PSI-25',
    'total': len(b2_runs),
    'both_cabin': 0,
    'both_burner': 0,
    'o2_only': len(b2_runs), # Initial O2 reported, pressure is null
    'p_only': 0,
    'neither': 0
})

print(f"{'Investigation':<16} | {'Total':<6} | {'Both Cabin':<11} | {'Both Burner':<12} | {'Neither / O2 only':<20}")
print("-" * 75)
sum_both_cabin = 0
sum_both_burner = 0
for r in results:
    sum_both_cabin += r['both_cabin']
    sum_both_burner += r['both_burner']
    status = ""
    if r['both_cabin'] > 0:
        status = f"{r['both_cabin']} cabin rows"
    elif r['both_burner'] > 0:
        status = f"{r['both_burner']} burner rows"
    else:
        status = "0 (pressure null)"
    print(f"{r['psi']:<16} | {r['total']:<6} | {r['both_cabin']:<11} | {r['both_burner']:<12} | {status:<20}")

print("-" * 75)
print(f"Total rows reporting both Cabin O2 & Pressure   : {sum_both_cabin}")
print(f"Total rows reporting both Burner O2 & Pressure  : {sum_both_burner}")
print(f"Grand Total reporting both O2 & Pressure        : {sum_both_cabin + sum_both_burner}")
