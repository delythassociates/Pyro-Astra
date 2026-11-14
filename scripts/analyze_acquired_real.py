import json
import os

investigations = ['PSI-69', 'PSI-68', 'PSI-25', 'PSI-26', 'PSI-102', 'PSI-101', 'PSI-99', 'PSI-159']

print("ANALYSIS OF ACQUIRED REAL PSI DATA FILES:")
print("=" * 70)

for inv_id in investigations:
    path = os.path.join('raw_real', inv_id, 'investigation_metadata.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    title = data.get('title', '')
    doi = data.get('doi', '')
    total_size = data.get('totalFileSize', 0)
    
    # Check for tables or experiments
    exp_hardware = data.get('experimentHardware', [])
    assays = data.get('assays', [])
    studies = data.get('studies', [])
    publications = data.get('publications', [])
    
    print(f"\n[{inv_id}] {title}")
    print(f"  DOI: {doi}")
    print(f"  Repository Reported Dataset Size: {total_size / (1024**3):.2f} GB")
    print(f"  Hardware entries: {len(exp_hardware)}")
    print(f"  Publications: {len(publications)}")
    print(f"  Assays / Tables in public API: {len(assays)}")
    print(f"  Studies in public API: {len(studies)}")
    
    # Check if there is an approach/procedure detailing test matrix
    approach = data.get('approach', '')
    if approach:
        print(f"  Detailed Experimental Approach Available: YES ({len(approach)} characters)")

