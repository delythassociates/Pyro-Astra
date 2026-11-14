import json

# Let's inspect what happens under strictly audited parameters:
# Authentic audited values:
AUDITED = {
    "PSI-102": { # SAME
        "fuels": ["Kapton", "Teflon", "Silicone", "Pyrel Foam", "Cotton"],
        "cabin_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": None,
        "gravity_regimes": ["microgravity"]
    },
    "PSI-101": { # SAME-R
        "fuels": ["Kapton wire", "Teflon wire", "Cellulose", "Cotton candle wick", "Pyrolene"],
        "cabin_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": None,
        "gravity_regimes": ["microgravity"]
    },
    "PSI-26": { # BASS
        "fuels": ["PMMA", "Cotton/Fiberglass (SIBAL)", "Nomex"],
        "cabin_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": {"min": 0.0, "max": 10.0}, # from approach
        "gravity_regimes": ["microgravity"]
    },
    "PSI-25": { # BASS-II
        "fuels": ["PMMA (flat)", "Cotton", "Nomex", "Delrin"],
        "cabin_o2_pct": {"min": 16.8, "max": 22.2}, # Table 5.1
        "pressure_psi": None, # NOT REPORTED in Table 5.1
        "airflow_speed_cm_s": {"min": 2.0, "max": 21.0}, # Table 5.1
        "gravity_regimes": ["microgravity"]
    },
    "PSI-99": { # SAFFIRE-II
        "fuels": ["Cotton-fiberglass blend (SIBAL)", "Nomex", "PMMA"],
        "cabin_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": {"min": 20.0, "max": 20.0}, # approach: 20 cm/s
        "gravity_regimes": ["microgravity"]
    },
    "PSI-69": { # FLEX
        "fuels": ["Heptane", "Methanol", "Decane"],
        "cabin_o2_pct": None,
        "pressure_psi": {"min": 7.35, "max": 22.04}, # 0.5 to 1.5 atm in approach
        "airflow_speed_cm_s": None,
        "gravity_regimes": ["microgravity"]
    },
    "PSI-159": { # CFI-G
        "fuels": ["Methane", "Ethylene"],
        "cabin_o2_pct": None,
        "burner_flow_o2_pct": {"min": None, "max": 85.0},
        "pressure_psi": {"min": 14.5, "max": 29.4},
        "airflow_speed_cm_s": None,
        "gravity_regimes": ["microgravity"]
    },
    "PSI-68": { # FLEX-2
        "fuels": ["n-Decane", "Heptane/Hexadecane", "Ethanol"],
        "cabin_o2_pct": {"min": 10.0, "max": 40.0},
        "pressure_psi": {"min": 7.35, "max": 44.09},
        "airflow_speed_cm_s": None,
        "gravity_regimes": ["microgravity"]
    }
}

with open('analysis/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print("=== QUESTION EVALUATION AGAINST STRICT AUDIT ===")
for q in questions:
    qid = q['id']
    req = q['required_conditions']
    grav = req['gravity_regime']
    
    if 'partial' in grav:
        print(f"[{qid}] Not assessable (Partial gravity rule 5)")
        continue
        
    # Check matching investigations
    doc_matches = []
    part_matches = []
    
    for inv_id, inv in AUDITED.items():
        # Material check
        fuels = [f.lower() for f in inv.get('fuels', [])]
        mc = req['material_class'].lower()
        mat_match = False
        if 'pmma' in mc or 'acrylic' in mc:
            mat_match = any('pmma' in f for f in fuels)
        elif 'cotton' in mc or 'textile' in mc or 'fabric' in mc:
            mat_match = any('cotton' in f or 'sibal' in f or 'nomex' in f for f in fuels)
        elif 'delrin' in mc or 'pom' in mc:
            mat_match = any('delrin' in f for f in fuels)
        elif 'silicone' in mc:
            mat_match = any('silicone' in f for f in fuels)
        elif 'droplet' in mc or 'liquid' in mc or 'alkane' in mc:
            mat_match = any(x in f for f in fuels for x in ['decane', 'heptane', 'methanol', 'ethanol'])
        elif 'pyrolysis' in mc or 'smoke' in mc:
            mat_match = inv_id in ['PSI-102', 'PSI-101']
        elif 'methane' in mc or 'gaseous' in mc:
            mat_match = any('methane' in f or 'ethylene' in f for f in fuels)
        elif 'battery' in mc or 'lib' in mc:
            mat_match = False
            
        if not mat_match:
            continue
            
        # Parameter checks
        # O2
        c_o2 = inv.get('cabin_o2_pct')
        req_o2 = req.get('o2_range')
        o2_ok = False
        if c_o2 is not None and req_o2 is not None:
            c_min = c_o2['min'] if c_o2['min'] is not None else c_o2['max']
            inter_min = max(c_min, req_o2['min'])
            inter_max = min(c_o2['max'], req_o2['max'])
            o2_ok = inter_max >= inter_min
            
        # Pressure
        p_val = inv.get('pressure_psi')
        req_p = req.get('pressure_range')
        p_ok = False
        if p_val is not None and req_p is not None:
            p_min = p_val['min'] if p_val['min'] is not None else p_val['max']
            inter_min = max(p_min, req_p['min'])
            inter_max = min(p_val['max'], req_p['max'])
            p_ok = inter_max >= inter_min
            
        # Airflow
        flow_val = inv.get('airflow_speed_cm_s')
        req_flow = req.get('airflow_range')
        flow_ok = True
        if req_flow is not None:
            if flow_val is not None:
                f_min = flow_val['min'] if flow_val['min'] is not None else flow_val['max']
                inter_min = max(f_min, req_flow['min'])
                inter_max = min(flow_val['max'], req_flow['max'])
                flow_ok = inter_max >= inter_min
            else:
                flow_ok = False # NULL airflow when airflow is required!
                
        # Rule: NULL NEVER COUNTS AS COVERED!
        # If required condition is specified and tested value is NULL -> NOT covered!
        req_o2_covered = o2_ok if req_o2 is not None else True
        req_p_covered = p_ok if req_p is not None else True
        req_flow_covered = flow_ok if req_flow is not None else True
        
        all_covered = req_o2_covered and req_p_covered and req_flow_covered
        some_covered = (o2_ok or p_ok or (flow_ok and flow_val is not None))
        
        if all_covered:
            doc_matches.append(inv_id)
        elif some_covered or mat_match:
            part_matches.append(inv_id)
            
    if doc_matches:
        print(f"[{qid}] Documented by {doc_matches} (Req: O2={req['o2_range']}, P={req['pressure_range']}, Flow={req['airflow_range']})")
    elif part_matches:
        print(f"[{qid}] Partially documented by {part_matches} (Missing/null parameters!)")
    else:
        print(f"[{qid}] Not documented")

