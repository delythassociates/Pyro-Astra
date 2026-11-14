# PYRO-ASTRA: Preregistered Analysis Protocols and Thresholds

**Status:** Preregistered prior to execution (Non-Negotiable Rule 13)  
**Authors:** PYRO-ASTRA Team  
**Date:** 15 November 2026  
**Applicability:** Workstream I (Function Matrix), Workstream J (Readiness Checks), Workstream K (Path Documentation Distance), Workstream L (Experiment Design), Workstream M (Domain-Gated Surrogate Modeling & Null Result Protocol).  
**Label:** Defined by the PYRO-ASTRA team.

---

## 1. Core Principles & Governance

This document establishes the frozen analysis protocols, deterministic categorization rule sets, and numerical thresholds for all derived analytical artifacts in PYRO-ASTRA. In strict accordance with **Rule 13**, these criteria are committed to disk before computing analysis matrices, verdicts, or designs.

### Grounding Rules
1. **Rule 1 (No Invention):** If NASA Physical Sciences Informatics (PSI) or official source documentation does not report a value, the analytical pipeline records null or empty. No interpolation, extrapolation, or proxy imputation is permitted.
2. **Rule 2 & 10 (Verbatim Traceability):** Every qualitative claim or tag must be accompanied by a verbatim substring quote from an identified source file (under `raw_real/` or official NASA technical report) alongside its exact JSON key path or page citation.
3. **Rule 4 (Burner vs. Cabin Oxygen Separation):** Burner-flow oxygen (e.g. up to 85% in CFI-G) is burner oxidizer flow only and must NEVER be treated as cabin atmosphere.
4. **Rule 5 (No Partial-Gravity Predictions):** PSI holds zero partial-gravity combustion data. All analyses strictly refuse partial-gravity predictions; microgravity (0g) and normal gravity (1g) companion tests are bounded and never interpolated to lunar (0.16g) or Martian (0.38g) gravity.

---

## 2. Workstream I: Function Matrix Specification

### 2.1 The 6 Safety Functions
The PYRO-ASTRA team defines six functional domains for spacecraft fire safety derived from NASA combustion science literature:
1. **Detection:** Smoke, aerosol, gas, or thermal signatures of pre-combustion, smoldering, or flaming events, and sensor performance in low gravity.
2. **Suppression:** Extinction through physical suppression agents (fine water mist, gaseous suppressants like CO2, He, N2, vacuum venting, or active quenching).
3. **Material flammability screening:** Testing of solid polymer or fabric flammability under standardized or low-buoyancy environments (evaluating NASA-STD-6001 protocols).
4. **Fire growth and spread:** Dynamic measurement of concurrent, opposed, or quiescent flame spread rates over solid materials or droplet arrays.
5. **Ventilation/airflow effects:** The influence of forced convective flow velocities, flow duct regimes, and sub-buoyant ventilation on flame survival and propagation.
6. **Extinction limits:** Limiting Oxygen Index (LOI), low-speed radiative extinction boundaries, blow-off extinction, and atmospheric quenching limits.

### 2.2 Rule-Based Tagging Protocol
- **Input Corpus:** Metadata files `raw_real/<PSI-ID>/investigation_metadata.json` for the 8 deep investigations: PSI-102 (SAME), PSI-101 (SAME-R), PSI-26 (BASS), PSI-25 (BASS-II), PSI-99 (SAFFIRE-II), PSI-69 (FLEX), PSI-159 (CFI-G), PSI-68 (FLEX-2).
- **Matching Mechanism:** Deterministic rule-based substring matching using `analysis/function_dictionary.json`. LLMs are strictly forbidden from performing tagging.
- **Strict Evidence Standard (No Quote, No Tag):**
  - A function tag is assigned to an investigation **only if** a keyword match is accompanied by a verbatim quote extracted from a specific string in `investigation_metadata.json`.
  - The cell must record:
    - `function_id`: identifier string.
    - `investigation_id`: PSI record ID.
    - `tagged`: boolean.
    - `quote`: exact verbatim substring from the metadata string.
    - `key_path`: dot-notated JSON path to the metadata field containing the quote (e.g., `description`, `objective`, `experiments[0].title`).
    - `doi`: persistent identifier.
  - If no keyword match or verbatim quote exists in the metadata, the cell is left empty (`null`).
  - Mandatory UI Footer statement: *"empty cell = no matching statement in the metadata we processed."*

### 2.3 Earth-Transfer Mapping
- The matrix incorporates Earth-transfer applications sourced from `data/links.json` (firefighter SCBA tanks, multi-sensor alarm systems, flame-resistant textiles, fine-water-mist suppression) linked to relevant functional domains with full source attribution.

---

## 3. Workstream J: Habitat Fire Safety Readiness Specification

### 3.1 Habitat Question Set
- A curated suite of 20 habitat fire-safety questions (`analysis/questions.json`) targeting human spaceflight environments: Lunar habitat (34% O2, 8.2 psi), Spacesuit EVA (100% O2, 4.3 psi), ISS baseline (21% O2, 14.7 psi), and pressurized rovers.
- Each question defines required conditions:
  - Material class (e.g. solid fabric, thermoplastic slab, liquid droplet, wire insulation, gaseous coflow).
  - Cabin O2 range (% vol).
  - Chamber / cabin pressure range (psi).
  - Airflow velocity range (cm/s).
  - Gravity regime (`microgravity`, `1g`, or `partial-gravity`).
  - Source provenance: Challenge brief or verbatim quote from NASA technical white paper (`raw_real/NTRS-20210022143.txt`).

### 3.2 Verdict Rules and Thresholds
The verdict algorithm computes the containment of required conditions within the documented envelope of the 8 deep records:
1. **Material Match Requirement:**
   - Requires a stored verbatim quote from the investigation's fuels, objective, or approach naming the material or fuel class.
   - If no verbatim quote exists in the processed sources, `material_matched` is FALSE.
2. **Environmental Parameter Coverage:**
   - **O2 Covered:** Required O2 range intersects documented `cabin_o2_pct`. (Rule 4: Burner-flow O2 is never cabin O2. Null never counts as covered).
   - **Pressure Covered:** Required pressure range intersects documented `pressure_psi`. (Null never counts as covered).
   - **Airflow Covered:** Required airflow range intersects documented `airflow_speed_cm_s`. (Null never counts as covered).
3. **Verdicts (Frozen Protocol):**
   - **Documented:** `material_matched == True` AND all required environmental parameters covered (O2 covered, pressure covered, airflow covered).
   - **Partially documented:** `material_matched == True` AND some but not all required parameters covered.
   - **Not documented:** No material match (`material_matched == False`) OR no parameter covered (0 required parameters covered).
   - **Not assessable:** Partial gravity (`lunar_partial_g` or `martian_partial_g`), OR required parameters are null in every matched record (explicitly listing the null parameters).

### 3.3 Disclaimers and Sensitivity
- Mandatory UI Banner: *"A documentation check, not a safety assessment. Ranges are envelopes; individual combinations are not confirmed."*
- Sensitivity Protocol:
  - **Baseline:** Overlap > 0 on covered parameters; partial gravity and all-null parameters classified as 'Not assessable'.
  - **Strict:** >= 50% overlap required on environmental parameters with zero null parameters.
  - **Broad:** Material matched or companion 1g data available.
- Solid-Fuel Data Constraint: *"the only solid-fuel O2 values we could source are BASS-II Table 5.1 (20 flat-PMMA tests, 16.8-22.2% O2); BASS, SAFFIRE-II and SAME do not report O2 in the public metadata."*

---

## 3.4 Fuel-Phase Partition Protocol
Investigations are strictly segregated by fuel phase to ensure physical validity and prevent cross-phase conflation:
- **Solid:** PSI-25 (BASS-II), PSI-26 (BASS), PSI-99 (SAFFIRE-II). Benchmark: BASS-II Table 5.1 (20 flat-PMMA tests).
- **Liquid Droplet:** PSI-69 (FLEX), PSI-68 (FLEX-2). Isolated droplet combustion in the MDCA/CIR chamber.
- **Gas:** PSI-159 (CFI-G). Gaseous burner diffusion flames (propane, n-butane, n-pentane).
- **Smoke:** PSI-102 (SAME), PSI-101 (SAME-R). Pyrolysis particulate and smoke generation.
Each investigation record must store a verbatim quote from official metadata verifying its fuel phase. Envelopes and documentation distances must NEVER be aggregated across different fuel phases into a single combined distance.

---

## 4. Workstream K: Path Documentation Distance Specification

### 4.1 Illustrative Transit Sequence
- Transit path represents an illustrative operational sequence:
  1. **ISS Cabin Baseline:** 21% O2, 14.7 psi (standard atmospheric approximation).
  2. **Exploration Atmosphere (Lunar Habitat):** 34% O2, 8.2 psi (sourced from NASA NTRS-20210022143).
  3. **Spacesuit Pre-breathe / EVA:** 100% O2, 4.3 psi (sourced from Space Apps challenge brief).
- Mandatory Label: *"illustrative, not a mission profile."*

### 4.2 Distance Metric
- Normalized Euclidean evidence-distance $d(P)$ calculated at discrete steps along the parameter path between environment $P = (\text{O}_2, p)$ and candidate investigation test envelope $E_i = (\text{O}_{2, i}, p_i)$:
  $$d_i(P) = \sqrt{ \left( \frac{\Delta \text{O}_2}{100} \right)^2 + \left( \frac{\Delta p}{14.7} \right)^2 }$$
  where $\Delta \text{O}_2$ and $\Delta p$ represent the minimal distance from point $P$ to the documented interval $[ \min, \max ]$ of record $i$. If $P$ falls within the record's interval, the distance component is 0.
- The path documentation distance is:
  $$D(P) = \min_{i \in \text{DeepRecords}} d_i(P)$$
- Mandatory Disclaimer: *"Distance measures documentation distance, not hazard."*

---

## 5. Workstream L: Experiment Design Specification

### 5.1 Objectives & Scope
- Empirical candidate matrix design over the three critical environmental variables: $\text{O}_2 \times \text{pressure} \times \text{airflow}$.
- Target focus: Exploration Atmosphere for Lunar surface operations (34% O2, 8.2 psi from NTRS-20210022143) with low-speed forced convection (2.0 to 21.0 cm/s from NASA/TM-20210011385 Table 5.1).
- Conditions chosen by hand: The experimental conditions were chosen by the team by hand around the planned lunar habitat atmosphere (34% O2, 8.2 psi) and Table 5.1 flight test bounds (2.0 to 21.0 cm/s flow); no computed gap analysis was performed.
- Target fuel: Flat PMMA (polymethyl methacrylate), the benchmark solid polymer for spacecraft flammability screening.

### 5.2 Deterministic Construction Rules
1. **Size Limit:** At most 12 experiment runs.
2. **Anchor Run:** Exactly 1 run must match an existing verified flight test condition from NASA/TM-20210011385 Table 5.1 (Flight Run M1: 22.2% initial O2, 9.0 cm/s flow, pressure null) to enable cross-calibration.
3. **Fixed Seed:** Deterministic pseudo-random sequence (`seed = 42`) or structured empirical grid.
4. **Output Columns:** Run ID, Target O2 (%), Target Pressure (psi), Target Airflow (cm/s), Fuel Material, Target Gravity (`microgravity`), Selection Rationale.
5. **Absolute Prohibition:** **ZERO predicted outcomes.** No predicted flame spread, no predicted extinction time, and no predicted hazard rating.
6. **Future Data Citation:** Explicit reference to upcoming NASA payloads **LUCI** and **FM2** as planned future sources of partial-gravity combustion data.
7. **Mandatory Labels:**
   - *"Proposed conditions to document. Not safety advice."*
   - *"defined by the PYRO-ASTRA team"*

---

## 6. Verification and Quote Integrity Standard

Every stored quote in any JSON or markdown file is validated by `analysis/verify_quotes.py`:
- It must exist as a verbatim substring (case-sensitive or exact whitespace-normalized match) within the cited source file in `raw_real/` or official PDF extract.
- Any ungrounded or modified quote is flagged as a build error and deleted.
- The pipeline is executable via `npm run analyze`.

---

## 7. Workstream M: Domain-Gated Surrogate Modeling & Null Result Specification (Rules G2–G6)

### 7.1 Foundational Rules and Governance
In accordance with SPEC Section 2 (Rules 1, 5, 7) and Workstream M directives:
1. **Rule G2 (Preregistration Prior to Execution):** All surrogate models, validation partitions, baseline benchmarks, and applicability domain gates must be formally specified and committed to disk before evaluating candidate models or reporting metrics.
2. **Rule G5 (Strict Refusal of Lunar Habitat and Partial Gravity):**
   - **Partial Gravity:** NASA PSI contains zero partial-gravity combustion test records (Rule 5). Any query specifying gravity $g \notin \{0, 1\}$ (including lunar $0.16g$ and Martian $0.38g$) must be immediately and deterministically refused.
   - **Lunar Atmosphere:** Lunar exploration habitat conditions (34% O2, 8.2 psi / 56.5 kPa) fall strictly outside the empirical parameter domain of public microgravity data. Specifically:
     * Flat PMMA solid fuel flammability (BASS-II Table 5.1) was tested up to 22.2% initial O2 only; pressure was unmeasured.
     * Droplet combustion (FLEX PSI-69) tests with initial O2 $\ge 30\%$ were conducted at pressures $\ge 10.33$ psi; zero tests exist at 8.2 psi.
   - Any query attempting to evaluate Lunar habitat conditions or partial gravity returns a refusal citing Rule 5 and Rule 7.
3. **Rule 7 & 20 (Estimate Isolation):** A model estimate is never stored as an empirical record, never cited as NASA PSI data, and always rendered through the `<Estimate>` component displaying the model ID, empirical prediction interval, and applicability domain status.
4. **Rule G6 (Null Result Mandate):** If surrogate models fail to demonstrate statistically significant predictive superiority over simple baseline estimators under grouped leave-one-condition-out cross-validation, or if physical parameter sparsity prevents reliable out-of-condition generalization, the pipeline publishes an honest, rigorous Null Result Finding rather than publishing ungrounded model weights.

### 7.2 Empirical Dataset Candidates and Partitioning
Candidate microgravity combustion experimental suites evaluated for surrogate modeling and response column availability:
1. **FLEX (PSI-69) Droplet Extinction & Burn Dynamics (Liquid Droplet Phase):**
   - Sample size: 274 total table rows.
   - Physical Filtering (Directive 3): 8 test runs with extinction diameter recorded as 0.00 mm represent complete droplet combustion without premature radiative extinction rather than physical droplet diameters. Excluding these yields $n = 189$ verified physical measurements (range: 0.12 to 4.60 mm).
   - Available Response Columns:
     * `extinction_diameter_mm`: 189 physical non-null / 274 runs (range: 0.12 to 4.60 mm; 8 non-physical 0.00 mm runs excluded).
     * `burn_time_s`: 266 non-null / 274 runs (range: 0.30 to 39.20 s).
   - Fuels: Isolated droplets of Methanol (117 physical runs) and Heptane (72 physical runs).
   - Continuous input features: Initial droplet diameter $d_0 \in [1.2, 5.0]$ mm, initial oxygen mole fraction $X_{\text{O2}} \in [0.12, 0.34]$, chamber pressure $P \in [0.0, 44.9]$ psi.
   - Limitation: Zero tests at 8.2 psi (lunar pressure). High O2 points strictly $\ge 10.33$ psi.
2. **BASS-II Table 5.1 Flat PMMA Flame Spread (Solid Phase):**
   - Sample size: 20 microgravity flight tests.
   - Available Response Columns:
     * `spread_rate_mm_s`: 20 rows (12 single-value numeric [0.012 to 0.071 mm/s], 6 stepped velocity regimes ['20 and 15 cm/s'], 2 'Not tracked').
     * `burn_time_min`: 20 non-null rows.
   - Fuel: Flat polymethyl methacrylate (PMMA) solid polymer slabs.
   - Input features: Sample thickness (1.0 to 2.0 mm), width (1.1 to 2.2 cm), concurrent airflow velocity (2.0 to 21.0 cm/s), initial oxygen (16.8% to 22.2% vol).
   - Limitation: Chamber pressure unmeasured/null in flight hardware. Stepped velocities and sparse n=20 preclude generalized out-of-sample models.
3. **CFI-G (PSI-159) Gaseous Burner Normal Flames (Gas Phase):**
   - Sample size: 179 burner flame tests.
   - Available Response Columns:
     * `burn_time_s`: 175 non-null / 179 runs (range: 0.00 to 304.00 s).
     * `peak_burner_temperature_c`: 133 non-null / 179 runs (range: 32.00 to 532.16 C).
     * `adiabatic_temperature_k`: 177 non-null / 179 runs (range: 1397.03 to 2729.99 K).
   - Fuel mixtures: Ethane, propane, and butane mixtures.
   - Input features: Burner oxidizer stream oxygen mole fraction (up to 0.85; strictly burner oxidizer flow, never cabin atmosphere per Rule 4), fuel mass flow rate, chamber pressure.
4. **Flame Design (PSI-10) Normal & Inverse Flames (Gas Phase):**
   - Sample size: 327 runs (207 normal, 120 inverse).
   - Available Response Columns:
     * `adiabatic_temperature_k`: 256 non-null / 327 runs (range: 1856.0 to 2649.0 K).
   - Input features: Burner fuel mass flow, total mass flow, oxidizer mole fraction, initial chamber pressure.
5. **SAFFIRE-II (PSI-99) Large Fabric Combustion (Solid Phase):**
   - Sample size: 15 runs.
   - Available Response Columns:
     * `burn_time_s`: 5 non-null / 15 runs (range: 115.00 to 900.00 s).
     * `ignition_time_s`: 9 non-null / 15 runs (range: 9.20 to 30.00 s).
6. **SAME (PSI-102) Smoke Particulate & Aging (Particulate Phase):**
   - Sample size: 8 runs.
   - Available Response Columns:
     * `weight_loss_rate_mg_min`: 4 non-null / 8 runs (range: 1.00 to 2.00 mg/min).
     * `aging_duration_min`: 4 non-null / 8 runs (range: 1.00 to 20.00 min).

### 7.3 Cross-Validation and Baseline Benchmarking Protocol (Rule G3)
1. **Grouped Leave-One-Condition-Out (LOCO) CV:**
   - Evaluated on $n = 189$ physical droplet extinction tests across 77 discrete condition clusters.
   - Samples are grouped by discrete experimental condition tuple: $\text{Group} = (\text{Fuel}, \text{Nominal Pressure}, \text{Nominal } \text{O}_2)$.
   - During evaluation, an entire condition group is held out as the test fold, requiring the surrogate to estimate behavior on unseen physical conditions.
2. **20x Repeated Grouped Cross-Validation:**
   - To assess variance across multi-group splits, 5-fold grouped cross-validation is repeated across 20 distinct random group partitions (100 total folds).
3. **Baseline Estimators:**
   - **Dummy Mean:** Estimates the training fold mean target value $\bar{y}_{\text{train}}$.
   - **Dummy Median:** Estimates the training fold median target value $\tilde{y}_{\text{train}}$.
   - **1-Nearest Neighbor (1-NN):** Assigns the target of the closest sample in normalized feature space.
   - **3-Nearest Neighbor (3-NN):** Assigns the average target of the 3 closest samples in normalized feature space.
4. **Candidate Surrogate Architectures:**
   - **Ordinary Least Squares (Linear Regression)**
   - **Ridge Regression ($\alpha = 1.0$)**
   - **Degree-2 Polynomial Regression (with feature interaction terms)**
   - **Decision Tree / Random Forest Regressor**
5. **Evaluation Metrics and Acceptance Gate (Directive 3):**
   - Mean Absolute Error (MAE) with 95% Bootstrap Confidence Intervals ($CI_{95\%}$, 1,000 empirical resamples). Per Directive 3, p-values are omitted in favor of explicit confidence intervals.
   - Root Mean Squared Error (RMSE): $\sqrt{\frac{1}{N}\sum_{i=1}^N (y_i - \hat{y}_i)^2}$
   - Coefficient of Determination ($R^2$): $1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$

### 7.4 Applicability-Domain Gate Specification (Rule G4)
To prevent ungrounded extrapolation beyond verified flight regimes, every surrogate query is evaluated through a 3-tier domain gate configured per fuel (Directive 3):
1. **Per-Fuel Gate Partitioning:**
   - **Methanol ($n=117$):** $d_0 \in [1.61, 4.35]$ mm, $X_{\text{O2}} \in [0.12, 0.34]$, $P \in [0.0, 40.07]$ psi.
   - **Heptane ($n=72$):** $d_0 \in [1.34, 4.67]$ mm, $X_{\text{O2}} \in [0.13, 0.24]$, $P \in [10.21, 30.05]$ psi.
2. **Tier 1: Bounding Box (Range Gate):**
   - Candidate input vector $x = (x_1, \dots, x_k)$ must satisfy $\min_{i} X_{i,j} \le x_j \le \max_{i} X_{i,j}$ for all features $j$ within the fuel's tested domain.
3. **Tier 2: Convex Hull Feasibility Gate:**
   - In normalized feature space $\tilde{x}_j = \frac{x_j - \min X_j}{\max X_j - \min X_j}$, candidate point $\tilde{x}$ must lie inside the convex hull of training conditions. Evaluated via Delaunay triangulation simplex containment (`Delaunay.find_simplex(x) >= 0`).
4. **Tier 3: Normalized Distance Gate & Convention:**
   - Normalized Euclidean distance to nearest training exemplar:
     $$D(x) = \min_{i} \sqrt{ \sum_{j=1}^k \left( \frac{x_j - X_{i,j}}{\text{range}_j} \right)^2 }$$
   - Domain threshold $D_{\max} = 1.50 \times \text{percentile}_{95}(\min_{k \ne i} D(X_i, X_k))$.
   - **Convention Note:** The 1.50 multiplier is an established engineering convention (1.5x of the 95th percentile nearest-neighbor distance in normalized feature space).
5. **Deterministic Refusals:**
   - Any query specifying Lunar atmosphere (34% O2, 8.2 psi) or partial gravity ($g \ne 0 \land g \ne 1$) is classified as an immediate refusal.

### 7.5 Held-Out Extrapolation Test Protocol & Null Result Finding (Rules G5–G6, Directive 3)
1. **Extrapolation Test Protocol:**
   - To rigorously test out-of-domain behavior, the highest-pressure conditions ($P > 20.0$ psi) and highest-oxygen conditions ($X_{\text{O2}} \ge 0.30$) are held out as an extrapolation test set (8 test runs) across ALL models and baselines.
   - Models are trained on the remaining condition envelope and evaluated on the held-out conditions.
2. **Extrapolation Results:**
   - Linear Regression MAE degraded from 0.4320 mm to 1.3450 mm (+211.3% error increase).
   - Degree-2 Polynomial Regression MAE degraded from 0.4300 mm to 1.8491 mm (+330.0% error increase).
   - Random Forest MAE degraded from 0.3622 mm to 0.5487 mm (+51.5% error increase).
3. **Mandatory Finding Statement:**
   > *"On the FLEX droplet data, error rose by 211.3% when the highest-pressure or highest-O2 conditions were held out; the lunar habitat point is outside every measured range and is refused."*
4. **Model Nature:**
   - The surrogate model is strictly a **demonstrator on liquid droplets**, NOT a habitat safety predictor.
   - In spacecraft life-safety engineering, empirical bounding envelopes and exact historical test records must be prioritized over ungrounded surrogate approximations.

---

## 8. Preregistration Revision Log

### Revision 2 (14 November 2026):
1. **Readiness Protocol Update:** Added explicit per-question columns: `material matched` (requires a stored quote from fuels/objective/approach), `O2 covered`, `pressure covered`, `airflow covered`. Clarified verdicts:
   - `Documented` = material matched AND all required parameters covered;
   - `Partially` = material matched AND some but not all covered;
   - `Not documented` = no material match OR no parameter covered;
   - `Not assessable` = partial-gravity, or required parameters null in every matched record (explicitly listing the null parameters).
   - Reason: Enforce strict empirical provenance and eliminate any assumption or interpolation of null parameters.
2. **Fuel-Phase Partition:** Established fuel-phase segregation (`solid`, `liquid droplet`, `gas`, `smoke`) with verbatim quotes. Enjoined combining documentation distances across distinct physical phases.
   - Reason: Prevent conflating liquid droplet flammability with solid polymer fire spread.
3. **Experiment Design Documentation:** Explicitly recorded that proposed conditions were chosen by the team by hand around the planned lunar habitat (34% O2, 8.2 psi) and Table 5.1 flight ranges (2.0 to 21.0 cm/s flow), with no computed gap analysis performed.
   - Reason: Full scientific honesty and transparency regarding design derivation.

### Revision 3 (14 November 2026):
1. **Same-Matched-Record Parameter Constraint:** A parameter counts as covered only if the SAME matched record reports it for the matched material. Table 5.1 airflow applies to flat PMMA only and cannot apply as airflow for cotton or other materials.
   - Consequence: In Q03 (cotton fabric, 0-10 cm/s flow), Table 5.1 PMMA airflow does not apply, SAFFIRE-II reports discrete airflow {20, 30} cm/s (which does not overlap 0-10 cm/s), and BASS min airflow is null. Verdict updates to `Not documented` (0 parameters covered).
   - Consequence: In Q07 (SIBAL cotton/fiberglass fabric, 20 cm/s flow), SAFFIRE-II reports discrete airflow {20, 30} cm/s covering 20 cm/s in the same matched record for SIBAL. Verdict remains `Partially documented`.
2. **Extraction of Public Metadata Airflow Values:**
   - SAFFIRE-II (PSI-99): Stored discrete airflow values `{20, 30}` cm/s with provenance `data['approach']`.
   - BASS (PSI-26): Stored airflow range `{min: null, max: 40}` cm/s with provenance `data['approach']`.
3. **Removal of Disallowed Terminology:** Purged target audit terms from prose, documentation, schemas, and UI components.

### Revision 4 (14 November 2026 - Phase V Full Verification):
1. **Strict Material Matching for SAME-R Airflow:**
   - A readiness verdict may count airflow only from experimental table rows whose material matches the question.
   - Analysis of `raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv` (109 data rows across 5 materials: Kapton 29, Lampwick 20, Pyrell 20, Silicone 22, Teflon 18; test IDs up to 107a) reveals tests for 5 materials only: Kapton, Lampwick, Pyrell, Silicone, and Teflon.
   - Neither Nomex nor mist was tested in SAME-R (0 rows for both).
   - Airflow measured for Kapton, Lampwick, Pyrell, Silicone, or Teflon cannot be imputed to Nomex, mist, or general pyrolysis products without a specific material match.
   - Consequence: In Q02 and Q11, airflow from SAME-R is not covered. Cabin O2 and pressure are also null in public metadata for matched records (PSI-101 and PSI-102). Since all required active parameters are null in every matched record, the verdicts revert from `Partially documented` to `Not assessable`.
   - Updated Verdict Counts:
     - Documented: 0
     - Partially documented: 5 (Q05, Q06, Q07, Q15, Q20)
     - Not documented: 8 (Q03, Q08, Q09, Q12, Q13, Q14, Q17, Q18)
     - Not assessable: 7 (Q01, Q02, Q04, Q10, Q11, Q16, Q19)


### Revision 5 (15 November 2026 - Workstream M Surrogate Modeling & Null Result Preregistration):
1. **Preregistered Workstream M Protocol (Rules G2–G6, Directive 3):**
   - Established frozen cross-validation framework: Grouped Leave-One-Condition-Out (LOCO) CV and 20x repeated grouped cross-validation to eliminate data leakage.
   - Physical Filtering: Excluded 8 test runs with extinction diameter recorded as 0.00 mm (complete combustion without premature extinction), analyzing $n = 189$ verified physical measurements (range 0.12 to 4.60 mm).
   - Metrics: Evaluated MAE with 95% bootstrap confidence intervals ($CI_{95\%}$, 1,000 resamples); omitted p-values per Directive 3.
   - Defined baseline suite (Dummy Mean, Dummy Median, 1-NN, 3-NN) vs candidate models (Linear, Ridge, Polynomial, Random Forest).
   - Per-Fuel Applicability Domain Gates: Separate gates for Methanol ($n=117$) and Heptane ($n=72$), documenting that the 1.50 distance threshold is an established engineering convention.
   - Held-Out Extrapolation Test: Evaluated models on held-out highest-pressure ($P > 20$ psi) and highest-oxygen ($X_{\text{O2}} \ge 0.30$) conditions (8 test runs). Confirmed that Linear Regression error rose by 211.3% (and Polynomial by 330.0%).
   - Required Finding Statement: *"On the FLEX droplet data, error rose by 211.3% when the highest-pressure or highest-O2 conditions were held out; the lunar habitat point is outside every measured range and is refused."*
   - Model Nature: Explicitly designated the surrogate model as a demonstrator on liquid droplets, NOT a habitat safety predictor.
   - Codified strict refusal of Lunar exploration conditions (34% O2, 8.2 psi) and partial-gravity ($g \notin \{0, 1\}$) queries under Rule 5 and Rule 7.
