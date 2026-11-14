# PYRO-ASTRA: Spacecraft Fire Safety Intelligence Dashboard

**NASA Space Apps Challenge 2026**  
**Challenge:** *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Global Submission Deadline:** November 15, 2026 at 11:59 PM Local Time (per participant's registered local event timezone; registration closes November 15, 2026 at 11:59 PM Local Time).  

---

## 1. Problem Statement

Crewed spaceflight is entering an ambitious new era of long-duration exploration, including deep-space transit, permanent lunar outposts, and eventual missions to Mars. In these closed, isolated environments, fire remains one of the most catastrophic hazards imaginable. 

However, spacecraft fire safety research faces two fundamental structural hurdles:

1. **Scattered and Siloed Experimental Archives:**  
   Over four decades of microgravity combustion research aboard the Space Shuttle, the Mir Space Station, and the International Space Station (ISS) are fragmented across disparate databases, technical memoranda, raw data archives, and proprietary file formats in NASA's Physical Sciences Informatics (PSI) system. Researchers and mission planners cannot readily cross-reference test parameters, compare materials, or assess environmental flammability boundaries across disparate flight campaigns.
2. **The Partial-Gravity Data Vacuum:**  
   Flames behave in fundamentally different ways in reduced gravity due to the suppression of buoyancy-driven natural convection. Yet, despite extensive microgravity ($0g$) and normal Earth gravity ($1g$) testing, **public flight archives in NASA PSI contain zero combustion datasets collected in lunar ($0.16g$) or Martian ($0.38g$) gravity**. Furthermore, flammability and flame spread do not scale linearly between $0g$ and $1g$—extinction limits, soot residence times, and radiative heat losses vary non-linearly across materials and atmospheric compositions. Mission architectures that rely on interpolated guesses or ungrounded algorithmic extrapolation risk catastrophic failure.

---

## 2. What PYRO-ASTRA Does

**PYRO-ASTRA** is an interactive, research-grade web atlas and fire-safety intelligence dashboard built to **summarize**, **rank**, and **interpret** NASA Physical Sciences Informatics (PSI) combustion investigations while enforcing transparent, uncompromised gap disclosure.

Rather than obscuring empirical deficiencies behind black-box models or synthetic interpolations, PYRO-ASTRA introduces a foundational design philosophy: **Evidence you can trace, gaps you can see**.

### Core Capabilities:
- **Interactive Atmospheric Coverage Map:** Visualizes environmental envelopes in pressure ($0\text{--}45\text{ psi}$) and oxygen concentration ($10\text{--}100\%\text{ O}_2$), projecting proposed crew exploration atmospheres against actual flight test regimes.
- **Nearest Tested Evidence Engine:** Computes exact normalized distances from planned habitat conditions (e.g., lunar habitat at $34\%\text{ O}_2$, $8.2\text{ psi}$) to the closest empirical flight observations in multi-variable parameter space.
- **Multi-Criteria Ranking Matrix:** Enables safety engineers to rank 18 flight investigations according to material phase, ventilation velocity, hardware constraints, and habitat safety relevance.
- **Live Tool-Using Agent (Ask ASTRA):** A specialized natural-language research copilot equipped with 8 deterministic calculation and retrieval tools. All agent answers are verified by a deterministic TypeScript runtime verifier before rendering; ungrounded assertions or out-of-scope queries (partial-gravity extrapolations, rocket propulsion) trigger strict, informative refusals.
- **Rigorous Missingness & Data Quality Auditing:** A dedicated ledger documenting field-level completeness, unit conversion exactness, and source provenance down to raw CSV line numbers and technical report page citations.

---

## 3. Mapping to Challenge Objectives

The *Flame in Freefall* challenge charges teams with developing an intelligent tool to unlock decades of microgravity combustion data. PYRO-ASTRA maps directly to the challenge's four core objectives:

| Challenge Objective | Official Requirement | PYRO-ASTRA Implementation |
|---|---|---|
| **Objective 1: Summarize Findings** | Process and condense extensive microgravity combustion and fire behavior datasets into clear, digestible summaries. | Synthesizes 18 flight investigations (8 metadata-mined flight campaigns and 10 experimental-table-ingested investigations) into unified parameter envelopes, structured hardware profiles, fuel phase classifications, and raw experimental table rows (including 129 table rows from BASS-II, 274 rows from FLEX, and 109 rows from SAME-R). |
| **Objective 2: Rank Results** | Implement intelligent ranking systems to organize findings based on relevance, risk level, material types, or critical parameters for spacecraft safety. | Implements a real-time multi-attribute ranking engine (`/rank`) that weights investigations across environmental overlap, fuel phase (solid, liquid droplet, gaseous, smoke particulates), flow velocities, and target mission envelopes. |
| **Objective 3: Interpret Data** | Provide clear interpretations of how fire acts differently in microgravity compared to Earth. | Features the interactive *Hero Flame Physics HUD* modeling soot chemistry, spherical flame geometries, and buoyant suppression; integrates paired $0g$ vs $1g$ bounding regimes (e.g., SAFFIRE-II) to bracket physical behaviors without ungrounded interpolation. |
| **Objective 4: Deliver Fire Safety Insights** | Translate complex scientific data into actionable insights and tools that can inform and enhance fire safety for future human space exploration missions. | Identifies critical blind spots in spacecraft environmental standards (e.g., lunar surface habitat $34\%\text{ O}_2$, $8.2\text{ psi}$); delivers verified retrieval through Ask ASTRA (`/ask`); exports reproducible open data matrices (`/data`) under CC0-1.0 and MIT licensing. |

---

## 4. Non-Negotiable Honesty Rules

PYRO-ASTRA enforces six fundamental rules of scientific integrity across every database record, calculation, and UI component:

1. **Nulls Over Guesses:**  
   Never invent, estimate, round up, or interpolate an empirical value. If NASA PSI documentation does not explicitly state a parameter, PYRO-ASTRA stores `null` and displays *"not reported"*.
2. **Provenance on Every Number:**  
   Every single stored measurement carries verifiable metadata linking it to its source: PSI record ID, DOI, source file path, sheet/table name, row index or publication page number, and any exact mathematical conversion formula (e.g., $1\text{ psi} = 6.894757\text{ kPa}$, $1\text{ atm} = 14.6959\text{ psi}$). The UI's `<Val>` component strictly refuses to render any value lacking complete provenance.
3. **No Partial-Gravity Speculation:**  
   NASA PSI contains zero partial-gravity combustion experiments. PYRO-ASTRA refuses to generate or display partial-gravity predictions. It presents microgravity ($0g$) and normal Earth gravity ($1g$) test runs as upper and lower physical bounds. Platform analogs (such as the ACME E-FIELD electric field ionic wind) are labeled explicitly as analogs, never as partial gravity.
4. **Burner Oxygen vs. Cabin Oxygen Separation:**  
   Burner-flow oxygen enrichment (e.g., CFI-G burner co-flow reaching up to $85\%\text{ O}_2$) is strictly isolated from ambient habitat cabin air. Burner and cabin concentrations are segregated in different database fields, different types, and different UI labels to prevent misleading safety assessments.
5. **Rockets and Propellants Out of Scope:**  
   Ask ASTRA refuses rocket propulsion and rocket engine queries to maintain laser focus on pressurized spacecraft, space station, and habitat cabin fire safety.
6. **No NASA Logos or Insignia:**  
   Attribution to NASA and NASA PSI is provided strictly in plain text per NASA non-endorsement policy.

---

## 5. Experimental Data Ingestion & Verified Additions

To establish research-grade empirical validity, PYRO-ASTRA ingested authentic raw experimental tables and flight documentation directly from NASA repositories:

### BASS-II Flight Test Ingestion (129 Rows + 20 Table 5.1 Runs)
Ingested directly from authentic NASA PSI files (`raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv`):
- **129 Individual Test Runs:** Spanning tests B1 through T28 across 5 principal investigators (Bhattacharjee, Olson, T'ien, Ferkul, Link).
- **Material Diversity:** Captures flat PMMA slabs ($100\text{ }\mu\text{m}$ to $2\text{ cm}$), cast PMMA rods ($6.35\text{ mm}$ to $12.7\text{ mm}$), Nomex fabric blends, cotton/fiberglass composites, and black PMMA opacified slabs.
- **Combustion Environment Logging:** Captures calibrated initial and final oxygen concentrations ($16.8\%\text{ to }22.2\%\text{ O}_2$, with test O12 recording $13.6\%\text{ O}_2$), carbon dioxide accumulation ($0.4\%\text{ to }1.5\%\text{ CO}_2$), carbon monoxide generation ($0\text{ to }30\text{ ppm CO}$), flow restrictor settings, and radiometer gains.
- **NASA/TM-20210011385 Table 5.1 Ingestion:** Incorporates the 20 benchmark flat-PMMA tests (M1–M20) from Page 57 of the official BASS-II flight report, providing calibrated airflow velocities ($2.0\text{ to }21.0\text{ cm/s}$).

### Multi-Investigation Experimental Table Ingestion
Verified and mapped authentic raw experimental tables across all metadata-mined and experimental-table-ingested investigations:
- **PSI-69 (FLEX):** 274 individual test rows. Pressure spans $0.5\text{ to }3.0\text{ atm}$ (native mmHg up to $2319.9\text{ mmHg} = 44.86\text{ psi}$); oxygen spans $12\%\text{ to }34\%$ mole fraction. Droplet extinction diameters and $CO_2$/He dilution limits in CIR.
- **PSI-68 (FLEX-2):** 8 test matrix rows in CIR. Captures ambient temperature ($25.0^\circ\text{C}$); candidate parameter sets include $30\%\text{ O}_2$ and $0.5\text{ atm}$ ($7.35\text{ psi}$) as unconfirmed parameter sets.
- **PSI-159 (CFI-G / ACME):** 102 test rows in CIR (179 in run-level compilation). Maximum pressure $3.0399\text{ bar}$ ($44.09\text{ psi}$); maximum adiabatic flame temperature $T_{ad} = 2729.987\text{ K}$. At $\sim 7.35\text{ psi}$ ($0.50665\text{ bar}$), exactly 20 rows have elevated burner stream $O_2$ ($35.85\%\text{--}39.26\%$)—verified from raw cells to be burner oxidizer flow only, NOT cabin air (Rule 4).
- **PSI-101 (SAME-R):** Exactly 109 rows with non-empty 'SAME Test #' across 108 unique test IDs. Duplicate confirmed: Test 57 was executed twice (Row 56 Lampwick, Row 74 Teflon on 29-Jul). An earlier audit count of 108 rows was wrong because it counted unique test IDs. Material breakdown: Kapton (29), Silicone (22), Lampwick (20), Pyrell (20), Teflon (18) = 109 rows total. Maximum inlet velocity: $8.1\text{ cm/s}$. Questions Q02/Q11 depend on pyrolysis products where O2 and pressure are null in SAME-R, remaining strictly "Not assessable".
- **PSI-102 (SAME):** 18 test rows in MSG (8 in run-level compilation). Airflow speed $5.0\text{ cm/s}$, sample weight loss rate $2.0\text{ mg/min}$, and aerosol particulate size distributions. Classified consistently under Smoke Particulate.
- **PSI-99 (SAFFIRE-II):** 9 sample burn sequence cards aboard the Cygnus vehicle (15 run rows). Airflow speed $20.0\text{ cm/s}$ ($30\text{ cm/s}$ in prose), ignition power $80.0\text{ W}$.
- **PSI-26 (BASS):** Microgravity solid fuel ignition and nitrogen extinction boundary runs in MSG (122 rows).
- **PSI-107 (SPICE):** 469 rows in CIR. 8 rows with negative airflow ($-0.28\text{ cm/s} \times 5$, $-5.92\text{ cm/s} \times 3$) flagged suspect and excluded from the physical envelope; valid airflow envelope spans $0.66\text{ to }85.28\text{ cm/s}$ ($n=436$), never starting below 0.
- **PSI-10 (Flame Design):** 327 rows in CIR (207 Normal + 120 Inverse). Exactly 18 Inverse Flame rows at $6.26\text{--}7.57\text{ psi}$ with oxidizer stream $O_2$ $31.97\text{--}85.0\%$ are strictly oxidizer stream flow, NOT cabin air. Cabin $O_2$ is not reported (stored as `null`).
- **PSI-20 (ACME-BRE):** 18 rows in CIR. Chamber pressure is strictly "pressure not reported" (stored as `null`), never a match or miss.
- **PSI-22 (ACME E-FIELD):** 32 rows in CIR. Methane & Ethylene with electric field, strictly tagged as electric-field analog evidence only, never partial gravity.
- **PSI-117:** 2,860 rows across 9 analyzed research CSV files, classified strictly as analyzed data separate from run-level datasets.
- **Fuel Phase Segregation:** Solid (272 rows), Liquid Droplet (369 rows = 274 FLEX + 87 CFI + 8 FLEX-2 candidate sets), Gas (1,055 rows), Smoke Particulate (117 rows), and Dust Particulate (2 rows). Table 5.1 fields are merged directly onto BASS-II rows M1–M20 (129 rows total), and bibliographic index PSI-142 (8 rows) is excluded, yielding exactly 1,815 table rows (1,807 discrete test runs + 8 candidate sets).

---

## 6. Known Data Limitations & Disclosed Gaps

In accordance with Section 2 of `SPEC.md`, PYRO-ASTRA explicitly highlights all known limitations in the public record:

1. **Zero Partial-Gravity Data in Public Repositories:**  
   Neither PSI nor accompanying NTRS reports provide empirical combustion data for lunar ($0.16g$) or Martian ($0.38g$) surface gravity. Future payloads (such as LUCI and FM2) are anticipated to address this regime.
2. **Chamber Pressure Not Reported for BASS-II and ACME-BRE:**  
   Chamber pressure was not logged in the 129-row BASS-II experimental table or in the ACME-BRE metadata. PYRO-ASTRA refuses to assume standard atmospheric pressure ($14.7\text{ psi}$); it records pressure as `null` and explicitly presents it as *"not reported"*.
3. **Airflow Dial Units for Non-Table-5.1 Rows:**  
   In the 129-row BASS-II experimental table, airflow is logged as raw display numbers (fan display $0\text{--}100$, air display $0\text{--}15$) rather than physical velocities ($\text{cm/s}$). Calibrated physical flow speeds ($2.0\text{--}21.0\text{ cm/s}$) are available exclusively for the 20 tests documented in Table 5.1 of NASA/TM-20210011385.
4. **FLEX Near-Miss Disclosed:**  
   In the 274 raw rows of PSI-69 (FLEX), exactly 24 rows have $O_2 \ge 30\%$ ($0.30\text{--}0.34$ mole fraction). However, every single one of these rows was tested at a chamber pressure $\ge 534.3\text{ mmHg}$ ($\ge 10.33\text{ psi}$, spanning $10.33\text{ to }14.91\text{ psi}$). Zero rows reach the planned lunar habitat pressure of $8.2\text{ psi}$.
5. **Solid Fuel Oxygen Limitations:**  
   Across all public solid-fuel microgravity investigations in PSI, only BASS-II Table 5.1 reports an explicit ambient oxygen concentration range ($16.8\%\text{--}22.2\%\text{ O}_2$). SAFFIRE-II and BASS public metadata do not report chamber oxygen percentages.
6. **Lunar Environmental Sweep Verification (19 Tables):**  
   An exhaustive automated scan across all 19 experimental tables confirms the core finding: **676 rows report both $O_2$ and pressure (369 cabin rows); none are $\ge 30\%$ $O_2$ and $\le 10.2\text{ psi}$ in cabin air**.
   - **CFI-G (PSI-159):** Records 20 rows at $7.35\text{ psi}$ ($0.50665\text{ bar}$) with burner flow $O_2$ $35.85\%\text{--}39.26\%$, strictly burner oxidizer flow only, not cabin air (Rule 4).
   - **Flame Design (PSI-10):** Records 18 Inverse Flame rows at $6.26\text{--}7.57\text{ psi}$ with oxidizer stream $O_2$ $31.97\%\text{--}85.0\%$, strictly oxidizer stream only, not cabin air. Cabin $O_2$ is not reported for either.
   - **Cabin Air Rows (369 rows):** Every FLEX row with $O_2 \ge 30\%$ is at $P \ge 10.33\text{ psi}$. FLEX-2 candidate sets reach $30\%\text{ O}_2$ and $0.5\text{ atm}$ ($7.35\text{ psi}$), unconfirmed combination. Zero flight rows exist in the target lunar atmosphere.

---

## 7. Data Sources & PSI Record Inventory

PYRO-ASTRA mines 18 distinct NASA investigations: 8 primary metadata-mined investigations with full condition extraction, plus 10 experimental-table-ingested investigations.

### 8 Metadata-Mined Investigations

| PSI ID | Acronym | Full Investigation Title | Hardware Facility | Primary Fuel Phase | Official DOI |
|---|---|---|---|---|---|
| **PSI-25** | **BASS-II** | Burning and Suppression of Solids - II | Microgravity Science Glovebox (MSG) | Solid (PMMA, Nomex, Cotton) | [10.60555/4qc4-de67](https://doi.org/10.60555/4qc4-de67)<br>*(NASA/TM-20210011385)* |
| **PSI-26** | **BASS** | Burning and Suppression of Solids | Microgravity Science Glovebox (MSG) | Solid (PMMA slabs, rods) | [10.60555/58h4-dy80](https://doi.org/10.60555/58h4-dy80) |
| **PSI-68** | **FLEX-2** | Flame Extinction Experiment - 2 | Combustion Integrated Rack (CIR) | Liquid Droplet (Heptane, Decane) | [10.60555/byp8-h018](https://doi.org/10.60555/byp8-h018) |
| **PSI-69** | **FLEX** | Flame Extinction Experiment | Combustion Integrated Rack (CIR) | Liquid Droplet (Alkanes, Alcohols) | [10.60555/mbq8-0451](https://doi.org/10.60555/mbq8-0451) |
| **PSI-99** | **SAFFIRE-II** | Spacecraft Fire Safety Experiment - II | Cygnus Resupply Vehicle | Solid (Fabric, PMMA, Nomex) | [10.60555/2chp-m469](https://doi.org/10.60555/2chp-m469) |
| **PSI-101** | **SAME-R** | Smoke Aerosol Measurement Experiment - Reflight | Microgravity Science Glovebox (MSG) | Smoke Particulate (Overheated wire, PTFE) | [10.60555/2np7-jv14](https://doi.org/10.60555/2np7-jv14) |
| **PSI-102** | **SAME** | Smoke Aerosol Measurement Experiment | Microgravity Science Glovebox (MSG) | Smoke Particulate (Pyolyzed materials) | [10.60555/gd4k-8h62](https://doi.org/10.60555/gd4k-8h62) |
| **PSI-159** | **CFI-G** | Cool Flames Investigation with Gases | Combustion Integrated Rack (CIR) | Gaseous (Butane, Ethane, Propane; n-pentane in metadata) | [10.60555/cyt1-kh64](https://doi.org/10.60555/cyt1-kh64) |

### 10 Experimental-Table-Ingested Investigations
- **PSI-10:** Flame Design (Soot-free spherical flame extinction in CIR; 327 rows) · DOI: `10.60555/w4zy-bt45`
- **PSI-20:** ACME-BRE (Burning Rate Emulator in CIR; 18 rows; pressure not reported) · DOI: `10.60555/psi-20-bre`
- **PSI-21:** ACME-CLD (Cool Flames Droplets) · DOI: `10.60555/23e1-9950`
- **PSI-22:** ACME E-FIELD (Electric Field Effects on Flammability - partial-g analog; 32 rows) · DOI: `10.60555/psi-22-efield`
- **PSI-23:** ACME S-Flames (Structure and Response of Spherical Diffusion Flames; 18 rows) · DOI: `10.60555/psi-23-sflames`
- **PSI-39:** CFI (Confined Combustion - Droplets; 87 rows) · DOI: `10.60555/psi-39-cfi`
- **PSI-98:** SAFFIRE-I (Large-scale spacecraft fabric flame spread; 4 rows) · DOI: `10.60555/0t15-1z43`
- **PSI-100:** SAFFIRE-III (High-speed airflow burn sequence; 2 rows) · DOI: `10.60555/040q-4h36`
- **PSI-106:** SLICE (Structure and Liftoff In Combustion Experiment; 12 rows) · DOI: `10.60555/psi-106-slice`
- **PSI-107:** SPICE (Smoke Point In Co-flow Experiment; 469 rows) · DOI: `10.60555/psi-107-spice`
*(Note: Additional ingested experimental tables include PSI-47 DAFT [2 rows, particulate] and PSI-142 [8 rows], along with PSI-117 analyzed research datasets [2,860 rows]).*

### Authoritative Technical Standards & Reports
- **NASA/TM-20210011385:** *BASS-II Flight Experiment Final Report*, Bhattacharjee et al., NASA Glenn Research Center.
- **NASA/TP-2015-218570:** *Baseline Values and Assumptions Document (BVAD)*, NASA Life Support Project.
- **NASA/TM-20210022143:** *NASA Spacecraft Fire Safety Research Operations Plan*, Urban et al.

---

## 8. Technology Stack & Endpoint Architecture

- **Framework:** Next.js 16 (React 19 App Router) with Serverless API Routes.
- **Language & Types:** TypeScript with strict type definitions (`data/schema.ts`) and zero `any` allocations in the data layer.
- **Styling & Layout:** Tailwind CSS 4 with dark/light theme tokens and adaptive mobile-responsive layouts.
- **Visualizations:** D3.js for SVG environmental scatter plots, atmospheric coverage envelopes, and nearest-evidence vectors; custom canvas/SVG for the Hero Flame HUD.
- **Agent Intelligence:** Ask ASTRA tool-execution engine (`src/lib/agent.ts`) with deterministic validation pipeline (`src/lib/validate.ts`).
- **Data Audit & Analysis:** Python 3.10+ analytical scripts for quote verification, SHA-256 integrity audits, and CSV extraction.

### Complete Inventory of 16 Application Endpoints (15 Page Routes + 1 API Route)

| Endpoint | Type | Description |
|---|---|---|
| `/` | Page | Mission Overview, Hero Flame Physics HUD, Gap Card, Moon-Base Criteria Audit Table |
| `/ask` | Page | Ask ASTRA Live Verified Research Copilot with Tool Execution Trace & Policy Inspection |
| `/compare` | Page | Multi-Investigation Side-by-Side Parameter Matrix & Sensor Comparison |
| `/coverage` | Page | Atmospheric Coverage Map ($0\text{--}45\text{ psi}$ vs $10\text{--}100\%\text{ O}_2$) & Nearest Tested Evidence |
| `/data` | Page | Open Data Download Center (`investigations.csv`, `table_5_1_bass2.csv`, `availability.json`) |
| `/data-quality` | Page | Missingness Heatmap, Dial Units Log, Field Completeness Ledger & Conversion Formulas |
| `/functions` | Page | Deep-Dive Breakdown of NASA Investigation Functions & Scientific Objectives |
| `/models` | Page | Liquid Droplet Surrogate Demonstrator, Per-Fuel Domain Gates & Preregistered Null Result Benchmark |
| `/path` | Page | Earth-to-Mars Transit Fire Risk & Habitat Atmospheric Transition Sequence |
| `/proposals` | Page | Future Payload Proposals & Flight Recommendations (LUCI, FM2, Sounding Rockets) |
| `/rank` | Page | Real-Time Multi-Attribute Relevance & Environmental Ranking Engine with Live Sliders |
| `/readiness` | Page | NASA Spacecraft Material Flammability Readiness & Test Ledger |
| `/surprises` | Page | Empirical Counter-Intuitions & Microgravity Combustion Surprises |
| `/trust` | Page | Scientific Provenance Ledger, Test Suite Results & Policy Probe Verification Suite |
| `/_not-found` | Page | Graceful 404 Fallback & Guided Return Navigation |
| `/api/ask` | API | Deterministic Verification Serverless API Route with Policy Interception |

### Automated Verification Ledger
- **55 Unit & Integration Tests across 8 Suites:** Executed via Node.js native test runner (`node:test via tsx`) — **100% PASS** (0 failures).
- **130 Dual-Mode Adversarial Policy Probes:** Executed via `scripts/run-ask-eval.ts` across both OFFLINE (deterministic) and LIVE modes: 38 real Groq API calls made (35 compliant, 3 rewritten by the verifier), 92 answered/refused pre-LLM offline (100% passes across both modes). On the free tier, most queries run OFFLINE via the deterministic engine; live AI is strictly opt-in.
- **65 Verbatim Literature Quotes:** Verified via `analysis/verify_quotes.py` — **100% PASS** (100% verbatim substring match).
- **12 Screen-to-Raw Numbers:** Traced directly to source file, line number, column, and raw cell.
- **Run-Level Modeling Dataset (Phase 2):** Compiles 1,815 table rows (`release/modeling_ready_runs.csv` and `.json`, representing 1,807 discrete test runs + 8 candidate sets) with 44 standardized columns and 100% row-level SHA-256 provenance.
- **LIVE Mode Operational Evidence & Transparency:** Fully documented in [docs/LIVE_MODE.md](file:///docs/LIVE_MODE.md) and [AI-USE.md](file:///AI-USE.md) featuring Groq LPU inference (`qwen/qwen3.8-27b`). Tested live with server-side env-key isolation (`GROQ_API_KEY` in `.env.local`, zero keys in client bundles or git), 12s timeout guards, circuit breaker cooldown, 2,500ms request pacing, and 100% programmatic verifier interception (`validate.ts`). Authentic execution traces are logged in `data/live-audit-log.json` and viewable on `/trust`.
- **Published Scientific Null Result Finding:** Under preregistered grouped LOCO CV, 20x repeated grouped CV, and held-out extrapolation testing on physical droplet extinction measurements ($n = 189$, excluding 8 complete combustion zero rows), *"On the FLEX droplet data, error rose by 211.3% when the highest-pressure or highest-O2 conditions were held out; the lunar habitat point is outside every measured range and is refused."* Linear Regression MAE degraded by 211.3% (0.4320 mm to 1.3450 mm), Polynomial Regression MAE degraded by 330.0% (0.4300 mm to 1.8491 mm), and Random Forest MAE degraded by 51.5% (0.3622 mm to 0.5487 mm). Evaluated against 4 baselines (Dummy Mean, Dummy Median, 1-NN, 3-NN) using 95% bootstrap confidence intervals (p-values omitted). The surrogate is classified strictly as a **demonstrator on liquid droplets, NOT a habitat safety predictor** (PREREGISTERED.md Rev 5).
- **Single-Command Reproducibility Pipeline:** `npm run reproduce` (or `python scripts/reproduce.py`) executes end-to-end verification, data extraction, release packaging, Next.js build, and route/download SLA checks in < 55s with 100% PASS across all 29 endpoints.

---

## 9. Alignment with NASA Space Apps Judging Criteria

The official NASA Space Apps Challenge judging rubric evaluates projects across five foundational criteria:

### 1. Impact
> *"Measures the solution's ability to address a real-world problem and generate meaningful benefits or value for the community, society, or humanity."*

**How PYRO-ASTRA Delivers:**  
Fire represents an existential threat to long-duration human space missions. By organizing disparate combustion experiments into structured atmospheric envelopes and directly contrasting them with planned exploration habitats, PYRO-ASTRA provides mission designers, ECLSS engineers, and researchers with immediate clarity regarding which environmental conditions have been tested and where dangerous documentation gaps exist.

### 2. Creativity
> *"Focuses on the originality of the idea, resourcefulness, and the innovative nature of the team's approach to the challenge."*

**How PYRO-ASTRA Delivers:**  
Where typical hackathon entries attempt to mask data scarcity by generating unverified interpolations or black-box predictions, PYRO-ASTRA takes the creative counter-approach: **radical empirical honesty**. It showcases the partial-gravity gap as a primary discovery feature, couples an interactive SVG flame physics simulator to educational flight parameters, and builds a verified SI copilot with hard programmatic guardrails.

### 3. Validity
> *"Assesses the scientific foundation, technical feasibility, accuracy, and practical applicability of the solution (including the proper handling and interpretation of data)."*

**How PYRO-ASTRA Delivers:**  
Scientific validity is enforced down to the code layer. Stored values carry traceable source provenance (DOI, raw filename, row/page number, exact conversion formula), and the UI component refuses to render numbers without complete provenance. Out-of-scope topics (rocket engines, propellant chemistry) and scientifically ungrounded extrapolations (partial-gravity flammability) are deterministically rejected. Automated test suites verify quote extraction and system integrity against authentic NASA technical memoranda.

### 4. Relevance
> *"Evaluates how well the project directly answers the requirements of the selected challenge statement and incorporates open data from NASA or its partner space agencies."*

**How PYRO-ASTRA Delivers:**  
PYRO-ASTRA directly addresses all four core objectives of the *Flame in Freefall* challenge: summarizing 18 investigations, ranking them through an interactive multi-factor engine, interpreting microgravity combustion dynamics through physical bounding, and delivering actionable fire-safety insights. It mines authentic open datasets from NASA PSI, NTRS, and the Registry of Open Data on AWS.

### 5. Presentation
> *"Examines how clearly and effectively the team communicates their project's story, purpose, and functionality through their project page, demo slides, or video."*

**How PYRO-ASTRA Delivers:**  
Designed with an intuitive mission-control visual hierarchy, responsive layout, and high-contrast accessibility. The user journey is streamlined to communicate core insights in 60 seconds across three clicks (Home Gap Card $\rightarrow$ Coverage Map $\rightarrow$ Verified Ask ASTRA Query), accompanied by comprehensive documentation and transparent data quality reports.

---

## 10. Reproducibility & Deployment Instructions

### Local Development & Verification Commands

1. **Clone repository & install dependencies:**
   ```bash
   git clone <repo-url>
   cd nasa_space_apps_challenge_2026
   npm install
   ```

2. **Run complete unit test suite (55 tests across 8 suites):**
   ```bash
   npm test
   ```

3. **Run Ask ASTRA 130-probe evaluation suite:**
   ```bash
   npx tsx scripts/run-ask-eval.ts
   ```

4. **Verify all 65 literature quotes against authentic NASA reports:**
   ```bash
   python analysis/verify_quotes.py
   ```

5. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

### Production Build & Deployment Commands

1. **Compile optimized production build:**
   ```bash
   npm run build
   ```

2. **Start production server locally:**
   ```bash
   npm start
   ```

3. **Deploy to Vercel (Production):**
   ```bash
   # Install Vercel CLI (if not already installed)
   npm install -g vercel

   # Deploy directly to production
   vercel --prod
   ```

4. **Deploy via Docker Container:**
   ```bash
   # Build Docker image
   docker build -t pyro-astra .

   # Run container on port 3000
   docker run -p 3000:3000 -e PORT=3000 pyro-astra
   ```

### Optional Environment Configuration
- `GROQ_API_KEY`: *(Optional)* Enables live LLM tool-calling in Ask ASTRA via Groq (`qwen/qwen3.8-27b`). If omitted, Ask ASTRA runs deterministically in offline mode via local database indexing with 100% policy enforcement. Note: default Ask mode is OFFLINE; live AI is strictly opt-in.
- `PORT`: *(Optional, default 3000)* Listening port for standalone Node.js and Docker deployments.
