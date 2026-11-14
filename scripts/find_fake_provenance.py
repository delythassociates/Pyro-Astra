import os

for root, dirs, files in os.walk('.'):
    if any(x in root for x in ['node_modules', '.next', '.git']):
        continue
    for file in files:
        filepath = os.path.join(root, file)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'SAME_telemetry' in content or 'SAME_summary' in content or 'BASS_conditions' in content:
                    print(f"Found in: {filepath}")
        except Exception as e:
            pass

