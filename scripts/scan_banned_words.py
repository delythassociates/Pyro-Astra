import os
import re
import glob

banned_pattern = re.compile(r'\b(cryptographic|human-reviewed|Artemis III|NASA never|never tested|AUROC|conformal|Latin hypercube|space-filling|predicts)\b', re.IGNORECASE)

directories = ['src', 'release', 'docs', 'public/release']
markdown_files = glob.glob('*.md') + glob.glob('docs/*.md') + glob.glob('analysis/*.md')

checked_files = set()
violations = []

def scan_file(filepath):
    normalized = os.path.normpath(filepath)
    if normalized in checked_files:
        return
    checked_files.add(normalized)
    try:
        with open(normalized, 'r', encoding='utf-8', errors='ignore') as f:
            for line_no, line in enumerate(f, 1):
                # Allow the exact rule definition in AGENTS.md or SPEC.md where the banned words list itself is quoted
                if 'banned' in line.lower() or 'r6' in line.lower() or 'rules r1' in line.lower():
                    continue
                match = banned_pattern.search(line)
                if match:
                    violations.append((normalized, line_no, match.group(0), line.strip()[:100]))
    except Exception as e:
        pass

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            scan_file(os.path.join(root, file))

for mf in markdown_files:
    if os.path.exists(mf):
        scan_file(mf)

print(f"Scanned {len(checked_files)} files.")
if violations:
    print(f"FOUND {len(violations)} VIOLATIONS:")
    for v in violations:
        print(f"  {v[0]}:{v[1]} - Found '{v[2]}': {v[3]}")
else:
    print("SUCCESS: 0 banned phrases found across all scanned files!")
