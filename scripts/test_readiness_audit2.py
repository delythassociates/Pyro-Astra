import json

with open('analysis/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

with open('data/investigations.json', 'r', encoding='utf-8') as f:
    all_invs = json.load(f)

deep_records = [r for r in all_invs if r.get('depth') == 'deep']

def material_matches(mat_class, r):
    mc = mat_class.lower()
    fuels = [str(f).lower() for f in (r.get("fuels", {}) or {}).get("value", []) or []]
    name = r.get("name", "").lower()
    obj = str((r.get("objectives", {}) or {}).get("value", "")).lower()
    acronym = r.get("acronym", "").lower()

    if "pmma" in mc or "acrylic" in mc:
        return any("pmma" in f or "acrylic" in f for f in fuels) or "pmma" in obj
    if "cotton" in mc or "textile" in mc or "fabric" in mc:
        return any("cotton" in f or "fabric" in f or "sibal" in f or "nomex" in f for f in fuels)
    if "delrin" in mc or "pom" in mc:
        return any("delrin" in f or "pom" in f for f in fuels)
    if "silicone" in mc or "polymer" in mc:
        return any("silicone" in f or "kapton" in f or "polymer" in f for f in fuels)
    if "droplet" in mc or "liquid" in mc or "alkane" in mc:
        return any(x in f for f in fuels for x in ["heptane", "methanol", "decane", "ethanol", "droplet"]) or "droplet" in name or "droplet" in obj
    if "pyrolysis" in mc or "smoke" in mc:
        return "smoke" in name or "same" in acronym or "pyrolysis" in obj
    if "methane" in mc or "gaseous" in mc:
        return any("methane" in f or "ethylene" in f or "gas" in f for f in fuels) or "gases" in name or "cfi" in acronym
    if "battery" in mc or "lib" in mc:
        return any("battery" in f or "lib" in f for f in fuels) or "battery" in obj
    return False

def range_overlap(r1, r2):
    if r1 is None or r2 is None:
        return False
    min1 = r1["min"] if r1.get("min") is not None else r1.get("max")
    max1 = r1["max"] if r1.get("max") is not None else r1.get("min")
    min2 = r2["min"] if r2.get("min") is not None else r2.get("max")
    max2 = r2["max"] if r2.get("max") is not None else r2.get("min")
    if min1 is None or max1 is None or min2 is None or max2 is None:
        return False
    return max(min1, min2) <= min(max1, max2)

def overlap_fraction(tested, target):
    if tested is None or target is None:
        return 0.0
    t_min = tested["min"] if tested.get("min") is not None else tested.get("max")
    t_max = tested["max"] if tested.get("max") is not None else tested.get("min")
    tg_min = target["min"] if target.get("min") is not None else target.get("max")
    tg_max = target["max"] if target.get("max") is not None else target.get("min")
    if tg_min == tg_max:
        return 1.0 if t_min <= tg_min <= t_max else 0.0
    inter_len = max(0.0, min(t_max, tg_max) - max(t_min, tg_min))
    tg_len = max(1e-6, tg_max - tg_min)
    return min(1.0, inter_len / tg_len)

print("=" * 80)
print("AUDITING 20 QUESTIONS PER-PARAMETER EVIDENCE (RULE: NULL NEVER COUNTS AS COVERED)")
print("=" * 80)

baseline_counts = {"Documented": 0, "Partially documented": 0, "Not documented": 0, "Not assessable": 0}
strict_counts = {"Documented": 0, "Partially documented": 0, "Not documented": 0, "Not assessable": 0}

detailed_report = []

for q in questions:
    qid = q["id"]
    text = q["text"]
    req = q["required_conditions"]
    grav = req["gravity_regime"]

    # Rule 5 check
    if "partial" in grav:
        baseline_counts["Not assessable"] += 1
        strict_counts["Not assessable"] += 1
        detailed_report.append({
            "id": qid,
            "text": text,
            "verdict": "Not assessable",
            "strict_verdict": "Not assessable",
            "reason": "No public partial-gravity combustion data (source: challenge brief)",
            "parameters": {
                "gravity": {"required": grav, "status": "Not available in PSI (Rule 5)"},
                "material": {"required": req["material_class"], "status": "Not assessed"},
                "o2": {"required": req.get("o2_range"), "status": "Not assessed"},
                "pressure": {"required": req.get("pressure_range"), "status": "Not assessed"},
                "airflow": {"required": req.get("airflow_range"), "status": "Not assessed"}
            },
            "evidence": []
        })
        continue

    # Evaluate against deep records
    candidate_matches = []
    partial_matches = []

    for r in deep_records:
        regimes = r.get("gravity_regimes", [])
        regime_match = (grav == "microgravity" and "microgravity" in regimes) or (grav == "1g" and "1g" in regimes)
        mat_match = material_matches(req["material_class"], r)

        if not mat_match:
            continue

        # Per-parameter extraction
        c_o2_val = (r.get("cabin_o2_pct") or {}).get("value")
        p_val = (r.get("pressure_psi") or {}).get("value")
        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
        burner_o2_val = (r.get("burner_flow_o2_pct") or {}).get("value")

        # Required parameters
        req_o2 = req.get("o2_range")
        req_p = req.get("pressure_range")
        req_flow = req.get("airflow_range")

        # Overlaps (Rule: NULL NEVER COUNTS AS COVERED)
        o2_covered = range_overlap(c_o2_val, req_o2) if req_o2 is not None else True
        p_covered = range_overlap(p_val, req_p) if req_p is not None else True
        flow_covered = range_overlap(flow_val, req_flow) if req_flow is not None else True

        null_params = []
        if req_o2 is not None and c_o2_val is None:
            null_params.append("cabin_o2_pct (null)")
        if req_p is not None and p_val is None:
            null_params.append("pressure_psi (null)")
        if req_flow is not None and flow_val is None:
            null_params.append("airflow_speed_cm_s (null)")

        param_evidence = {
            "record_id": r["id"],
            "acronym": r["acronym"],
            "regime_match": regime_match,
            "mat_match": mat_match,
            "cabin_o2": {"tested": c_o2_val, "covered": o2_covered, "key_path": "cabin_o2_pct.value"},
            "pressure": {"tested": p_val, "covered": p_covered, "key_path": "pressure_psi.value"},
            "airflow": {"tested": flow_val, "covered": flow_covered, "key_path": "airflow_speed_cm_s.value"},
            "null_required_parameters": null_params
        }

        # Check strict fractions
        frac_o2 = overlap_fraction(c_o2_val, req_o2) if req_o2 is not None else 1.0
        frac_p = overlap_fraction(p_val, req_p) if req_p is not None else 1.0
        frac_flow = overlap_fraction(flow_val, req_flow) if req_flow is not None else 1.0

        is_strict = (frac_o2 >= 0.5) and (frac_p >= 0.5) and (frac_flow >= 0.5)

        if regime_match and o2_covered and p_covered and flow_covered and len(null_params) == 0:
            candidate_matches.append((param_evidence, is_strict))
        else:
            partial_matches.append(param_evidence)

    if candidate_matches:
        verdict = "Documented"
        baseline_counts["Documented"] += 1
        strict_verdict = "Documented" if any(s for _, s in candidate_matches) else "Partially documented"
        strict_counts[strict_verdict] += 1
        evidence = [e for e, _ in candidate_matches]
    elif partial_matches:
        verdict = "Partially documented"
        baseline_counts["Partially documented"] += 1
        strict_counts["Partially documented"] += 1
        strict_verdict = "Partially documented"
        evidence = partial_matches
    else:
        verdict = "Not documented"
        baseline_counts["Not documented"] += 1
        strict_counts["Not documented"] += 1
        strict_verdict = "Not documented"
        evidence = []

    detailed_report.append({
        "id": qid,
        "text": text,
        "verdict": verdict,
        "strict_verdict": strict_verdict,
        "candidate_matches_count": len(candidate_matches),
        "partial_matches_count": len(partial_matches),
        "evidence": evidence
    })

print(f"BASELINE COUNTS: {baseline_counts}")
print(f"STRICT COUNTS:   {strict_counts}")

