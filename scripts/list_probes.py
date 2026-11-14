with open('scripts/run-ask-eval.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
probes = re.findall(r'id:\s*(\d+),\s*query:\s*["\']([^"\']+)["\']', text)
for pid, q in probes:
    print(f"Probe {pid}: {q}")

