import os
import csv

tables = [
    ("PSI-69", "raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv", "Ambient pressure; mmHg", "O initial ambient composition; mole fraction"),
    ("PSI-159", "raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (1).csv", "pmean (bar)", "XO2"),
    ("PSI-10_norm", "raw_real/PSI-10/experimental_table/PSI-10_Experimental table_Flame Design_Normal Flame (1).csv", "pmean (atm)", "XO2 (init)"),
    ("PSI-10_inv", "raw_real/PSI-10/experimental_table/PSI-10_Experimental table_Flame Design_Inverse Flame.csv", "pmean (atm)", "XO2"),
    ("PSI-39", "raw_real/PSI-39/experimental_table/PSI-39_Experimental table_CFI.csv", "Pressure", "Oxygen"),
    ("PSI-68", "raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv", "Ambient Pressure (atm)", "Oxygen Mole Fraction"),
]

print("=== COMPUTING N: ROWS REPORTING BOTH O2 AND PRESSURE ===")
total_both_reported = 0
per_table_both = {}

for pid, path, p_col, o2_col in tables:
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="latin-1") as f:
        reader = csv.DictReader(f)
        count = 0
        for r in reader:
            p_val = r.get(p_col, "").strip()
            o2_val = r.get(o2_col, "").strip()
            # Valid non-empty
            if p_val and o2_val and p_val != "None" and o2_val != "None":
                count += 1
        per_table_both[pid] = count
        total_both_reported += count

print(f"Per-table rows reporting BOTH O2 and pressure:")
for pid, c in per_table_both.items():
    print(f"  {pid:12}: {c:4} rows")
print(f"Total rows reporting BOTH O2 and pressure (N): {total_both_reported}")

# Check other tables: do any other tables report both?
# Solids: BASS, BASS-II, SAFFIRE-I, SAFFIRE-II, SAFFIRE-III, SAME, SAME-R -> pressure is NULL in all
# Gases: ACME BRE (pressure unmeasured in table), ACME E-FIELD (neither), ACME s-Flame (neither), SLICE (neither), SPICE (neither)
# Dust: DAFT (neither)
# Summary: PSI-142 (neither)
