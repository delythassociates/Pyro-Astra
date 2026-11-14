import json

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    invs = json.load(f)

for inv in invs:
    if inv['id'] == 'PSI-159':
        inv['burner_flow_o2_pct'] = {
            'value': {'min': None, 'max': 85},
            'unit': '% (burner stream)',
            'provenance': {
                'source_id': 'challenge-brief',
                'doi': None,
                'file': 'NASA Space Apps Challenge Brief: Flame in Freefall',
                'row_or_page': 'Challenge Background',
                'entered_by': 'hand',
                'note': 'source: challenge brief'
            }
        }
        if 'burner_flow_o2_pct' in inv.get('not_reported', []):
            inv['not_reported'].remove('burner_flow_o2_pct')
    elif inv['id'] == 'PSI-68':
        inv['pressure_psi'] = {
            'value': {'min': 7.35, 'max': 44.09},
            'unit': 'psi',
            'provenance': {
                'source_id': 'PSI-68',
                'doi': '10.60555/byp8-h018',
                'file': 'investigation_metadata.json',
                'row_or_page': "data['approach']",
                'entered_by': 'parsed',
                'note': 'Converted from 0.5 - 3.0 atm using exact formula 1 atm = 14.6959 psi'
            }
        }
        inv['cabin_o2_pct'] = {
            'value': {'min': 10.0, 'max': 40.0},
            'unit': '% (vol)',
            'provenance': {
                'source_id': 'PSI-68',
                'doi': '10.60555/byp8-h018',
                'file': 'investigation_metadata.json',
                'row_or_page': "data['approach']",
                'entered_by': 'parsed',
                'note': 'Converted from 0.1 to 0.4 mole fraction in approach (10% to 40% O2)'
            }
        }
        if 'pressure_psi' in inv.get('not_reported', []):
            inv['not_reported'].remove('pressure_psi')
        if 'cabin_o2_pct' in inv.get('not_reported', []):
            inv['not_reported'].remove('cabin_o2_pct')

with open('data/investigations.json', 'w', encoding='utf-8') as f:
    json.dump(invs, f, indent=2)

print('Successfully updated investigations.json')

