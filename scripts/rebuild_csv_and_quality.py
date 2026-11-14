import json
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("build_data", "scripts/build-data.py")
build_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build_data)

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    invs = json.load(f)

# Rebuild investigations.csv
build_data.build_flattened_csv(invs, Path('data/investigations.csv'))
print("Successfully generated data/investigations.csv")

# Rebuild quality-report.json
build_data.generate_quality_report(invs)
print("Successfully generated data/quality-report.json")

