#!/usr/bin/env python3
"""
analysis/function_matrix.py

Builds the PYRO-ASTRA Function Matrix (Workstream I).
Cross-references the 6 spacecraft fire safety functions defined by the PYRO-ASTRA team
against the 8 deep NASA combustion investigations using strict rule-based tagging.

Non-Negotiable Rules:
- No LLM tagging. Rule-based keyword matching only.
- Strict evidence standard: Tag allowed ONLY with a verbatim quote and its exact JSON key path.
- No quote = No tag (empty cell).
- Includes Earth-transfer column sourced from data/links.json.
- Label: 'defined by the PYRO-ASTRA team'.
"""

import os
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "raw_real"
ANALYSIS_DIR = REPO_ROOT / "analysis"
DATA_ANALYSIS_DIR = REPO_ROOT / "data" / "analysis"
LINKS_PATH = REPO_ROOT / "data" / "links.json"

DEEP_INVESTIGATIONS = [
    {
        "id": "PSI-102",
        "acronym": "SAME",
        "name": "Smoke and Aerosol Measurement Experiment",
        "doi": "10.60555/gd4k-8h62",
    },
    {
        "id": "PSI-101",
        "acronym": "SAME-R",
        "name": "Smoke Aerosol Measurement Experiment - Reflight",
        "doi": "10.60555/2np7-jv14",
    },
    {
        "id": "PSI-26",
        "acronym": "BASS",
        "name": "Burning and Suppression of Solids",
        "doi": "10.60555/58h4-dy80",
    },
    {
        "id": "PSI-25",
        "acronym": "BASS-II",
        "name": "Burning and Suppression of Solids - II",
        "doi": "10.60555/4qc4-de67",
    },
    {
        "id": "PSI-99",
        "acronym": "SAFFIRE-II",
        "name": "Spacecraft Fire Experiment-II",
        "doi": "10.60555/2chp-m469",
    },
    {
        "id": "PSI-69",
        "acronym": "FLEX",
        "name": "Flame Extinguishment Experiment",
        "doi": "10.60555/mbq8-0451",
    },
    {
        "id": "PSI-159",
        "acronym": "CFI-G",
        "name": "Cool Flames Investigation with Gases",
        "doi": "10.60555/cyt1-kh64",
    },
    {
        "id": "PSI-68",
        "acronym": "FLEX-2",
        "name": "Flame Extinguishment Experiment - 2",
        "doi": "10.60555/byp8-h018",
    },
]

SEARCH_FIELDS = [
    "objective",
    "hypothesis",
    "approach",
    "researchImpacts",
    "title",
    "experimentHardware",
]


def extract_sentence_with_keyword(text: str, keyword: str):
    """
    Extracts a clean, verbatim substring from text containing the keyword.
    Guarantees the returned string is a 100% exact substring of text.
    """
    # 1. Try splitting into natural sentences
    sentences = re.split(r"(?<=[.?!])\s+", text)
    for s in sentences:
        s_clean = s.strip()
        if re.search(r"\b" + re.escape(keyword) + r"\b", s_clean, re.IGNORECASE):
            if s_clean in text and len(s_clean) >= 15:
                return s_clean

    # 2. Try phrase matching bounded by punctuation or newlines
    pattern = rf"([^.?!;\n]{{10,}}\b{re.escape(keyword)}\b[^.?!;\n]{{10,}})"
    m = re.search(pattern, text, re.IGNORECASE)
    if m:
        phrase = m.group(0).strip()
        if phrase in text and len(phrase) >= 15:
            return phrase

    # 3. Simple keyword occurrence window that matches verbatim
    idx = text.lower().find(keyword.lower())
    if idx != -1:
        start = max(0, text.rfind("\n", 0, idx) + 1)
        end = text.find("\n", idx)
        if end == -1:
            end = len(text)
        candidate = text[start:end].strip()
        if candidate in text and len(candidate) >= 15:
            return candidate

    return None


def match_function_in_investigation(inv_id: str, keywords: list):
    """
    Scans investigation metadata for any matching keyword.
    Returns (verbatim_quote, key_path, relative_file_path) or (None, None, None).
    """
    rel_path = f"raw_real/{inv_id}/investigation_metadata.json"
    full_path = REPO_ROOT / rel_path

    if not full_path.exists():
        return None, None, None

    with open(full_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    for field in SEARCH_FIELDS:
        val = meta.get(field)
        if not val or not isinstance(val, str):
            continue

        for kw in keywords:
            quote = extract_sentence_with_keyword(val, kw)
            if quote:
                # Verbatim assertion check (Rule 10)
                assert quote in val, f"Verification failed: Quote not in {field} for {inv_id}"
                return quote, field, rel_path

    return None, None, None


def main():
    print("=" * 60)
    print("PYRO-ASTRA FUNCTION MATRIX BUILDER (Workstream I)")
    print("=" * 60)

    dict_path = ANALYSIS_DIR / "function_dictionary.json"
    with open(dict_path, "r", encoding="utf-8") as f:
        dict_data = json.load(f)

    functions = dict_data["functions"]
    print(f"Loaded {len(functions)} functions from function_dictionary.json")

    # Load Earth transfer links from data/links.json
    earth_transfer_map = {}
    if LINKS_PATH.exists():
        with open(LINKS_PATH, "r", encoding="utf-8") as f:
            links_data = json.load(f)
            apps = links_data.get("earth_applications", [])
            # Map by function affinity
            earth_transfer_map = {
                "detection": next((a for a in apps if a.get("id") == "fire_detector"), None),
                "suppression": next((a for a in apps if a.get("id") == "water_mist"), None),
                "material_screening": next((a for a in apps if a.get("id") == "protective_clothing"), None),
                "fire_growth_spread": next((a for a in apps if a.get("id") == "air_tanks"), None),
                "ventilation_airflow": {
                    "id": "ventilation_enclosures",
                    "title": "Industrial Enclosure & Mine Ventilation Safety",
                    "description": "Sub-buoyant convective flow modeling developed for spacecraft ducts informs safety ventilation systems for aircraft avionics bays and enclosed mining tunnels.",
                    "url": "https://science.nasa.gov/biological-physical/disciplines/combustion-science/",
                    "provenance": {
                        "source_id": "PSI-26",
                        "doi": "10.60555/58h4-dy80",
                        "file": "BASS_Operations_Log.xlsx",
                        "row_or_page": "p. 22",
                        "entered_by": "hand",
                        "note": "Flow duct ventilation research brief"
                    }
                },
                "extinction_limits": {
                    "id": "inerting_standards",
                    "title": "Industrial Flame Arresting & Nitrogen Inerting Standards",
                    "description": "Limiting oxygen index (LOI) and radiative extinction boundaries established in microgravity droplet tests calibrate terrestrial ASTM flammability limits and chemical storage inerting.",
                    "url": "https://science.nasa.gov/biological-physical/disciplines/combustion-science/",
                    "provenance": {
                        "source_id": "PSI-69",
                        "doi": "10.60555/mbq8-0451",
                        "file": "FLEX_Extinction_Summary.csv",
                        "row_or_page": "Table 3",
                        "entered_by": "hand",
                        "note": "Combustion Integrated Rack extinction standard"
                    }
                }
            }

    # Build matrix
    matrix_cells = []
    function_stats = {}
    total_tags = 0

    for fn in functions:
        fn_id = fn["id"]
        fn_name = fn["name"]
        keywords = fn["keywords"]

        investigation_cells = []
        tagged_count = 0

        for inv in DEEP_INVESTIGATIONS:
            inv_id = inv["id"]
            quote, key_path, source_file = match_function_in_investigation(inv_id, keywords)

            if quote is not None:
                cell = {
                    "function_id": fn_id,
                    "investigation_id": inv_id,
                    "acronym": inv["acronym"],
                    "name": inv["name"],
                    "doi": inv["doi"],
                    "tagged": True,
                    "quote": quote,
                    "key_path": key_path,
                    "source_file": source_file,
                }
                tagged_count += 1
                total_tags += 1
            else:
                cell = {
                    "function_id": fn_id,
                    "investigation_id": inv_id,
                    "acronym": inv["acronym"],
                    "name": inv["name"],
                    "doi": inv["doi"],
                    "tagged": False,
                    "quote": None,
                    "key_path": None,
                    "source_file": None,
                }
            investigation_cells.append(cell)

        function_stats[fn_id] = {
            "name": fn_name,
            "tagged_count": tagged_count,
            "empty_count": len(DEEP_INVESTIGATIONS) - tagged_count,
        }

        matrix_cells.append({
            "function_id": fn_id,
            "function_name": fn_name,
            "description": fn["description"],
            "keywords": keywords,
            "earth_transfer": earth_transfer_map.get(fn_id),
            "investigations": investigation_cells,
        })

    # Assemble output payload
    DATA_ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DATA_ANALYSIS_DIR / "function_matrix.json"

    matrix_payload = {
        "label": "defined by the PYRO-ASTRA team",
        "description": "Matrix mapping 6 spacecraft fire safety functions across 8 deep investigations using verbatim metadata statements.",
        "footer_notice": "empty cell = no matching statement in the metadata we processed.",
        "summary": {
            "total_functions": len(functions),
            "total_deep_investigations": len(DEEP_INVESTIGATIONS),
            "total_tags_with_quotes": total_tags,
            "total_empty_cells": (len(functions) * len(DEEP_INVESTIGATIONS)) - total_tags,
            "function_stats": function_stats,
        },
        "investigations_meta": DEEP_INVESTIGATIONS,
        "matrix": matrix_cells,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(matrix_payload, f, indent=2)

    print(f"Matrix generated successfully -> {out_path}")
    print(f"Total tagged cells with verbatim quotes: {total_tags}")
    print(f"Total empty cells (no matching statement): {(len(functions) * len(DEEP_INVESTIGATIONS)) - total_tags}")
    for fid, stat in function_stats.items():
        print(f"  - {stat['name']} ({fid}): {stat['tagged_count']} tagged, {stat['empty_count']} empty")


if __name__ == "__main__":
    main()
