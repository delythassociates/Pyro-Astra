#!/usr/bin/env python3
"""
Workstream L: Proposed Experiment Design (Candidate Test Matrix)
PYRO-ASTRA Space Apps Challenge 2026

Rules (Section 2 & Workstream L):
- Candidate test matrix over O2 x pressure x airflow
- Restricted to planned lunar habitat atmosphere (34% O2, 8.2 psi from NTRS-20210022143)
- Airflow restricted strictly to Table 5.1 range (2.0 to 21.0 cm/s) for flat PMMA
- At most 12 runs total
- Exactly 1 anchor run equal to a documented Table 5.1 condition (quote row)
- Columns: run_id, is_anchor, material, conditions, why chosen, nearest investigation, gap distance
- ZERO predicted outcomes. No predicted result column!
- Mention LUCI and FM2 as sources of future partial-gravity data.
- Output: data/analysis/proposed_experiments.json
"""

import json
import os
import math
import numpy as np

def generate_experiment_design():
    # Fixed seed for deterministic reproducibility
    np.random.seed(42)

    # 1. Anchor Run: documented BASS-II Table 5.1 condition (flat PMMA)
    # Quote from NASA/TM-20210011385 Table 5.1, Page 57 (PDF Page 65), Row 1 (Test M1):
    # Material: 1 mm thick, 2.2 cm wide flat PMMA slab, 1 side burning
    # Initial O2: 22.2 vol% (final O2: 21.9 vol%), velocity: 9 cm/s
    # Note: Table 5.1 does NOT report chamber pressure.
    anchor_run = {
        "run_id": "RUN-01-ANCHOR",
        "is_anchor": True,
        "material": "flat PMMA",
        "sample_geometry": "slab (1.0 mm thick x 2.2 cm width, 1 side burning, Table 5.1)",
        "o2_pct": 22.2,
        "pressure_psi": None,
        "airflow_speed_cm_s": 9.0,
        "target_gravity_regimes": ["microgravity", "1g"],
        "why_chosen": "Baseline Anchor Run matching documented BASS-II flight test M1 (NASA/TM-20210011385 Table 5.1, Page 57, PDF Page 65) to calibrate flammability thresholds across identical flight hardware. Pressure was not reported in Table 5.1.",
        "nearest_investigation": "BASS-II (PSI-25)",
        "gap_distance_normalized": 0.0,
        "documentation_source": "NASA/TM-20210011385 Table 5.1, Page 57 (PDF Page 65), Row 1 (Test M1, 1 mm thick flat PMMA, 22.2% initial O2, 9.0 cm/s velocity; pressure not reported in Table 5.1)"
    }

    # 2. Lunar Exploration Habitat Region:
    # Source: NTRS-20210022143 lines 384-387: "The planned environment for future lunar habitats is 34% O2 and 8.2 psi."
    # Airflow: Table 5.1 min/max across all 20 flat-PMMA tests is 2.0 to 21.0 cm/s (min in M16, max in M11).
    # We generate 11 candidate test points sampling the exploration envelope:
    # O2: [32.0, 36.0] % (centered at 34.0%)
    # Pressure: [7.8, 8.6] psi (centered at 8.2 psi)
    # Airflow: [2.0, 21.0] cm/s (Table 5.1 range)

    # Center point explicitly included (Run 2: nominal target)
    nominal_run = {
        "run_id": "RUN-02",
        "is_anchor": False,
        "material": "flat PMMA",
        "sample_geometry": "slab (1.0 mm thick x 2.2 cm width, 1 side burning, Table 5.1)",
        "o2_pct": 34.0,
        "pressure_psi": 8.2,
        "airflow_speed_cm_s": 9.0,
        "target_gravity_regimes": ["microgravity", "1g"],
        "why_chosen": "Nominal planned lunar exploration habitat design point (NTRS-20210022143: 34% O2, 8.2 psi) matching anchor convective flow speed (9.0 cm/s).",
        "nearest_investigation": "BASS-II (PSI-25)",
        "gap_distance_normalized": round(math.sqrt(((34.0 - 22.2)/100.0)**2 + ((9.0 - 9.0)/60.0)**2), 4),
        "documentation_source": "Planned lunar habitat baseline (NTRS-20210022143)"
    }

    # Remaining 10 candidate test points within Table 5.1 airflow range [2.0, 21.0] cm/s:
    envelope_points = [
        (32.0, 7.8, 2.0, "Lower envelope bound for O2 and pressure at minimum documented Table 5.1 flow velocity (2.0 cm/s)."),
        (32.0, 8.6, 21.0, "Lower O2 with upper cabin pressure bound at maximum documented Table 5.1 flow velocity (21.0 cm/s)."),
        (36.0, 7.8, 21.0, "Elevated O2 limit (36%) at reduced pressure and maximum flow velocity (21.0 cm/s) to test forced convective spread vs blow-off."),
        (36.0, 8.6, 2.0, "Worst-case flammability bound: high O2 (36%), high pressure (8.6 psi) at minimum convective velocity (2.0 cm/s)."),
        (34.0, 8.2, 2.0, "Nominal lunar atmosphere (34% O2, 8.2 psi) at minimum Table 5.1 flow boundary (2.0 cm/s) to document near-quiescent limit."),
        (34.0, 8.2, 21.0, "Nominal lunar atmosphere (34% O2, 8.2 psi) at maximum Table 5.1 flow boundary (21.0 cm/s) to document forced convection limit."),
        (33.0, 8.0, 5.0, "Interior intermediate condition documenting pressure sensitivity around 8.0 psi with moderate flow (5.0 cm/s)."),
        (35.0, 8.4, 15.0, "Interior intermediate condition documenting enriched oxygen sensitivity around 35% O2 with high flow (15.0 cm/s)."),
        (34.0, 7.8, 9.0, "Pressure excursion minimum (7.8 psi) at nominal 34% O2 matching anchor flow speed (9.0 cm/s)."),
        (34.0, 8.6, 9.0, "Pressure excursion maximum (8.6 psi) at nominal 34% O2 matching anchor flow speed (9.0 cm/s).")
    ]

    candidate_runs = []
    for idx, (o2, press, flow, reason) in enumerate(envelope_points, start=3):
        # Calculate normalized evidence gap distance relative to BASS-II Table 5.1 Row 1 anchor (22.2% O2, 9.0 cm/s)
        d_o2 = (o2 - 22.2) / 100.0
        d_flow = (flow - 9.0) / 60.0
        dist = round(math.sqrt(d_o2**2 + d_flow**2), 4)

        candidate_runs.append({
            "run_id": f"RUN-{idx:02d}",
            "is_anchor": False,
            "material": "flat PMMA",
            "sample_geometry": "slab (1.0 mm thick x 2.2 cm width, 1 side burning, Table 5.1)",
            "o2_pct": round(float(o2), 1),
            "pressure_psi": round(float(press), 2),
            "airflow_speed_cm_s": round(float(flow), 1),
            "target_gravity_regimes": ["microgravity", "1g"],
            "why_chosen": reason,
            "nearest_investigation": "BASS-II (PSI-25)",
            "gap_distance_normalized": dist,
            "documentation_source": "NTRS-20210022143 lunar envelope candidate test design"
        })

    all_runs = [anchor_run, nominal_run] + candidate_runs
    assert len(all_runs) <= 12, f"Total runs must be <= 12, got {len(all_runs)}"

    output_payload = {
        "schema_version": "1.0",
        "title": "Proposed Candidate Experiment Design for Lunar Exploration Atmosphere",
        "description": "Proposed experimental test matrix to document solid material flammability in planned lunar habitat atmospheres (34% O2, 8.2 psi). Conditions were chosen by the team by hand around the planned lunar habitat and Table 5.1 ranges; no computed gap analysis was performed. Contains ZERO predicted outcomes.",
        "label": "defined by the PYRO-ASTRA team",
        "disclaimer": "Proposed conditions to document. Not safety advice.",
        "hand_chosen_statement": "Conditions were chosen by the team by hand around the planned lunar habitat and Table 5.1 ranges, and no computed gap analysis was performed.",
        "solid_fuel_o2_constraint": "the only solid-fuel O2 values we could source are BASS-II Table 5.1 (20 flat-PMMA tests, 16.8-22.2% O2); BASS, SAFFIRE-II and SAME do not report O2 in the public metadata.",
        "fixed_seed": 42,
        "material_class": "flat PMMA (polymethyl methacrylate)",
        "sample_dimensions": "10 cm length x 2.2 cm width x 1.0 mm thickness (standard Table 5.1 MSG flow duct geometry)",
        "atmosphere_source": "NASA NTRS-20210022143 (34% O2, 8.2 psi)",
        "airflow_source": "NASA/TM-20210011385 Table 5.1, Page 57 (2.0 to 21.0 cm/s for flat PMMA)",
        "gravity_regimes_tested": "microgravity (flight) and 1g (ground) companion bounds",
        "partial_gravity_note": "NASA PSI currently holds no partial-gravity combustion data. Future partial-gravity data are expected from the LUCI (Lunar Combustion Investigation) and FM2 (Flammability of Materials on the Moon) spaceflight experiments. No partial-gravity predictions are made.",
        "total_runs": len(all_runs),
        "anchor_run_id": "RUN-01-ANCHOR",
        "runs": all_runs
    }

    out_dir = os.path.join("data", "analysis")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "proposed_experiments.json")

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    print(f"Successfully generated {len(all_runs)} proposed experiment runs in {out_file}")
    return output_payload

if __name__ == "__main__":
    generate_experiment_design()
