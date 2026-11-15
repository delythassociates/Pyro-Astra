# PYRO-ASTRA: Comprehensive Technical Architecture & Engineering Manual

---

## 1. Executive System Summary & Mission Objectives

**PYRO-ASTRA** is a daylight-first, deterministic scientific audit engine and analytical platform built for the **NASA Space Apps Challenge 2026** under the theme **Flame in Freefall**. The platform audits the complete open scientific record of spacecraft combustion investigations hosted within the **NASA Physical Sciences Informatics (PSI)** repository.

### 1.1 Primary Scientific Finding
The system programmatically validates that within the authentic NASA PSI experimental combustion database:
- Exactly **0 cabin-air table rows** combine oxygen concentration $\text{O}_2 \ge 30\%$ with atmospheric pressure $P \le 10.2\text{ psi}$ ($70.3\text{ kPa}$).
- This specific envelope defines the planned **Artemis Lunar Habitat Baseline Atmosphere** ($34\%\text{ O}_2$ at $8.2\text{ psi} / 56.5\text{ kPa}$ per NASA NTRS 20210022143).
- While 24 flight runs in the FLEX droplet investigation tested high cabin oxygen ($\text{O}_2 \ge 30\%$), all 24 were conducted at standard or elevated pressures ($P \ge 10.33\text{ psi} / 71.2\text{ kPa}$).
- Consequently, spacecraft fire safety standards for future lunar habitats currently rely on unanchored theoretical models or ground-based 1g buoyant analogs rather than empirical microgravity flight data.

### 1.2 Technology Stack
- **Framework**: Next.js 16.4.6 (App Router, Turbopack, React 19, TypeScript 5.9).
- **Styling**: Tailwind CSS v4, daylight scientific theme (`slate-50` canvas, high-contrast borders, accessible data visualizations).
- **Icons & Graphics**: Lucide React, native responsive SVG vector schematics.
- **Backend / Engine**: Pure TypeScript deterministic algorithms in `src/lib/`, serverless Next.js Route Handlers (`src/app/api/`), Python 3.13 ETL and validation pipelines in `scripts/` and `analysis/`.
- **AI / LLM Integration**: Serverless hybrid architecture utilizing Groq's API (`qwen/qwen3.8-27b`) with a mandatory deterministic pre/post-execution verifier and 100% offline fallback.
- **Testing & Tooling**: Node.js test runner (`tsx --test`), custom SHA-256 checksum manifest generators, single-command reproducibility suite (`scripts/reproduce.py`).

---

## 2. Non-Negotiable System Guardrails & Scientific Constraints

The application is engineered strictly around the non-negotiable scientific constraints defined in **Section 2 of SPEC.md** and **AGENTS.md**:

```
+---------------------------------------------------------------------------------------+
|                              PYRO-ASTRA NON-NEGOTIABLE GUARDRAILS                    |
+---+-----------------------------------------------------------------------------------+
| 1 | ZERO FABRICATION: Never invent, estimate, round up, or interpolate values.        |
|   | If PSI does not state a parameter, store null and display 'not reported'.          |
+---+-----------------------------------------------------------------------------------+
| 2 | MANDATORY PROVENANCE: Every rendered number carries verifiable provenance.         |
|   | The UI strictly refuses to render any bare number lacking file/row/DOI lineage.   |
+---+-----------------------------------------------------------------------------------+
| 3 | EXACT UNIT FORMULAS: Unit conversions are allowed only with exact formulas         |
|   | (e.g. 1 psi = 6.894757 kPa), explicitly documented in the provenance note.       |
+---+-----------------------------------------------------------------------------------+
| 4 | OXYGEN ISOLATION: Oxygen in burner nozzle streams (e.g. CFI-G up to 85%) is NEVER  |
|   | conflated with breathable cabin air. Separate fields and labels are mandatory.    |
+---+-----------------------------------------------------------------------------------+
| 5 | ZERO PARTIAL-GRAVITY DATA: NASA PSI contains 0 lunar (0.16g) or Martian (0.38g)   |
|   | combustion records. Partial-g predictions are strictly refused. ACME E-FIELD      |
|   | electric fields are labeled strictly as analogs, never partial gravity.           |
+---+-----------------------------------------------------------------------------------+
| 6 | SCOPE ENFORCEMENT: Rockets, thrusters, and propellants are out of scope.           |
|   | The query agent deterministically refuses all rocket/propellant inquiries.        |
+---+-----------------------------------------------------------------------------------+
| 7 | MODEL DOMAIN GATING: Machine learning / surrogate models are strictly gated       |
|   | by 3-tier bounding ellipsoids. Predictions outside measured domains are refused.  |
+---+-----------------------------------------------------------------------------------+
| 8 | ATTRIBUTION: Credit NASA PSI in plain text only. No NASA logos or insignia.        |
+---+-----------------------------------------------------------------------------------+
| 9 | AI TRANSPARENCY: All AI-generated text and model estimates are visibly labeled.    |
+---+-----------------------------------------------------------------------------------+
| 10| VERBATIM QUOTES: Literature citations must match source PDFs with 100% precision. |
+---+-----------------------------------------------------------------------------------+
```

---

## 3. End-to-End Architecture Overview

```
                                      +---------------------------------------------+
                                      |         NASA PSI PUBLIC RECORD              |
                                      |   18 Investigations (CSV, PDF, Metadata)    |
                                      +---------------------------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------------------------------------+
| DATA INGESTION & PACKAGING PIPELINE (Python 3.13)                                                                     |
|                                                                                                                       |
|   scripts/build-data.py             scripts/package-release.py                 analysis/verify_quotes.py               |
|   ├── Extracts 8 Deep Records       ├── Compiles modeling_ready_runs.json/csv  └── Verifies 65/65 literature quotes    |
|   ├── Catalogues 10 Catalog Records ├── Builds field_dictionary.json               against source PDF extractions     |
|   └── Generates data/quality-report └── Computes SHA-256 release/manifest.sha256                                      |
+-----------------------------------------------------------------------------------------------------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------------------------------------+
| BACKEND LOGIC & VERIFICATION ENGINES (TypeScript / src/lib/)                                                          |
|                                                                                                                       |
|   score.ts                          nearest.ts                                 validate.ts                            |
|   └── Multi-criteria scoring engine └── Euclidean distance metric (O2/P)       └── Strict Zod-like schema & provenance|
|                                                                                                                       |
|   agent.ts                          model.ts                                   api/ask/route.ts                       |
|   └── Ask ASTRA query classifier    └── 3-tier domain-gated surrogate models   └── Serverless Groq LLM + Verifier     |
+-----------------------------------------------------------------------------------------------------------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------------------------------------------+
| FRONT-END SCIENTIFIC USER INTERFACE (Next.js 16 + Tailwind CSS / max-w-[1840px])                                      |
|                                                                                                                       |
|   GLOBAL STATE: DashboardContext.tsx (Mode: Beginner vs. Advanced | Drawer State)                                     |
|                                                                                                                       |
|   BEGINNER MODE VIEW (2 Inputs -> 3 Outputs)                                                                          |
|   ├── Control Bar: Presets (Moon, ISS, EVA) + Material Pills (PMMA, Nomex, SIBAL, Droplets, Gas) + Status Banner       |
|   ├── Left Col (7/12): MaterialOutcomeVisualizer.tsx (Scatter / Run-by-Run Bars / Atmosphere Target Map)                   |
|   ├── Right Col (5/12): BeginnerDataTable.tsx (2-Way Bidirectional Hover/Click Sync + Expandable Raw Cell Telemetry)  |
|   └── Bottom Full-Width (12/12): ReferencesCard.tsx (NASA Technical Memoranda, DOIs, Raw Files & Hashes)             |
|                                                                                                                       |
|   ADVANCED MODE VIEW                                                                                                  |
|   ├── AdvancedParameterWorkbench.tsx (Granular Sliders, Direct Numeric Inputs, Rule 5 Gate, Closeness Radius)         |
|   ├── IntuitiveFlowRegimeBar.tsx (3-Zone Spectrum Bar + Dynamic Flipping SVG Flow Vector Schematics)                   |
|   └── Tabbed Container (Custom X-Y | BASS-II Spread Rate | Dual-Source Discrepancies | Surrogate Domain Gate)        |
|                                                                                                                       |
|   IN-APP USER GUIDE & DOCUMENTATION                                                                                   |
|   ├── Persistent Nav Button + UserGuideDrawer.tsx (Slide-over with 5 scientific tabs)                                 |
|   └── Dedicated Route: /guide (Full-page responsive documentation manual)                                             |
+-----------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Data Pipeline & Schema Architecture

### 4.1 Ingestion Sources and Record Hierarchy
The database extracts records across two distinct depths:
1. **Deep Priority Investigations (8 Investigations)**:
   - `PSI-102` (SAME): Spacecraft Atmosphere Monitor & Fire Detection.
   - `PSI-101` (SAME-R): Smoke Aerosol Measurement Experiment - Reflight.
   - `PSI-26` (BASS): Burning and Suppression of Solids - I.
   - `PSI-25` (BASS-II): Burning and Suppression of Solids - II (Table 5.1 merged).
   - `PSI-99` (SAFFIRE-II): Spacecraft Fire Safety - Fabric Materials.
   - `PSI-69` (FLEX): Flame Extinction Experiment - Liquid Droplets.
   - `PSI-159` (CFI-G): Confined Combustion - Burner Stream Study.
   - `PSI-68` (FLEX-2): Flame Extinction Experiment - Bic Component Droplets.
2. **Catalog Priority Investigations (10 Investigations)**:
   - `PSI-98` (SAFFIRE-I), `PSI-100` (SAFFIRE-III), `PSI-39` (CFI), `PSI-20` (ACME-BRE), `PSI-21` (ACME-CLD), `PSI-10` (Flame Design), `PSI-22` (ACME E-FIELD), `PSI-23` (ACME S-Flames), `PSI-107` (SPICE), `PSI-106` (SLICE).

### 4.2 Run-Level Census & Deduplication
- **Total Compiled Runs**: Exactly **1,815 modeling-ready table rows** (1,807 flight runs + 8 candidate sets).
- **BASS-II Table 5.1 Integration**: NASA/TM-20210011385 Table 5.1 tests `M1–M20` were confirmed to be identical flight runs to BASS-II `M1–M20`. The 20 tests were deduplicated and merged onto the authentic rows in `PSI-25_Experimental_table_BASS-II.csv`, preserving spread rates, airflow velocities, sample dimensions, and initial/final oxygen levels.
- **Droplet Census**: Exactly 369 liquid droplet runs across FLEX, FLEX-2, and CFI. PSI-142 (bibliographic literature index) was audited and removed from run-level counts.

### 4.3 Provenance Contract & Value Type Schema (`data/schema.ts`)
No numeric value is rendered in PYRO-ASTRA without an associated `Provenance` record:

```typescript
export type Provenance = {
  source_id: string;            // e.g. 'PSI-25'
  doi: string | null;           // Verified NASA PSI DOI
  file: string | null;          // Source CSV or Technical Report
  row_or_page: string | null;   // Table row index or report page
  entered_by: 'parsed' | 'hand';
  note: string | null;          // Exact conversion formulas or citations
};

export type Val<T> = { 
  value: T; 
  unit: string | null; 
  provenance: Provenance 
} | null;
```

---

## 5. Back-End Core Engines & Algorithmic Foundations

### 5.1 Multi-Criteria Scoring & Ranking Engine (`src/lib/score.ts`)
The ranking engine scores each investigation against exploration criteria (e.g., target oxygen, target pressure, target flow speed, fuel phase, sample geometry):

1. **Environmental Proximity Score ($S_{\text{env}}$)**:
   Evaluates how close the investigation's tested range $[X_{\min}, X_{\max}]$ comes to target parameter $T$:
   $$S = 1.0 - \min\left(1.0, \frac{|T - \text{clamped}|}{\text{span}}\right)$$
2. **Rule 4 Burner-Flow Isolation**:
   Burner flow oxygen (`burner_flow_o2_pct`) is explicitly blocked from counting toward cabin oxygen. An investigation reporting only burner oxygen scores $0.0$ for cabin oxygen.
3. **Completeness Penalty & Missing Fields**:
   Null values receive $0.0$ with a structured diagnostic explanation. Weights dynamically renormalize when optional parameters (like airflow velocity) are omitted.
4. **Deterministic Tie-Breaking**:
   Ties in overall score are broken deterministically: first by data completeness percentage, second alphabetically by Investigation ID.

### 5.2 Nearest-Evidence Vector Distance Metric (`src/lib/nearest.ts`)
To determine how close the historical flight record comes to target spaceflight atmospheres, the distance engine computes a standardized Euclidean metric:

$$D = \sqrt{\left(\frac{\Delta\text{O}_2}{100}\right)^2 + \left(\frac{\Delta P}{14.7}\right)^2}$$

- **Normalization**: Oxygen is normalized by $100\%$ and pressure by $14.7\text{ psi}$ (standard sea-level atmospheric pressure), ensuring dimensionless, scale-invariant vector comparisons.
- **Habitat Region Matching**: If an investigation's bounding box intersects the target region, distance is exactly $0.0$. If no flight run intersects, the engine outputs: `"No PSI test inside this region"`.

### 5.3 Deterministic Validation Engine (`src/lib/validate.ts`)
A robust validation framework executes during build and runtime:
- **`validateInvestigation`**: Checks that required fields (DOI, safety areas, record types, data origins) exist and rejects ungrounded schema keys.
- **`validateProvenance`**: Inspects every `<Val>` object and throws an error if `source_id`, `entered_by`, or `file` is missing on non-null numbers.
- **`validateAgentAnswer`**: Intercepts AI responses to enforce Rule 5 (partial-gravity refusal), Rule 6 (rocket/propellant refusal), and catches hallucinated fuel names, ungrounded units, or unverified investigation IDs.

### 5.4 Domain-Gated Surrogate Modeling Protocol (`src/lib/model.ts`)
Surrogate machine learning models for microgravity droplet extinction diameters are wrapped in a **3-tier applicability domain gate**:
1. **Tier 1: In-Domain**: Parameter vector resides inside the 95th-percentile Mahalanobis ellipsoid of measured training data ($D \le P_{95}$). Point estimate and 95% cross-validation prediction interval are evaluated.
2. **Tier 2: Near-Boundary**: Parameter vector sits between $P_{95}$ and $1.5 \times P_{95}$. Estimate is returned with a prominent warning flag.
3. **Tier 3: Out-of-Domain Refusal**: Parameter vector exceeds $1.5 \times P_{95}$, or attempts to query partial gravity (Rule 5) or the Artemis lunar atmosphere (Rule G5). The model strictly refuses to predict and returns nearest empirical microgravity bounds.

---

## 6. Front-End Architecture & Component Hierarchy

### 6.1 Layout & Canvas System
- **Responsive Width**: The main application canvas is configured with `w-full max-w-[1840px] mx-auto px-4 sm:px-6 xl:px-10`, maximizing screen real estate on modern high-resolution displays while maintaining responsive scaling on tablets and mobile devices.
- **Top-Level Navigation (`src/components/Navigation.tsx`)**:
  - Four organized dropdown menus: *Overview & Gap*, *Explorer & Flow Regimes*, *Evidence Path & Models*, and *Data & Audit*.
  - Persistent provenance indicator (`PSI Provenance: Active`) and quick-access `"📖 User Guide"` button.

### 6.2 Global State Architecture (`src/context/DashboardContext.tsx`)
```typescript
export type DashboardMode = 'beginner' | 'advanced';
export type GuideTab = 'quickstart' | 'flow-regimes' | 'oxygen-isolation' | 'data-pipeline' | 'surrogate-models';

interface DashboardContextType {
  dashboardMode: DashboardMode;
  setDashboardMode: (mode: DashboardMode) => void;
  guideOpen: boolean;
  guideTab: GuideTab;
  openGuide: (tab?: GuideTab) => void;
  closeGuide: () => void;
}
```

### 6.3 Beginner Mode Workflow (`src/components/BeginnerModeView.tsx`)
Enforces a clean **2 Inputs $\to$ 3 Outputs** architecture:

```
[ INPUT 1: Spaceflight Atmosphere Presets ]      [ INPUT 2: Material / Fuel Selector ]
  ├── Lunar Habitat Base (34% O2, 8.2 psi)         ├── PMMA (Slabs / Rods)
  ├── ISS Cabin Norm (21% O2, 14.7 psi)            ├── Nomex, SIBAL (Cotton/Fiberglass)
  └── Spacesuit EVA (100% O2, 4.3 psi)             └── Heptane, Methanol, n-Decane Droplets
                         |
                         v
[ DYNAMIC STATUS BANNER: 1-sentence real-time empirical coverage report ]
                         |
                         v
+---------------------------------------------------------------------------------------+
| 12-COLUMN SIDE-BY-SIDE DESKTOP WORKSPACE                                              |
|                                                                                       |
|   LEFT COLUMN (7/12): MaterialOutcomeVisualizer.tsx                                   |
|   ├── Mode 1: Smart Scatter / Trend (e.g. PMMA Spread Rate vs. Airflow Velocity)      |
|   ├── Mode 2: Run-by-Run Horizontal Physical Bars (Spread Rate, O2 Depletion, D_ext)  |
|   └── Mode 3: Preset Atmosphere Target Map (O2 vs. Pressure with Shaded PMMA Band)   |
|                                                                                       |
|   RIGHT COLUMN (5/12): BeginnerDataTable.tsx                                          |
|   ├── Bidirectional Click/Hover Sync with Visualizer                                  |
|   ├── Multi-column sorting (Spread rate, Airflow, Initial/Final O2, Pressure)         |
|   └── Expandable accordion revealing authentic raw flight cell values                 |
+---------------------------------------------------------------------------------------+
                         |
                         v
[ FULL-WIDTH BOTTOM ROW (12/12): ReferencesCard.tsx ]
  └── Primary Technical Memoranda, Verified DOIs, Source CSVs & SHA-256 Checksums
```

#### Detailed Breakdown of `<MaterialOutcomeVisualizer />` Modes:
1. **Mode 1: Outcome vs. Condition (Smart Scatter)**:
   - For **PMMA / Solids**: Plots measured **Flame Spread Rate (`mm/s`)** vs. **Airflow Velocity (`cm/s`)**. Points are color-coded by oxygen concentration with badges indicating sample thickness. Displays an explicit comparison banner contrasting measured conditions against the Lunar Habitat baseline.
   - For **Droplets**: Plots measured **Extinction Diameter ($D_{\text{ext}}$)** vs. **Initial Droplet Diameter ($D_0$)**.
   - **Dynamic Dropdowns**: Allows switching X, Y, and color to any numeric column present in the dataset. Each dropdown option displays its live non-null row count (e.g. `Flame Spread Rate — 20/20 rows`, `Pressure — 0/20 rows [Not Reported]`).
2. **Mode 2: Run-by-Run Bars (Direct Table Visualization)**:
   - **Track A (Burn / Spread Outcome)**: Scaled horizontal bar showing measured flame spread rate or droplet consumption percentage ($D_0 \to D_{\text{ext}}$).
   - **Track B (Oxygen Depletion)**: Dual-marker bar showing starting $\text{O}_2$, ending $\text{O}_2$, and $\Delta\text{O}_2$ consumed during the burn.
   - **Track C (Flow & Thickness)**: Quick badges for airflow speed and sample dimensions.
   - **Sorting**: Toggle sorting by *Spread / Consumption Rate*, *Airflow Velocity*, *Initial $\text{O}_2$*, or *Run ID*.
3. **Mode 3: Atmosphere Target Map (O₂ vs. Pressure)**:
   - Plots all 640 runs reporting both $\text{O}_2$ and pressure against the Lunar Habitat exploration target box ($34\%\text{ O}_2$ at $8.2\text{ psi}$).
   - **PMMA Shaded Band**: Because BASS-II PMMA has null chamber pressure, the visualizer renders a **shaded horizontal band across $13.6\% – 22.2\%\text{ O}_2$**, visually demonstrating why PMMA data exists below the Lunar Habitat oxygen baseline without dropping the data.

### 6.4 Advanced Mode Workflow (`src/components/AdvancedModeView.tsx`)
Designed for researchers and combustion engineers requiring granular parametric control:
1. **`<AdvancedParameterWorkbench />`**:
   - Granular numeric sliders + direct input boxes for Oxygen ($0\text{--}100\%$), Pressure ($0\text{--}20\text{ psi}$ with exact conversions to $\text{kPa}$ and $\text{bar}$), and Airflow ($0\text{--}40\text{ cm/s}$).
   - **Gravity Selection & Rule 5 Enforcement**: Selecting Moon ($0.16g$) or Mars ($0.38g$) renders an explicit refusal banner citing SPEC Section 2 Rule 5.
   - **Closeness Tolerance Configuration**: Allows switching between *Standardized Euclidean Distance ($D \le r$)* and *Parameter Tolerance Windows ($\pm\Delta\text{O}_2, \pm\Delta P$)*, accompanied by a live top-5 closest empirical runs readout.
2. **`<IntuitiveFlowRegimeBar />`**:
   - Horizontal regime spectrum bar with an animated cursor showing:
     - **Zone 1: Diffusive Regimes** ($< 2\text{ cm/s}$): Spherical microgravity flames, oxygen starvation risk.
     - **Zone 2: Low-Velocity Ventilated / Peak Hazard** ($2\text{--}10\text{ cm/s}$): Maximum flame spread hazard; forced ventilation matches diffusion rate.
     - **Zone 3: Convective Blowoff** ($> 10\text{ cm/s}$): Flame cooling, convective stretching, blowoff extinction.
   - **Side-by-Side SVG Vector Mini-Schematic (180×90px)**: Dynamically flips airflow and flame standoff vectors between *Opposed*, *Concurrent*, and *Quiescent* flow orientations.
3. **Tabbed Comparison Container**:
   - **Tab 1**: Custom X-Y Scatter Explorer with target crosshairs.
   - **Tab 2**: BASS-II Airflow vs. Flame Spread Rate empirical curves.
   - **Tab 3**: Dual-Source Discrepancies (NASA/TM Table 5.1 vs. PSI CSV values).
   - **Tab 4**: Surrogate Model 3-Tier Domain Gate.

### 6.5 In-App User Guide (`src/components/UserGuideDrawer.tsx` & `/guide`)
Implements the *"Remove Prose, Keep Structure"* standard:
- Multi-sentence essays and caveats were eliminated from primary dashboard cards and relocated to a dedicated 5-tab user guide:
  1. **Quick Start & Core Workflow**: Navigating Beginner vs. Advanced modes.
  2. **Microgravity Combustion & Flow Regimes**: Transport physics, diffusion vs. buoyancy, Peclet and Reynolds regimes.
  3. **Oxygen Isolation (Cabin vs. Burner)**: Scientific rationale for separating breathable cabin atmospheres from isolated burner fuel streams.
  4. **Data Census & Provenance Lineage**: Ingestion funnel, Table 5.1 deduplication, and the `<Val>` provenance contract.
  5. **Surrogate Model & Guardrail Rules**: Domain gating, physical extrapolation hazards, and the 10 non-negotiable rules.
- Accessible via the persistent top-right `"📖 User Guide"` button, via the standalone `/guide` route, or via contextual `?` info icons (`<InfoButton />`).

---

## 7. Live vs. Offline Hybrid AI Infrastructure

### 7.1 Serverless Architecture (`src/app/api/ask/route.ts`)
The `Ask ASTRA` endpoint provides grounded question answering across both offline and online operational modes:

```
                    +------------------------------------+
                    |        USER QUERY (/api/ask)       |
                    +------------------------------------+
                                      |
                     [ Check Guardrail Refusals ]
                     ├── Partial gravity? (Rule 5)  --> Deterministic Refusal
                     ├── Rockets/propellants?       --> Deterministic Refusal
                     └── Safety guarantee?          --> Deterministic Refusal
                                      |
                                      v
                      [ Route Classification Mode ]
                                     / \
                                    /   \
                         Offline   /     \  Live Mode Requested
                         Default  /       \ (Toggle Active + Key Present)
                                 v         v
               +--------------------+   +------------------------------------+
               | DETERMINISTIC      |   | GROQ SERVERLESS API CALL           |
               | OFFLINE ENGINE     |   | Model: qwen/qwen3.8-27b             |
               | ├── Exact PSI lookup|  | Rate limit: Paced < 8,000 TPM      |
               | ├── Nearest vector |   | Max response timeout: 12.0s        |
               | └── Ranked bounds  |   +------------------------------------+
               +--------------------+                      |
                         |                     [ Error / 429 Rate Limit? ]
                         |                     ├── YES: Graceful Offline Fallback
                         |                     └── NO:  Raw Tool Draft Output
                         |                                 |
                         |                                 v
                         |              +------------------------------------+
                         |              | DETERMINISTIC VERIFIER ENGINE      |
                         |              | ├── Verifies all numbers & units   |
                         |              | ├── Confirms fuel & investigation  |
                         |              | └── Rewrites/intercepts hallucinations
                         |              +------------------------------------+
                         \                                 /
                          \                               /
                           v                             v
               +-------------------------------------------------------------+
               | GROUNDED RESPONSE PAYLOAD                                   |
               | ├── text: Verified answer text                              |
               | ├── mode: 'OFFLINE (deterministic)' | 'LIVE (Groq)'         |
               | ├── citations: Verified investigation IDs & DOIs            |
               | └── provenance: Exact file, row, and SHA-256 metadata       |
               +-------------------------------------------------------------+
```

### 7.2 Benchmark & Verification Metrics
Evaluated against the standardized **130-probe evaluation suite** (`data/ask-eval.json`):
- **100 Core Probes**: 100/100 passed (8 reached LLM, 2 rewritten by deterministic verifier, 92 answered or refused pre-LLM offline).
- **30 LLM-Path Probes**: 30/30 passed under paced throttling (29 HTTP 200, 1 offline fallback, 1 verifier rewrite, average 390 tokens/call).
- **6 Bait Traps (Probes 125–130)**: Hallucinated numeric baits (e.g., claiming BASS-II chamber pressure was 120.5 psi) were caught and neutralized by the deterministic verifier.
- **Zero Secret Leaks**: Verified zero occurrences of API keys or sensitive credentials in source code, build logs, documentation, or client-side bundles.

---

## 8. Verification, Reproducibility & Security Suite

The project enforces absolute reproducibility through automated tooling:

### 8.1 Single-Command Reproducibility Pipeline (`scripts/reproduce.py`)
Executes all 7 certification stages sequentially:
1. **Step 1: Data Pipeline & Schema Validation** (`scripts/build-data.py`): Ingests 18 investigations, validates schema bounds, and builds flattened datasets.
2. **Step 2: Release Packaging & SHA-256 Sync** (`scripts/package-release.py`): Compiles `modeling_ready_runs.json`, generates `field_dictionary.json`, and updates `release/manifest.sha256`.
3. **Step 3: Literature Verbatim Quote Audit** (`analysis/verify_quotes.py`): Verifies that all 65 literature quotes across functions, surprises, and readiness match source technical memoranda.
4. **Step 4: Core Test Suite** (`tsx --test`): Executes all 55 unit and integration tests covering scoring, nearest evidence, domain gating, and API handlers.
5. **Step 5: Ask ASTRA Benchmark** (`scripts/run-ask-eval.ts`): Runs all 130 probes across offline and live LLM pathways.
6. **Step 6: Next.js Production Build** (`next build`): Validates TypeScript type checking and generates static/dynamic production routes.
7. **Step 7: Route & Download Latency Verification**: Boots an ephemeral production server and asserts HTTP 200 responses with latency $< 2.0\text{s}$ across all 30 endpoints and downloadable files.

### 8.2 Signed Manifests & Release Assets (`release/`)
All release files are tracked with authentic SHA-256 hashes in `release/manifest.sha256`:
- `investigations.csv` & `investigations.json`: Catalog of all 18 investigations.
- `modeling_ready_runs.csv` & `modeling_ready_runs.json`: 1,815 normalized experimental flight rows.
- `table_5_1_bass2.csv`: Dedicated extraction of NASA/TM-20210011385 Table 5.1.
- `extractions.json`: Verbatim quotes and key paths for all deep priority investigations.
- `availability.json`: Matrix of reported vs. missing fields across investigations.
- `field_dictionary.json`: Complete definitions and physical units for all 69 database fields.
- `DATACARD.md`: Formal dataset card adhering to open data standards.
