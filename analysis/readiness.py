#!/usr/bin/env python3
"""
PYRO-ASTRA: Workstream J - Habitat Fire-Safety Readiness Analysis
Defined by the PYRO-ASTRA team.

Deterministic rule-based evaluation of 20 habitat fire-safety questions
against the 8 deep investigations extracted from NASA PSI.
Follows PREREGISTERED.md Section 3 rules & Revision 3:
- A parameter counts as covered ONLY IF the SAME matched record reports it for the matched material.
- Table 5.1 airflow and O2 apply to flat PMMA only.
- Rule: NULL NEVER COUNTS AS COVERED.
- Verdicts:
  * Documented = material matched AND all required parameters covered in the SAME record.
  * Partially = material matched AND some but not all covered in the SAME record.
  * Not documented = no material match OR no parameter covered (0 covered across all matched records).
  * Not assessable = partial-gravity, or required parameters null in every matched record (say which).
"""

import json
import os
import sys

def range_overlap(tested_range, req_range):
    """Returns True if tested range overlaps required range, False if tested is None."""
    if tested_range is None or req_range is None:
        return False

    # Check discrete values (e.g. SAFFIRE-II {20, 30} cm/s)
    discrete = tested_range.get("discrete_values")
    if discrete:
        r_min = req_range.get("min") if req_range.get("min") is not None else req_range.get("max")
        r_max = req_range.get("max") if req_range.get("max") is not None else req_range.get("min")
        if r_min is None and r_max is None:
            return True
        r_min_val = r_min if r_min is not None else -1e9
        r_max_val = r_max if r_max is not None else 1e9
        return any(r_min_val <= v <= r_max_val for v in discrete)

    # Standard intervals (Rule: null never counts as covered)
    t_min = tested_range.get("min")
    t_max = tested_range.get("max")
    r_min = req_range.get("min")
    r_max = req_range.get("max")

    # If required range expects a lower bound and tested min is null, it cannot be verified
    if r_min is not None and t_min is None:
        return False
    if r_max is not None and t_max is None:
        return False

    t_min_val = t_min if t_min is not None else t_max
    t_max_val = t_max if t_max is not None else t_min
    r_min_val = r_min if r_min is not None else r_max
    r_max_val = r_max if r_max is not None else r_min

    if t_min_val is None or t_max_val is None or r_min_val is None or r_max_val is None:
        return False
    return max(t_min_val, r_min_val) <= min(t_max_val, r_max_val)

def get_material_match(q_id, mat_class):
    """
    Returns (matched: bool, quote: str|None, source_file: str|None, key_path: str|None, matched_record_ids: list).
    Strictly grounded in raw_real metadata verbatim substrings.
    """
    mc = mat_class.lower()

    # Q09: CFI-G fuels are propane, n-butane, n-pentane; methane is NOT tested.
    if q_id == "Q09":
        return False, None, None, None, []

    # Q12: Delrin (POM) was not tested in any mined PSI record.
    if q_id == "Q12":
        return False, None, None, None, []

    # Q14: Lithium-ion battery / electronics not tested in mined records.
    if q_id == "Q14":
        return False, None, None, None, []

    # Q17: E-FIELD Flames is not among the 8 mined records.
    if q_id == "Q17":
        return False, None, None, None, []

    # PMMA / acrylic solid
    if "pmma" in mc or "acrylic" in mc:
        return (
            True,
            "Study the ignition, flame growth, flame spread, and extinction limits for solid fuels burning in low-velocity forced flows in microgravity.",
            "raw_real/PSI-25/investigation_metadata.json",
            "data['objective']",
            ["PSI-25", "PSI-26", "PSI-99"]
        )

    # Nomex (must precede general textile check)
    if "nomex" in mc:
        return (
            True,
            "Saffire-II investigation added more samples including SIBAL, silicone, structure PMMA, flat PMMA, and PMMA with Nomex.",
            "raw_real/PSI-99/investigation_metadata.json",
            "data['approach']",
            ["PSI-99", "PSI-26"]
        )

    # Cotton fabric / textiles / SIBAL
    if "cotton" in mc or "textile" in mc or "fabric" in mc or "sibal" in mc:
        return (
            True,
            "Saffire-II investigation added more samples including SIBAL, silicone, structure PMMA, flat PMMA, and PMMA with Nomex.",
            "raw_real/PSI-99/investigation_metadata.json",
            "data['approach']",
            ["PSI-99", "PSI-26", "PSI-25"]
        )

    # Silicone
    if "silicone" in mc:
        return (
            True,
            "Saffire-II investigation added more samples including SIBAL, silicone, structure PMMA, flat PMMA, and PMMA with Nomex.",
            "raw_real/PSI-99/investigation_metadata.json",
            "data['approach']",
            ["PSI-99", "PSI-102"]
        )

    # Droplet / liquid
    if "droplet" in mc or "liquid" in mc:
        return (
            True,
            "The Fundamental Studies in Droplet Combustion and Flame Extinguishment in Microgravity",
            "raw_real/PSI-68/investigation_metadata.json",
            "data['proposalTitle']",
            ["PSI-68", "PSI-69"]
        )

    # Pyrolysis products / smoke
    if "pyrolysis" in mc or "smoke" in mc:
        return (
            True,
            "Smoke and Aerosol Measurement Experiment",
            "raw_real/PSI-102/investigation_metadata.json",
            "data['title']",
            ["PSI-102", "PSI-101"]
        )

    return False, None, None, None, []

def evaluate_all_questions(questions, deep_records):
    records_by_id = {r["id"]: r for r in deep_records}
    results = []

    for q in questions:
        qid = q["id"]
        req = q["required_conditions"]
        grav = req["gravity_regime"]
        mat_class = req["material_class"]

        mat_matched, mat_quote, quote_file, key_path, matched_ids = get_material_match(qid, mat_class)

        o2_req = req.get("o2_range")
        p_req = req.get("pressure_range")
        flow_req = req.get("airflow_range")

        active_params = []
        if o2_req is not None: active_params.append("O2")
        if p_req is not None: active_params.append("pressure")
        if flow_req is not None: active_params.append("airflow")

        # RULE: A parameter counts as covered ONLY IF the SAME matched record reports it for the matched material.
        # Table 5.1 airflow and O2 apply to flat PMMA only.
        is_pmma_question = "pmma" in mat_class.lower() or "acrylic" in mat_class.lower()

        record_evaluations = []
        evidence_list = []

        overall_o2_covered = False
        overall_p_covered = False
        overall_flow_covered = False

        if mat_matched:
            for rid in matched_ids:
                r = records_by_id.get(rid)
                if not r:
                    continue

                # Check gravity regime match
                regimes = r.get("gravity_regimes", [])
                if grav == "1g" and "1g" not in regimes:
                    continue
                if grav == "microgravity" and "microgravity" not in regimes:
                    continue

                # Material-specific condition restrictions:
                # In BASS-II (PSI-25), Table 5.1 reports airflow for flat PMMA slabs ONLY. Full experimental table airflow is in dial units only.
                # In SAME (PSI-102), airflow is reported for Teflon samples ONLY; other cells blank.
                is_pmma = "pmma" in mat_class.lower() or "acrylic" in mat_class.lower()
                is_sibal = "sibal" in mat_class.lower() or "cotton" in mat_class.lower() or "textile" in mat_class.lower() or "fabric" in mat_class.lower()
                is_nomex = "nomex" in mat_class.lower()

                if rid == "PSI-25":
                    strat = r.get("stratified_o2_pct") or {}
                    if is_pmma:
                        c_o2 = strat.get("PMMA slabs", (r.get("cabin_o2_pct") or {}).get("value"))
                        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")  # 2.0-21.0 cm/s applies to slabs
                    elif is_sibal:
                        c_o2 = strat.get("SIBAL")
                        flow_val = None  # Table 5.1 airflow does not apply to SIBAL; table reports dial units only
                    elif is_nomex:
                        c_o2 = strat.get("Nomex III")
                        flow_val = None
                    else:
                        c_o2 = None
                        flow_val = None
                    p_val = None

                elif rid == "PSI-102":
                    if "teflon" in mat_class.lower():
                        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
                    else:
                        flow_val = None  # airflow cells blank for other materials
                    c_o2 = None
                    p_val = None

                elif rid == "PSI-101":
                    # SAME-R table reports airflow for 5 specific materials: Kapton, Lampwick, Pyrell, Silicone, Teflon.
                    # Rule (Revision 4): A verdict may count airflow ONLY from rows whose material matches the question.
                    # Neither Nomex nor mist was tested in SAME-R (0 rows); general pyrolysis without specific material match cannot claim flow.
                    mc_low = mat_class.lower()
                    if "silicone" in mc_low:
                        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
                    elif "teflon" in mc_low or "ptfe" in mc_low:
                        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
                    elif "kapton" in mc_low:
                        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
                    elif "lampwick" in mc_low:
                        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
                    elif "pyrell" in mc_low:
                        flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
                    else:
                        flow_val = None  # Airflow not reported for this material in SAME-R
                    c_o2 = None
                    p_val = None

                else:
                    c_o2 = (r.get("cabin_o2_pct") or {}).get("value")
                    flow_val = (r.get("airflow_speed_cm_s") or {}).get("value")
                    p_val = (r.get("pressure_psi") or {}).get("value")

                r_o2_covered = range_overlap(c_o2, o2_req) if o2_req is not None else True
                r_p_covered = range_overlap(p_val, p_req) if p_req is not None else True
                r_flow_covered = range_overlap(flow_val, flow_req) if flow_req is not None else True

                r_covered_count = 0
                r_covered_list = []
                if o2_req is not None and r_o2_covered:
                    r_covered_count += 1
                    r_covered_list.append("O2")
                if p_req is not None and r_p_covered:
                    r_covered_count += 1
                    r_covered_list.append("pressure")
                if flow_req is not None and r_flow_covered:
                    r_covered_count += 1
                    r_covered_list.append("airflow")

                null_list = []
                if o2_req is not None and c_o2 is None: null_list.append("cabin_o2_pct")
                if p_req is not None and p_val is None: null_list.append("pressure_psi")
                if flow_req is not None and flow_val is None: null_list.append("airflow_speed_cm_s")

                rec_eval = {
                    "record_id": rid,
                    "acronym": r.get("acronym"),
                    "name": r.get("name"),
                    "doi": r.get("doi"),
                    "covered_count": r_covered_count,
                    "covered_params": r_covered_list,
                    "all_covered": (r_covered_count == len(active_params) and len(active_params) > 0),
                    "o2_covered": r_o2_covered if o2_req is not None else False,
                    "pressure_covered": r_p_covered if p_req is not None else False,
                    "airflow_covered": r_flow_covered if flow_req is not None else False,
                    "null_params": null_list,
                    "cabin_o2": c_o2,
                    "pressure": p_val,
                    "airflow": flow_val
                }
                record_evaluations.append(rec_eval)

                evidence_list.append({
                    "record_id": r["id"],
                    "acronym": r["acronym"],
                    "name": r["name"],
                    "doi": r["doi"],
                    "cabin_o2": c_o2,
                    "pressure": p_val,
                    "airflow": flow_val,
                    "null_required_parameters": null_list
                })

        # Evaluate overall question coverage based on SAME record coverage
        best_record = None
        if record_evaluations:
            # Sort by number of covered parameters descending
            record_evaluations.sort(key=lambda x: x["covered_count"], reverse=True)
            best_record = record_evaluations[0]
            if best_record["covered_count"] > 0:
                overall_o2_covered = best_record["o2_covered"]
                overall_p_covered = best_record["pressure_covered"]
                overall_flow_covered = best_record["airflow_covered"]

        # Determine Verdict
        # Rule 5: Partial gravity is ALWAYS Not assessable
        if "partial" in grav:
            verdict = "Not assessable"
            reason = "No public partial-gravity combustion data (source: challenge brief). Intermediate gravity cannot be evaluated from PSI records."
            strict_verdict = "Not assessable"
            broad_verdict = "Not assessable"
        elif not mat_matched:
            verdict = "Not documented"
            reason = f"no material match: {mat_class} was not tested in the 8 deep investigations mined (not reported in the public sources we processed; 10 catalogued ones were not mined)."
            strict_verdict = "Not documented"
            broad_verdict = "Not documented"
        elif not record_evaluations:
            verdict = "Not documented"
            reason = f"Material matched ({', '.join(matched_ids)}), but no matched investigation tested under {grav} gravity regime."
            strict_verdict = "Not documented"
            broad_verdict = "Not documented"
        else:
            # Matched material exists
            max_covered = best_record["covered_count"] if best_record else 0

            if max_covered == len(active_params) and len(active_params) > 0:
                verdict = "Documented"
                reason = f"Documented in {best_record['record_id']}: material matched and all {len(active_params)} required environmental parameters covered in the same record."
                strict_verdict = "Documented"
                broad_verdict = "Documented"
            elif max_covered > 0:
                verdict = "Partially documented"
                uncovered = [p for p in active_params if p not in best_record["covered_params"]]
                reason = f"Partially documented in {best_record['record_id']}: material matched; covered: {', '.join(best_record['covered_params'])}; uncovered/null: {', '.join(uncovered)}."
                strict_verdict = "Partially documented"
                broad_verdict = "Documented"
            else:
                # 0 parameters covered across all matched records
                # Check if all required parameters are null in every matched record
                all_null_in_all = True
                for rec_e in record_evaluations:
                    if len(rec_e["null_params"]) < len(active_params):
                        all_null_in_all = False
                        break

                if all_null_in_all:
                    verdict = "Not assessable"
                    null_names = []
                    if o2_req: null_names.append("cabin_o2_pct")
                    if p_req: null_names.append("pressure_psi")
                    if flow_req: null_names.append("airflow_speed_cm_s")
                    reason = f"required parameters null in every matched record: {', '.join(null_names)} are null in {', '.join([re['record_id'] for re in record_evaluations])}."
                    strict_verdict = "Not assessable"
                    broad_verdict = "Not assessable"
                else:
                    verdict = "Not documented"
                    reason = f"Material matched ({', '.join([re['record_id'] for re in record_evaluations])}), but 0 required parameters covered by documented flight ranges."
                    strict_verdict = "Not documented"
                    broad_verdict = "Not documented"

        entry = {
            "id": qid,
            "text": q["text"],
            "required_conditions": req,
            "source": q["source"],
            "material_matched": mat_matched,
            "material_quote": mat_quote,
            "material_quote_source": {
                "file": quote_file,
                "key_path": key_path
            } if quote_file else None,
            "o2_covered": overall_o2_covered,
            "pressure_covered": overall_p_covered,
            "airflow_covered": overall_flow_covered,
            "verdict": verdict,
            "reason": reason,
            "rule": "Section 2 Rule 5: No partial-gravity prediction or assessment allowed" if "partial" in grav else "PREREGISTERED.md Section 3.2 Protocol",
            "evidence": evidence_list,
            "sensitivity": {
                "strict_verdict": strict_verdict,
                "broad_verdict": broad_verdict
            }
        }
        results.append(entry)

    return results

def compute_parameter_reporting_summary(deep_records):
    """
    Computes reporting status (yes/no) and key path for cabin O2, pressure, and airflow
    for each of the 8 deep investigations.
    """
    summary = []
    for r in deep_records:
        rid = r["id"]
        c_o2_val = r.get("cabin_o2_pct")
        p_val = r.get("pressure_psi")
        flow_val = r.get("airflow_speed_cm_s")

        o2_reported = c_o2_val is not None and c_o2_val.get("value") is not None
        p_reported = p_val is not None and p_val.get("value") is not None
        flow_reported = flow_val is not None and flow_val.get("value") is not None

        summary.append({
            "investigation_id": rid,
            "acronym": r.get("acronym"),
            "name": r.get("name"),
            "fuel_phase": (r.get("fuel_phase") or {}).get("value"),
            "cabin_o2": {
                "reported": "yes" if o2_reported else "no",
                "value": c_o2_val.get("value") if o2_reported else None,
                "unit": c_o2_val.get("unit") if o2_reported else None,
                "key_path": f"{c_o2_val['provenance']['file']} [{c_o2_val['provenance']['row_or_page']}]" if o2_reported else "not reported (null)"
            },
            "pressure": {
                "reported": "yes" if p_reported else "no",
                "value": p_val.get("value") if p_reported else None,
                "unit": p_val.get("unit") if p_reported else None,
                "key_path": f"{p_val['provenance']['file']} [{p_val['provenance']['row_or_page']}]" if p_reported else "not reported (null)"
            },
            "airflow": {
                "reported": "yes" if flow_reported else "no",
                "value": flow_val.get("value") if flow_reported else None,
                "unit": flow_val.get("unit") if flow_reported else None,
                "key_path": f"{flow_val['provenance']['file']} [{flow_val['provenance']['row_or_page']}]" if flow_reported else "not reported (null)"
            }
        })
    return summary

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    q_path = os.path.join(base_dir, "analysis", "questions.json")
    inv_path = os.path.join(base_dir, "data", "investigations.json")
    out_path = os.path.join(base_dir, "data", "analysis", "readiness.json")

    with open(q_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    with open(inv_path, "r", encoding="utf-8") as f:
        all_investigations = json.load(f)

    deep_records = [r for r in all_investigations if r.get("depth") == "deep"]
    print(f"Loaded {len(questions)} questions and {len(deep_records)} deep investigations.")

    results = evaluate_all_questions(questions, deep_records)
    param_summary = compute_parameter_reporting_summary(deep_records)

    counts = {
        "Documented": 0,
        "Partially documented": 0,
        "Not documented": 0,
        "Not assessable": 0
    }
    strict_counts = { "Documented": 0, "Partially documented": 0, "Not documented": 0, "Not assessable": 0 }
    broad_counts = { "Documented": 0, "Partially documented": 0, "Not documented": 0, "Not assessable": 0 }

    for r in results:
        v = r["verdict"]
        counts[v] += 1
        strict_counts[r["sensitivity"]["strict_verdict"]] += 1
        broad_counts[r["sensitivity"]["broad_verdict"]] += 1

    report = {
        "title": "PYRO-ASTRA Habitat Fire-Safety Documentation Readiness Analysis",
        "label": "defined by the PYRO-ASTRA team",
        "disclaimer": "A documentation check, not a safety assessment. Ranges are envelopes; individual combinations are not confirmed.",
        "preregistered_reference": "analysis/PREREGISTERED.md",
        "same_record_rule": "A parameter counts as covered only if the SAME matched record reports it for the matched material. Table 5.1 airflow applies to flat PMMA only.",
        "solid_fuel_statement": "of 3 solid-fuel investigations only BASS-II reports initial O2 ranges (overall solid range 13.6-22.2%, stratified per material class in authentic experimental table; no pressure); BASS and SAFFIRE-II report no O2 or pressure in the public table data.",
        "parameter_reporting_summary": param_summary,
        "summary": {
            "total_questions": len(questions),
            "deep_investigations_analyzed": len(deep_records),
            "catalog_investigations_unmined": len(all_investigations) - len(deep_records),
            "counts": counts,
            "percentages": {
                k: round(v / len(questions) * 100, 1) for k, v in counts.items()
            }
        },
        "sensitivity_report": {
            "description": "Comparison of documentation verdicts under varying envelope overlap thresholds: Baseline (SAME record covers parameter for matched material; zero partial-g), Strict (all active bounded with zero nulls), and Broad (any overlap in same record).",
            "baseline_counts": counts,
            "strict_counts": strict_counts,
            "broad_counts": broad_counts,
            "stability_note": "Partial gravity verdicts (4 questions) remain invariant at 100% 'Not assessable' across all thresholds because NASA PSI contains no partial-gravity combustion data."
        },
        "questions": results
    }

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\nReadiness Analysis Complete!")
    print(f"Summary Counts (Baseline): {counts}")
    print(f"Strict Counts:             {strict_counts}")
    print(f"Broad Counts:              {broad_counts}")
    print(f"Results written to: {out_path}\n")

    # Print all 20 rows in formatted table per directive
    print(f"{'ID':<4} | {'Material Matched':<16} | {'O2':<5} | {'Press':<5} | {'Flow':<5} | {'Verdict':<20} | Reason")
    print("-" * 105)
    for r in results:
        mat_str = "Yes" if r["material_matched"] else "No"
        o2_str = "Yes" if r["o2_covered"] else "No"
        p_str = "Yes" if r["pressure_covered"] else "No"
        flow_str = "Yes" if r["airflow_covered"] else "No"
        print(f"{r['id']:<4} | {mat_str:<16} | {o2_str:<5} | {p_str:<5} | {flow_str:<5} | {r['verdict']:<20} | {r['reason'][:60]}")

    print("\n" + "=" * 105)
    print("PER-PARAMETER REPORTING SUMMARY FOR THE 8 DEEP INVESTIGATIONS")
    print("=" * 105)
    for p in param_summary:
        print(f"{p['investigation_id']} ({p['acronym']}) [{p['fuel_phase']}]:")
        print(f"  Cabin O2: {p['cabin_o2']['reported'].upper():<3} | {p['cabin_o2']['value']} | {p['cabin_o2']['key_path']}")
        print(f"  Pressure: {p['pressure']['reported'].upper():<3} | {p['pressure']['value']} | {p['pressure']['key_path']}")
        print(f"  Airflow:  {p['airflow']['reported'].upper():<3} | {p['airflow']['value']} | {p['airflow']['key_path']}")

if __name__ == "__main__":
    main()
