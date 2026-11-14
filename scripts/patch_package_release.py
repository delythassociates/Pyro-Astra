with open('scripts/package-release.py', 'r', encoding='utf-8') as f:
    c = f.read()

start_marker = '# 5. field_dictionary.json'
end_marker = '# 6. LICENSE.txt'

start_idx = c.find(start_marker)
end_idx = c.find(end_marker)

assert start_idx != -1 and end_idx != -1, f"Markers not found: {start_idx}, {end_idx}"

# Find preceding line break before start_marker
start_block = c.rfind('# -----', 0, start_idx)
end_block = c.rfind('# -----', 0, end_idx)

replacement = """# -----------------------------------------------------------------------------
# 5. field_dictionary.json & modeling_ready_runs
# -----------------------------------------------------------------------------
print("Generating field_dictionary.json and modeling_ready_runs...")
import sys
sys.path.insert(0, os.path.dirname(__file__))
from build_field_dictionary import generate_field_dictionary
generate_field_dictionary()

from prepare_modeling_runs import build_all_modeling_runs, write_release_artifacts
write_release_artifacts(build_all_modeling_runs())

"""

new_c = c[:start_block] + replacement + c[end_block:]
with open('scripts/package-release.py', 'w', encoding='utf-8') as f:
    f.write(new_c)

print("Updated scripts/package-release.py cleanly!")
