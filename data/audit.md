# PYRO-ASTRA Scientific Provenance Audit Report

Generated from strict verification against `raw_real/<PSI-ID>/investigation_metadata.json` and official NASA reports (`NASA/TM-20210011385` and `NASA/TP-2015-218570`).

## Audit Rule Enforcement (SPEC Section 2 Rule 1 & Rule 2)
- Any numeric value not explicitly stated in steps 1-4 has been set to `null` and registered as 'not reported'.
- No fabricated, simulated, or interpolated numbers are allowed in the repository.

## Kept / Nulled / Changed Values Ledger

| Investigation | Field | Action | Final Value | Verified Source |
|---|---|---|---|---|
| `PSI-25` | `cabin_o2_pct` | **KEPT / VERIFIED** | `16.8 - 22.2 %` | NASA/TM-20210011385 Table 5.1 Page 57 |
| `PSI-25` | `airflow_speed_cm_s` | **KEPT / VERIFIED** | `2.0 - 21.0 cm/s` | NASA/TM-20210011385 Table 5.1 Page 57 |
| `PSI-25` | `n_tests` | **KEPT / VERIFIED** | `20 tests` | NASA/TM-20210011385 Table 5.1 Page 57 |
| `PSI-69` | `pressure_psi` | **KEPT / VERIFIED** | `7.35 - 22.04 psi` | raw_real/PSI-69/investigation_metadata.json data['approach'] |
| `PSI-99 (SAFFIRE-II)` | `data/bounds.json` | **NULLED / EMPTIED** | `[] (empty array: no paired tests in extracted records)` | No paired 0g/1g test rows exist in steps 1-4 files. Per SPEC Section 9: show "no paired tests in extracted records". |