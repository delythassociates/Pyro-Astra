"""
Step 4: Extract BASS-II Table 5.1 from NASA/TM-20210011385
Exact row-by-row extraction from Page 57 (PDF Page 65).
Saves to data/bass2_table_5_1.json and data/bass2_table_5_1.csv.
"""
import csv
import json

SOURCE_REPORT = "NASA/TM-20210011385"
REPORT_PAGE = "Page 57 (PDF Page 65)"
TABLE_TITLE = "TABLE 5.1.—TWENTY BURNING AND SUPPRESSION OF SOLIDS—II (BASS–II) TESTS"

# Exact raw text from the table
TABLE_ROWS_RAW = [
    ("M1", "1", "2.2", "1", "9", "0.071", "6.4", "22.2", "21.9"),
    ("M2", "3", "2.2", "1", "20 and 15", "0.052 and 0.033", "22.9", "22.2", "21.2"),
    ("M3", "5", "2.2", "1", "10 and 20", "0.029 and 0.024", "20.1", "20.8", "19.7"),
    ("M4", "5", "2.2", "2", "5 and 3", "0.045 and 0.033", "19.8", "21.8", "19.8"),
    ("M5", "3", "2.2", "2", "10", "0.071", "27.2", "22.2", "19"),
    ("M6", "1", "2.2", "2", "10 and 8", "Not tracked", "16.8", "21.8", "20.7"),
    ("M7", "1", "1.2", "2", "10, 6, 5, and 3", "0.106, 0.099, 0.083, and 0.07", "18.4", "18.9", "18.4"),
    ("M8", "2", "1.2", "2", "10, 6, and 5", "0.057, 0.056, and 0.04", "25.2", "19.1", "18.2"),
    ("M9", "3", "1.2", "2", "14", "0.025", "16.8", "18", "17.6"),
    ("M10", "4", "1.2", "2", "15 and 10", "0.0373 and 0.03", "30.5", "20.1", "18.6"),
    ("M11", "5", "1.2", "2", "21, 15, and 13", "0.048, 0.028, and 0.022", "28.5", "20", "18.5"),
    ("M12", "2", "2.2", "2", "12 and 10", "Not tracked", "16.2", "21.7", "20.4"),
    ("M13", "4", "2.2", "2", "6, 5, and 4", "0.047, 0.035, and 0.033", "20.5", "20.8", "19"),
    ("M14", "2", "2.2", "1", "15, 14, and 10", "0.0624, 0.055, and 0.0353", "15.4", "22.2", "21.6"),
    ("M15", "4", "2.2", "1", "20", "0.045", "22.0", "21", "20"),
    ("M16", "1", "2.2", "2", "5, 3, and 2", "0.144, 0.1309, and 0.1062", "8.4", "19.2", "18.7"),
    ("M17", "2", "2.2", "2", "5, 4, and 3", "0.053, 0.042, and 0.026", "30.7", "18.8", "17.1"),
    ("M18", "3", "2.2", "2", "10 and 8", "0.026 and 0.013", "25.5", "17.9", "16.8"),
    ("M19", "4", "2.2", "2", "10 and 6", "0.027 and 0.0159", "25.7", "19", "17.4"),
    ("M20", "5", "2.2", "2", "10", "0.012", "16.5", "18", "17.4"),
]

headers = [
    "test_no",
    "thickness_mm",
    "width_cm",
    "sides_burning",
    "velocity_cm_s",
    "spread_rate_mm_s",
    "burn_time_min",
    "initial_o2_vol_pct",
    "final_o2_vol_pct",
    "source_report",
    "report_page"
]

rows = []
for r in TABLE_ROWS_RAW:
    row_dict = {
        "test_no": r[0],
        "thickness_mm": r[1],
        "width_cm": r[2],
        "sides_burning": r[3],
        "velocity_cm_s": r[4],
        "spread_rate_mm_s": r[5],
        "burn_time_min": r[6],
        "initial_o2_vol_pct": r[7],
        "final_o2_vol_pct": r[8],
        "source_report": SOURCE_REPORT,
        "report_page": REPORT_PAGE
    }
    rows.append(row_dict)

row_count = len(rows)
print(f"Extracted {row_count} rows from {SOURCE_REPORT}, {REPORT_PAGE}.")

# Save JSON
with open('data/bass2_table_5_1.json', 'w', encoding='utf-8') as f:
    json.dump({'table': TABLE_TITLE, 'source': SOURCE_REPORT, 'page': REPORT_PAGE, 'row_count': row_count, 'rows': rows}, f, indent=2)

# Save CSV
with open('data/bass2_table_5_1.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)

print("Saved to data/bass2_table_5_1.json and data/bass2_table_5_1.csv")

