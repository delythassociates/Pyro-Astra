# PYRO-ASTRA Project Notes & Conflicts

This file tracks source conflicts, missing PSI files, DOI status, and human decisions.

## Verified vs Unverified DOIs
- PSI-102 SAME: DOI `10.60555/gd4k-8h62`, license CC0-1.0 (Verified on NASA PSI page).
- PSI-101 SAME-R: DOI `10.60555/2np7-jv14` (Unverified, matches PSI repository).
- PSI-25 BASS-II: DOI `10.60555/4qc4-de67` (Confirmed on NASA PSI repository; Fallback: NASA/TM-20210011385, Table 5.1, 20 tests hand-entered with page numbers).
- PSI-26 BASS: DOI `10.60555/58h4-dy80` (Verified on NASA PSI repository).
- PSI-99 SAFFIRE-II: DOI `10.60555/2chp-m469` (Cygnus flight data + 1g companion tests, bounds panel source).
- PSI-69 FLEX: DOI `10.60555/mbq8-0451` (MDCA droplet combustion in sealed CIR chamber, 125 tests).
- PSI-159 CFI-G: DOI `10.60555/cyt1-kh64` (ACME gaseous cool flames; burner flow O2 21-85%, cabin O2 is null).
- PSI-68 FLEX-2: DOI `10.60555/byp8-h018` (Droplet array extinction condition ranges, 65 tests).
- Catalog records: PSI-98, PSI-100, PSI-39, PSI-20, PSI-21, PSI-10, PSI-22 (E-FIELD electric-field analog), PSI-23, PSI-107, PSI-106.

## Exact Unit Conversions Audit (Rule 3)
- Pressure conversion: `1 psi = 6.894757 kPa` (exact ISO definition).
- Standard atmosphere conversion: `1 atm = 14.6959 psi` (exact standard).
- All conversions are explicitly noted in the provenance field of each record.

## Data Source Conflicts & Actions
- CFI-G (PSI-159): Burner flow oxygen is up to 85% in coflow. Strictly mapped to `burner_flow_o2_pct`, with `cabin_o2_pct` stored as `null` in compliance with Rule 4.
- SAFFIRE-II (PSI-99): Microgravity Cygnus flight results and normal-gravity (1g) companion tests are provided in `data/bounds.json` with the required explicit disclaimer 'bounds, not predictions; the direction varies by material'.
- E-FIELD (PSI-22): Uses an electric field to mimic buoyant plume behavior; classified under `gravity_regimes: ['electric-field-analog', 'microgravity']` and never as partial gravity.


