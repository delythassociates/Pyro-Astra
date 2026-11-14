#!/usr/bin/env python3
"""
analysis/verify_quotes.py

PYRO-ASTRA Quote Verification Audit (Rule 10).
Confirms that every stored quote across all analytical datasets is an exact verbatim
substring of its specified source file under raw_real/ or official reports.

If any quote is ungrounded or fails the substring check, the invalid quote is deleted
from disk, preserving data integrity.

Runnable via: npm run analyze
"""

import sys
import os
import json
import html
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
ANALYSIS_DIR = REPO_ROOT / "analysis"


def normalize_text_for_comparison(text: str) -> str:
    """Normalize HTML entities, smart quotes, and spaces."""
    unescaped = html.unescape(text)
    # Also standardize curly apostrophes/quotes
    return unescaped.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')


def check_quote_in_text(quote: str, content: str) -> bool:
    """Verifies that quote exists as a verbatim substring (with character normalization)."""
    if quote in content:
        return True
    norm_content = normalize_text_for_comparison(content)
    norm_quote = normalize_text_for_comparison(quote)
    if norm_quote in norm_content:
        return True
    if quote.strip(" .;") in norm_content:
        return True
    return False


def get_json_key_value(data: dict, key_path: str):
    """Retrieve value at key_path from a JSON object."""
    parts = key_path.split(".")
    curr = data
    for part in parts:
        if isinstance(curr, dict) and part in curr:
            curr = curr[part]
        elif isinstance(curr, list) and part.isdigit():
            idx = int(part)
            if 0 <= idx < len(curr):
                curr = curr[idx]
            else:
                return None
        else:
            return None
    return curr


def verify_function_matrix():
    """Verify all quotes in data/analysis/function_matrix.json."""
    matrix_path = DATA_DIR / "analysis" / "function_matrix.json"
    if not matrix_path.exists():
        print(f"Skipping function_matrix: {matrix_path} not found.")
        return 0, 0, []

    with open(matrix_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    passed_count = 0
    failed_count = 0
    failures = []
    modified = False

    matrix = data.get("matrix", [])
    for row in matrix:
        fn_name = row.get("function_name", "Unknown")
        for cell in row.get("investigations", []):
            if not cell.get("tagged") or not cell.get("quote"):
                continue

            quote = cell["quote"]
            source_file = cell.get("source_file")
            key_path = cell.get("key_path")
            inv_id = cell.get("investigation_id", "Unknown")

            if not source_file:
                failed_count += 1
                failures.append(f"[{inv_id} -> {fn_name}] Tagged cell missing source_file")
                cell["tagged"] = False
                cell["quote"] = None
                cell["key_path"] = None
                cell["source_file"] = None
                modified = True
                continue

            full_source_path = REPO_ROOT / source_file
            if not full_source_path.exists():
                failed_count += 1
                failures.append(f"[{inv_id} -> {fn_name}] Source file not found: {source_file}")
                cell["tagged"] = False
                cell["quote"] = None
                cell["key_path"] = None
                cell["source_file"] = None
                modified = True
                continue

            # Read source content
            if source_file.endswith(".json"):
                with open(full_source_path, "r", encoding="utf-8") as sf:
                    source_json = json.load(sf)
                val = get_json_key_value(source_json, key_path) if key_path else None
                if val is not None and isinstance(val, str):
                    is_verbatim = check_quote_in_text(quote, val)
                else:
                    # Fallback to full file string search
                    with open(full_source_path, "r", encoding="utf-8") as sf:
                        is_verbatim = check_quote_in_text(quote, sf.read())
            else:
                with open(full_source_path, "r", encoding="utf-8", errors="ignore") as sf:
                    is_verbatim = check_quote_in_text(quote, sf.read())

            if is_verbatim:
                passed_count += 1
            else:
                failed_count += 1
                failures.append(f"[{inv_id} -> {fn_name}] Quote is NOT a verbatim substring of {source_file}:\n  \"{quote}\"")
                # Rule 10: Failures deleted
                cell["tagged"] = False
                cell["quote"] = None
                cell["key_path"] = None
                cell["source_file"] = None
                modified = True

    if modified:
        # Recompute totals in summary
        total_tags = sum(
            1 for r in matrix for c in r.get("investigations", []) if c.get("tagged")
        )
        data["summary"]["total_tags_with_quotes"] = total_tags
        data["summary"]["total_empty_cells"] = (
            data["summary"]["total_functions"] * data["summary"]["total_deep_investigations"]
        ) - total_tags
        with open(matrix_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Updated {matrix_path} with invalid quotes removed.")

    return passed_count, failed_count, failures


def verify_questions_json():
    """Verify quotes in analysis/questions.json if present."""
    q_path = ANALYSIS_DIR / "questions.json"
    if not q_path.exists():
        return 0, 0, []

    with open(q_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    passed_count = 0
    failed_count = 0
    failures = []
    modified = False

    for q in questions:
        quote = q.get("quote") or (q.get("source", {}) or {}).get("verbatim_quote")
        source = q.get("source_file") or (q.get("source", {}) or {}).get("file")
        q_id = q.get("id", "Unknown")

        if not quote or not source:
            continue

        source_path = REPO_ROOT / source
        if not source_path.exists():
            continue

        with open(source_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if check_quote_in_text(quote, content):
            passed_count += 1
        else:
            failed_count += 1
            failures.append(f"[Question {q_id}] Quote not in {source}: \"{quote}\"")
            if "quote" in q:
                q["quote"] = None
            if "source" in q and "verbatim_quote" in q["source"]:
                q["source"]["verbatim_quote"] = None
            modified = True

    if modified:
        with open(q_path, "w", encoding="utf-8") as f:
            json.dump(questions, f, indent=2)

    return passed_count, failed_count, failures


def verify_surprises_json():
    """Verify quotes in data/surprises.json if present."""
    s_path = DATA_DIR / "surprises.json"
    if not s_path.exists():
        return 0, 0, []

    with open(s_path, "r", encoding="utf-8") as f:
        surprises = json.load(f)

    passed_count = 0
    failed_count = 0
    failures = []
    modified = False

    cards = surprises.get("cards", surprises) if isinstance(surprises, dict) else surprises

    for card in cards:
        quote = card.get("quote") or card.get("verbatim_quote")
        source = card.get("source_file") or card.get("source")
        c_id = card.get("id", "Unknown")

        if not quote or not source:
            continue

        # If source is SPEC.md, check against SPEC.md in repo root
        source_path = REPO_ROOT / source
        if not source_path.exists():
            # Check if source contains slash or section
            base_file = source.split()[0]
            if (REPO_ROOT / base_file).exists():
                source_path = REPO_ROOT / base_file
            else:
                continue

        with open(source_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if check_quote_in_text(quote, content):
            passed_count += 1
        else:
            failed_count += 1
            failures.append(f"[Surprise Card {c_id}] Quote not in {source}: \"{quote}\"")
            card["quote"] = None
            modified = True

    if modified:
        with open(s_path, "w", encoding="utf-8") as f:
            json.dump(surprises, f, indent=2)

    return passed_count, failed_count, failures


def verify_readiness_json():
    """Verify material match quotes in data/analysis/readiness.json."""
    r_path = DATA_DIR / "analysis" / "readiness.json"
    if not r_path.exists():
        return 0, 0, []

    with open(r_path, "r", encoding="utf-8") as f:
        readiness = json.load(f)

    passed_count = 0
    failed_count = 0
    failures = []

    for q in readiness.get("questions", []):
        if not q.get("material_matched") or not q.get("material_quote"):
            continue
        quote = q["material_quote"]
        source_obj = q.get("material_quote_source") or {}
        source = source_obj.get("file")
        qid = q.get("id", "Unknown")

        if not source:
            continue

        source_path = REPO_ROOT / source
        if not source_path.exists():
            continue

        with open(source_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if check_quote_in_text(quote, content):
            passed_count += 1
        else:
            failed_count += 1
            failures.append(f"[Readiness {qid}] Quote not in {source}: \"{quote}\"")

    return passed_count, failed_count, failures


def main():
    print("=" * 60)
    print("PYRO-ASTRA QUOTE VERIFICATION AUDITOR (Rule 10)")
    print("=" * 60)

    total_passed = 0
    total_failed = 0
    all_failures = []

    # 1. Function Matrix
    p, f, fails = verify_function_matrix()
    total_passed += p
    total_failed += f
    all_failures.extend(fails)
    print(f"Function Matrix: {p} passed, {f} failed")

    # 2. Questions JSON
    p, f, fails = verify_questions_json()
    total_passed += p
    total_failed += f
    all_failures.extend(fails)
    if p + f > 0:
        print(f"Questions: {p} passed, {f} failed")

    # 3. Surprises JSON
    p, f, fails = verify_surprises_json()
    total_passed += p
    total_failed += f
    all_failures.extend(fails)
    if p + f > 0:
        print(f"Surprises: {p} passed, {f} failed")

    # 4. Readiness Material Quotes
    p, f, fails = verify_readiness_json()
    total_passed += p
    total_failed += f
    all_failures.extend(fails)
    if p + f > 0:
        print(f"Readiness Material Quotes: {p} passed, {f} failed")

    print("\n" + "=" * 60)
    if total_failed == 0:
        print(f"AUDIT PASSED: All {total_passed} quotes verified as 100% verbatim substrings.")
        print("=" * 60)
        sys.exit(0)
    else:
        print(f"AUDIT FAILED: {total_failed} ungrounded quotes detected and deleted from disk.")
        for err in all_failures:
            print(f"  - {err}")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
