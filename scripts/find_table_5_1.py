import fitz  # PyMuPDF

doc = fitz.open('raw_real/reports/NASA-TM-20210011385.pdf')
print("Total pages in TM-20210011385:", len(doc))

table_pages = []
for page_num in range(len(doc)):
    text = doc[page_num].get_text()
    if "Table 5.1" in text or "TABLE 5.1" in text:
        table_pages.append(page_num)
        print(f"Found Table 5.1 mention on page {page_num + 1} (0-indexed: {page_num})")

for p in table_pages:
    print("=" * 60)
    print(f"PAGE {p + 1}:")
    print(doc[p].get_text()[:2500])

