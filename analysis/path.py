#!/usr/bin/env python3
"""
PYRO-ASTRA: Workstream K - Exploration Transit Path Analysis
Defined by the PYRO-ASTRA team.

Computes normalized documentation evidence-distance along an illustrative
exploration transit path:
ISS Cabin (21% O2, 14.7 psi) -> Lunar Habitat (34% O2, 8.2 psi) -> Spacesuit (100% O2, 4.3 psi).
Axes normalization per Section 8: O2 / 100, psi / 14.7.
Distance measures documentation distance, not hazard.
Label: 'illustrative, not a mission profile.'

Gate 2 Directive:
- Computes on stated envelope (10-40% O2) AND on table-listed (17-30% O2).
- Reports lunar distance for both, clearly labelled.
"""

import json
import math
import os

def interval_dist(val, rng_min, rng_max):
    if rng_min is not None and val < rng_min:
        return rng_min - val
    if rng_max is not None and val > rng_max:
        return val - rng_max
    return 0.0

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    inv_path = os.path.join(base_dir, "data", "investigations.json")
    out_path = os.path.join(base_dir, "data", "analysis", "path.json")

    with open(inv_path, "r", encoding="utf-8") as f:
        all_investigations = json.load(f)

    # Filter to plottable deep records with non-null bounded cabin_o2_pct and pressure_psi
    # PSI-68 (FLEX-2) is the primary bounded investigation with both O2 and pressure.
    # CFI-G (PSI-159) has burner_flow_o2_pct only (Section 2 Rule 4).
    # PSI-69 (FLEX) has table-listed O2 (12-34%) but pressure min is null (0.0 mmHg treated as null).
    plottable = []
    plottable_table_listed = []

    for r in all_investigations:
        if r.get("depth") == "deep":
            c_o2 = (r.get("cabin_o2_pct") or {}).get("value")
            press = (r.get("pressure_psi") or {}).get("value")
            table_o2 = (r.get("table_listed_o2_pct") or {}).get("value")

            if c_o2 is not None and c_o2.get("min") is not None and press is not None and press.get("min") is not None:
                plottable.append({
                    "id": r["id"],
                    "acronym": r["acronym"],
                    "name": r["name"],
                    "doi": r["doi"],
                    "o2_min": c_o2["min"],
                    "o2_max": c_o2["max"],
                    "p_min": press["min"],
                    "p_max": press["max"]
                })

            # For table-listed variant
            eff_o2 = table_o2 if table_o2 is not None else c_o2
            if eff_o2 is not None and eff_o2.get("min") is not None and press is not None and press.get("min") is not None:
                plottable_table_listed.append({
                    "id": r["id"],
                    "acronym": r["acronym"],
                    "name": r["name"],
                    "doi": r["doi"],
                    "o2_min": eff_o2["min"],
                    "o2_max": eff_o2["max"],
                    "p_min": press["min"],
                    "p_max": press["max"]
                })

    print(f"Plottable deep records for path analysis (stated envelope): {len(plottable)}")
    print(f"Plottable deep records for path analysis (table-listed):     {len(plottable_table_listed)}")

    # Waypoints
    waypoints = [
        {
            "id": "iss_cabin",
            "name": "ISS Cabin Reference",
            "o2_pct": 21.0,
            "pressure_psi": 14.7,
            "source": "Earth-air approximation (presets.ts), sea level 14.7 psi",
            "description": "Standard Earth-normal pressurized station cabin environment."
        },
        {
            "id": "lunar_habitat",
            "name": "Lunar Habitat",
            "o2_pct": 34.0,
            "pressure_psi": 8.2,
            "source": "NTRS-20210022143 p. 4 & p. 6, Fortenberry et al. (2021)",
            "description": "Exploration atmosphere targeted for future pressurized lunar surface habitat."
        },
        {
            "id": "spacesuit",
            "name": "Spacesuit EVA",
            "o2_pct": 100.0,
            "pressure_psi": 4.3,
            "source": "Challenge brief & presets.ts (100% O2, 4.3 psi)",
            "description": "Pure-oxygen low-pressure extravehicular activity spacesuit environment."
        }
    ]

    steps = []

    # Segment 1: ISS -> Lunar Habitat (steps 0 to 50)
    for i in range(51):
        frac = i / 50.0
        o2 = 21.0 + frac * (34.0 - 21.0)
        p = 14.7 + frac * (8.2 - 14.7)
        steps.append({
            "step": i,
            "path_fraction": round(i / 100.0, 3),
            "segment": "ISS Cabin -> Lunar Habitat",
            "o2_pct": round(o2, 2),
            "pressure_psi": round(p, 2)
        })

    # Segment 2: Lunar Habitat -> Spacesuit (steps 51 to 100)
    for i in range(1, 51):
        frac = i / 50.0
        o2 = 34.0 + frac * (100.0 - 34.0)
        p = 8.2 + frac * (4.3 - 8.2)
        step_idx = 50 + i
        steps.append({
            "step": step_idx,
            "path_fraction": round(step_idx / 100.0, 3),
            "segment": "Lunar Habitat -> Spacesuit EVA",
            "o2_pct": round(o2, 2),
            "pressure_psi": round(p, 2)
        })

    # Calculate normalized evidence distance at each step for both stated and table-listed envelopes
    for s in steps:
        o2_target = s["o2_pct"]
        p_target = s["pressure_psi"]

        # 1. Stated Envelope Calculation
        best_dist_stated = float("inf")
        best_rec_stated = None
        best_d_o2_stated = 0.0
        best_d_p_stated = 0.0

        for r in plottable:
            d_o2_raw = interval_dist(o2_target, r["o2_min"], r["o2_max"])
            d_p_raw = interval_dist(p_target, r["p_min"], r["p_max"])

            norm_d_o2 = d_o2_raw / 100.0
            norm_d_p = d_p_raw / 14.7
            dist = math.sqrt(norm_d_o2 * norm_d_o2 + norm_d_p * norm_d_p)

            if dist < best_dist_stated:
                best_dist_stated = dist
                best_rec_stated = r
                best_d_o2_stated = norm_d_o2
                best_d_p_stated = norm_d_p

        # 2. Table-Listed Envelope Calculation
        best_dist_table = float("inf")
        best_rec_table = None
        best_d_o2_table = 0.0
        best_d_p_table = 0.0

        for r in plottable_table_listed:
            d_o2_raw = interval_dist(o2_target, r["o2_min"], r["o2_max"])
            d_p_raw = interval_dist(p_target, r["p_min"], r["p_max"])

            norm_d_o2 = d_o2_raw / 100.0
            norm_d_p = d_p_raw / 14.7
            dist = math.sqrt(norm_d_o2 * norm_d_o2 + norm_d_p * norm_d_p)

            if dist < best_dist_table:
                best_dist_table = dist
                best_rec_table = r
                best_d_o2_table = norm_d_o2
                best_d_p_table = norm_d_p

        s["evidence_distance"] = round(best_dist_stated, 4)
        s["table_listed_distance"] = round(best_dist_table, 4)
        s["intersects_tested"] = best_dist_stated < 1e-4
        s["nearest_investigation"] = {
            "id": best_rec_stated["id"],
            "acronym": best_rec_stated["acronym"],
            "name": best_rec_stated["name"],
            "doi": best_rec_stated["doi"],
            "tested_o2": {"min": best_rec_stated["o2_min"], "max": best_rec_stated["o2_max"]},
            "tested_pressure_psi": {"min": best_rec_stated["p_min"], "max": best_rec_stated["p_max"]}
        }
        s["component_distances"] = {
            "normalized_d_o2": round(best_d_o2_stated, 4),
            "normalized_d_pressure": round(best_d_p_stated, 4)
        }

    max_dist_step = max(steps, key=lambda x: x["evidence_distance"])
    min_dist_step = min(steps, key=lambda x: x["evidence_distance"])

    # Step 50 is the Lunar Habitat waypoint
    lunar_step = steps[50]

    output_data = {
        "title": "PYRO-ASTRA Exploration Transit Documentation Path",
        "label": "defined by the PYRO-ASTRA team",
        "mission_note": "illustrative, not a mission profile.",
        "scientific_disclaimer": "distance measures documentation distance, not hazard.",
        "normalization": "Normalized 2D Euclidean distance on axes (O2 / 100, pressure / 14.7) per Section 8.",
        "waypoints": waypoints,
        "summary": {
            "total_steps": len(steps),
            "max_documentation_distance": {
                "step": max_dist_step["step"],
                "distance": max_dist_step["evidence_distance"],
                "o2_pct": max_dist_step["o2_pct"],
                "pressure_psi": max_dist_step["pressure_psi"],
                "segment": max_dist_step["segment"],
                "nearest_record": max_dist_step["nearest_investigation"]["acronym"]
            },
            "min_documentation_distance": {
                "step": min_dist_step["step"],
                "distance": min_dist_step["evidence_distance"],
                "o2_pct": min_dist_step["o2_pct"],
                "pressure_psi": min_dist_step["pressure_psi"],
                "nearest_record": min_dist_step["nearest_investigation"]["acronym"]
            },
            "lunar_habitat_comparison": {
                "waypoint": "Lunar Habitat (34.0% O2, 8.2 psi)",
                "stated_envelope_distance": lunar_step["evidence_distance"],
                "stated_envelope_o2_range": [10.0, 40.0],
                "table_listed_distance": lunar_step["table_listed_distance"],
                "table_listed_o2_range": [17.0, 30.0],
                "explanation": "On stated envelope (10-40% O2), Lunar Habitat falls inside envelope (distance 0.0000). On authentic table-listed runs (17-30% O2), Lunar Habitat requires +4.0% O2 extrapolation beyond 30.0% max, yielding normalized distance 0.0400."
            },
            "plottable_investigations_count": len(plottable),
            "unplottable_burner_flow_only": ["PSI-159 (CFI-G: burner-flow oxidizer only; Rule 4)"]
        },
        "path_steps": steps
    }

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print("\n" + "=" * 70)
    print("PATH ANALYSIS COMPLETE")
    print("=" * 70)
    print(f"Lunar Habitat Distance (Stated Envelope 10-40% O2):  {lunar_step['evidence_distance']:.4f}")
    print(f"Lunar Habitat Distance (Table-Listed 17-30% O2):     {lunar_step['table_listed_distance']:.4f}")
    print(f"Min distance: {min_dist_step['evidence_distance']} at {min_dist_step['o2_pct']}% O2, {min_dist_step['pressure_psi']} psi ({min_dist_step['nearest_investigation']['acronym']})")
    print(f"Max distance: {max_dist_step['evidence_distance']} at {max_dist_step['o2_pct']}% O2, {max_dist_step['pressure_psi']} psi ({max_dist_step['nearest_investigation']['acronym']})")
    print(f"Results written to: {out_path}\n")

if __name__ == "__main__":
    main()
