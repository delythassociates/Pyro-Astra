import os
import sys

binary_exts = {'.pdf', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.zip', '.tar', '.gz'}
root = os.path.abspath('.')
found = []

needle = 'g' + 'sk_'

for dirpath, dirnames, filenames in os.walk(root):
    if 'node_modules' in dirnames:
        dirnames.remove('node_modules')
    if '.git' in dirnames:
        dirnames.remove('.git')
    for f in filenames:
        if f == 'leak_check.py':
            continue
        ext = os.path.splitext(f)[1].lower()
        if ext in binary_exts:
            continue
        rel_path = os.path.relpath(os.path.join(dirpath, f), root)
        full_path = os.path.join(dirpath, f)
        try:
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
                if needle in content:
                    found.append(rel_path)
        except Exception:
            pass

print("Scanning repository, .next bundle, logs, and docs for 'gsk_'...")
print("Found 'gsk_' in files:")
for p in found:
    print(f" - {p}")

leaks = [p for p in found if not p.startswith('.env')]
if leaks:
    print(f"\n[LEAK DETECTED!] Non-env files contain 'gsk_':")
    for l in leaks:
        print(f" * {l}")
    sys.exit(1)
else:
    print("\n[PASS] Zero leaks detected! Only .env.local contains 'gsk_'.")
    sys.exit(0)
