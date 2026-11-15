# PYRO-ASTRA

**Spacecraft Fire Safety Intelligence Dashboard & Empirical Microgravity Atlas**  
*NASA Space Apps Challenge 2026 · Challenge: "Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data"*  
**Global Submission Deadline:** November 15, 2026 at 11:59 PM Local Time  


[![GitHub Deployment](https://img.shields.io/badge/Vercel-GitHub%20Mirror-0070f3?style=for-the-badge&logo=vercel)](https://pyro-astra-k9hn.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Unit%20Tests-55%2F55%20Passing-success?style=for-the-badge&logo=vitest)](https://github.com/delythassociates/Pyro-Astra)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.6%20Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![License: CC0-1.0](https://img.shields.io/badge/Data%20License-CC0--1.0-blue?style=for-the-badge)](file:///release/LICENSE.txt)
[![License: MIT](https://img.shields.io/badge/Code%20License-MIT-purple?style=for-the-badge)](file:///release/LICENSE.txt)

---

## Live Deployments & Exploration Links

- **Official Live Production URL:** http://delythassociates.study/
- **Secondary GitHub Production URL:** [https://pyro-astra-k9hn.vercel.app](https://pyro-astra-k9hn.vercel.app)
- **GitHub Source Repository:** [https://github.com/delythassociates/Pyro-Astra](https://github.com/delythassociates/Pyro-Astra)

---

## Executive Summary

**PYRO-ASTRA** is an interactive, research-grade web atlas and fire-safety intelligence dashboard built to **summarize**, **rank**, and **interpret** four decades of microgravity combustion experiments from NASA's Physical Sciences Informatics (PSI) repository.

Designed for life-support systems (ECLSS) engineers, mission planners, and spacecraft safety researchers, PYRO-ASTRA replaces fragmented reports and black-box estimates with a transparent, uncompromising core principle: **Evidence you can trace, gaps you can see**.

### The Core Finding: The Exploration Atmosphere Blindspot
Future NASA exploration architectures (including Artemis lunar surface habitats and Mars transit vehicles) plan to operate at reduced cabin pressure and elevated oxygen concentrations—specifically **$34\%\text{ O}_2$ at $56.5\text{ kPa}$ ($8.2\text{ psi}$)**, as specified in NASA/TP-2015-218570 (BVAD). 


The closest ambient flight record is FLEX Test 24 at $30.0\%\text{ O}_2$ and $71.2\text{ kPa}$ ($10.33\text{ psi}$). Rather than hiding this deficiency behind synthetic interpolations or ungrounded machine-learning predictions, PYRO-ASTRA exposes this boundary as a **first-class engineering constraint**.

---

## Key Capabilities & Technical Highlights

### 1. Interactive 80/20 Zoomable Multi-Variable Chart Workspace (`/explorer`)
- **Dual Guided Workflows:** Toggle between **Beginner Mode** (habitat preset driven with synced material outcome tables) and **Advanced Parametric Mode** (full interactive axes control).
- **Dynamic Data-Domain Wheel Zoom:** Native non-passive wheel listener attached strictly to the inner 80% plot box. Scrolling dynamically recalculates numeric `xDomain` and `yDomain` bounds and triggers `generateNiceTicks()` to update axis scales in real time without zooming the browser page.
- **Multi-Shape & Multi-Color Encoding:** Data points render distinct geometric shapes (circles, squares, diamonds, triangles, stars) and high-contrast semantic colors based on material type and experimental outcome (quenched, steady spread, radiation-limited extinction).
- **Lineage Popover (`<Val>`):** Refuses to render any number in the UI without document-level provenance (DOI, source file, table row index, and exact mathematical conversion formula).

### 2. 3D Volumetric Flame & NASA PSI CFD Simulator (`/physics`)
- **Burke-Schumann Continuous GLSL Reaction Sheet:** Real-time WebGL vertex and fragment shaders render flame curvature, blue $CH^*$ chemiluminescence reaction zones, and incandescent soot shells under varying gravity regimes ($0g$, $1g$).
- **Authentic NASA CFD Ingestion:** Direct integration with NASA Glenn 777,600-node `.dat` CFD grid fields (`8cm_sGrid_grid3d.dat`, `8cmNoGravityU.dat`, `8cmNoGravityNumDenR.dat`, `10cmGravitySmoke.dat`), modeling thermophoretic soot drift and buoyant convection up to $88.5\text{ cm/s}$.
- **Rule 5 Partial-Gravity Refusal Cage:** Selecting Lunar ($0.16g$) or Martian ($0.38g$) gravity renders a red physical refusal cage and diagnostic banner explaining why partial-gravity behavior cannot be extrapolated from microgravity.

### 3. Grounded Natural-Language Research Agent ("Ask ASTRA" at `/ask`)
- **Deterministic Verifier Interception:** 100% of LLM agent responses pass through an offline TypeScript verification layer (`src/lib/validate.ts`).
- **Code Has Final Veto:** If the model hallucinates an ungrounded fuel, bogus pressure unit, or unauthorized investigation ID, the verifier intercepts and replaces the response with verified flight bounds.
- **Enforced Policy Refusal:** Automatically rejects queries asking for partial-gravity flame spread predictions (Rule 5) or rocket propellant formulations (Rule 6).

### 4. Spacecraft Material Flammability & Readiness Ledger (`/readiness`)
- Audits flight materials (PMMA, Nomex, Kapton, Silicone, Lampwick, Pyrell, Teflon, Heptane, Methanol) across limiting oxygen concentration (LOC) thresholds.
- Contrasts standard 1g NASA-STD-6001B Test 1 upward flammability ratings with authentic low-velocity microgravity extinction behavior.

### 5. Multi-Criteria Ranking & Nearest Evidence Engine (`/rank`, `/coverage`)
- **Multi-Attribute Relevance Score:** Computes normalized $L_1$ parameter distance across environmental overlap, fuel phase, flow velocity, and target habitat envelope.
- **Convex Hull Domain Gating:** Implements a strict 3-tier boundary gate (range box, per-fuel convex hull, and standardized neighbor distance $D_{\max} \le 1.5 \times P_{95}$) to prevent dangerous out-of-distribution extrapolations.

---

## Non-Negotiable Honesty Rules

To guarantee absolute scientific validity and safety reliability, PYRO-ASTRA operates under strict architectural constraints:

| Rule | Description |
| :--- | :--- |
| **1. No Data Fabrication** | If NASA PSI does not report a value, it is stored as `null` and displayed as *"not reported"*. Never interpolated or guessed. |
| **2. Mandatory Provenance** | Every single number rendered in the UI carries SHA-256 or document-level provenance. |
| **3. Exact Unit Conversions** | Conversions use exact formulas only (e.g., $1\text{ psi} = 6.894757\text{ kPa}$), with provenance notes stating the conversion. |
| **4. Oxygen Stream Separation** | High-oxygen burner co-flow (e.g., CFI-G reaching up to $85\%\text{ O}_2$) is strictly separated from habitat cabin air. |
| **5. No Partial-Gravity Predictions** | NASA PSI contains 0 partial-gravity combustion records. Only $0g$ and $1g$ bounds are shown. ACME E-FIELD Flames is presented strictly as an electric field analog. |
| **6. No Rocket Propellants** | Rocket engines, propellants, and ballistic pyrotechnics are out of scope. Ask ASTRA strictly refuses them. |
| **7. Plain-Text NASA Attribution** | NASA and NASA PSI are credited strictly in plain text; no NASA insignia or logos are used per agency policy. |
| **8. Zero-Emoji Scientific UI** | All UI files adhere to a strict zero-emoji policy, utilizing clean typography, sharp architectural lines, and geometric SVG strokes. |

---

## Application Route Directory

PYRO-ASTRA provides 16 production endpoints:

| Endpoint | Route Name | Scientific Purpose |
| :--- | :--- | :--- |
| `/` | **Ask ASTRA / Home** | Central AI-first research portal with quick prompts, recent flight audits, and gap disclosures. |
| `/explorer` | **Interactive Chart Workspace** | 80/20 zoomable canvas with synchronized material outcome tables and dynamic axis scaling. |
| `/physics` | **3D Combustion & CFD Lab** | Continuous GLSL volumetric reaction sheet simulator with NASA CFD streamlines. |
| `/ask` | **Ask ASTRA Agent** | Natural-language query interface with live tool invocation and runtime verifier inspection. |
| `/coverage` | **Atmospheric Coverage Map** | Pressure vs. $O_2$ coordinate space showing tested domains against Exploration Habitat targets. |
| `/readiness` | **Material Readiness Ledger** | Audit of spacecraft polymers, solids, and droplets against NASA-STD-6001B standards. |
| `/rank` | **Relevance Ranking Engine** | Multi-attribute scoring engine weighting flight investigations for specific missions. |
| `/compare` | **Side-by-Side Parameter Matrix** | Schema-level comparison of deep investigations and DOI provenance links. |
| `/data-quality` | **Missingness & Provenance Audit** | Field-level completeness matrix, exact unit conversions, and row-level reconciliation. |
| `/data` | **Open Data Download Center** | Public data repository containing flat CSV matrices, JSON manifests, and SHA-256 checksums. |
| `/functions` | **Hardware & Science Objectives** | Mapping of 18 investigations across CIR, MSG, ACME, MDCA, and Cygnus facilities. |
| `/path` | **Earth-to-Mars Transit Risk** | Transition modeling of fire risks during launch, microgravity transit, and planetary stay. |
| `/proposals` | **Reduced-Gravity Test Proposals** | Candidate test matrix designs proposed to close the Lunar Exploration Atmosphere gap. |
| `/surprises` | **Counter-Intuitions & Anomalies** | Documented microgravity phenomena: cool flames, radiative self-extinction, and soot drift. |
| `/trust` | **Scientific Trust & Verification** | Complete provenance ledger, SHA-256 verification manifest, and methodology disclosures. |
| `/api/ask` | **Serverless Ask ASTRA API** | Serverless route providing deterministic tool-calling with verified fallback. |

---

## Authentic NASA Datasets Ingested

All data within PYRO-ASTRA is grounded in authentic NASA technical documentation and flight records:

- **NASA/TM-20210011385 (BASS-II Flight Report):** Table 5.1 extracted row-by-row (20 tests, M1–M20) from Page 57, documenting airflow velocities ($2.0\text{--}21.0\text{ cm/s}$), sample dimensions, and initial/final oxygen concentrations ($16.8\%\text{--}22.2\%\text{ vol}$).
- **NASA PSI GEODE API Metadata:** Ingested for all 18 flight investigations (8 deep + 10 catalog).
- **NASA/TP-2015-218570 (BVAD):** Baseline values and assumptions for exploration habitat life-support systems ($34\%\text{ O}_2$, $8.2\text{ psi}$).
- **Run-Level Ingested Flight Tables (1,815 Discrete Runs):**
  - **BASS-II (PSI-25):** 129 table rows spanning tests B1 through T28 across 5 principal investigators.
  - **FLEX (PSI-69):** 274 rows in CIR ($0.5\text{--}3.0\text{ atm}$, $12\%\text{--}34\%\text{ O}_2$).
  - **FLEX-2 (PSI-68):** 8 rows in CIR ($25.0^\circ\text{C}$).
  - **CFI-G (PSI-159):** 102 rows in CIR (179 in run compilation); burner flow strictly separated from cabin air.
  - **SAME-R (PSI-101):** 109 rows across Kapton, Silicone, Lampwick, Pyrell, and Teflon.
  - **SAME (PSI-102):** 18 rows in MSG (smoke particulate and pyrolysis weight loss).
  - **SAFFIRE-II (PSI-99):** 9 sample burn sequence cards aboard Cygnus (15 run rows).
  - **SPICE (PSI-107):** 469 rows in CIR; valid airflow envelope $0.66\text{ to }85.28\text{ cm/s}$.
  - **Flame Design (PSI-10):** 327 rows in CIR (207 normal + 120 inverse flame).
  - **ACME-BRE (PSI-20):** 18 rows in CIR.
  - **ACME E-FIELD (PSI-22):** 32 rows in CIR (electric field analog).

---

## Getting Started Locally

### Prerequisites
- Node.js 20+
- Python 3.10+ (for data ingestion and audit verification scripts)

### Installation
```bash
# Clone repository
git clone https://github.com/delythassociates/Pyro-Astra.git
cd Pyro-Astra

# Install dependencies
npm install
```

### Verification & Test Suite
```bash
# Run complete unit test suite (55 tests across 8 suites)
npm test

# Run production build check
npm run build
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License & Attribution

- **Source Code:** Released under the [MIT License](file:///release/LICENSE.txt).
- **Data & Metadata:** Dedicated to the public domain under [Creative Commons Zero v1.0 Universal (CC0-1.0)](file:///release/LICENSE.txt). Sourced from the NASA Physical Sciences Informatics (PSI) system per the Registry of Open Data on AWS.
- **NASA Credit:** Credit to NASA Physical Sciences Informatics (PSI) and the NASA Glenn Research Center is provided in text only.
