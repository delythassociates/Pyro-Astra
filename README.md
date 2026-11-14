# PYRO-ASTRA

**Spacecraft Fire Safety Intelligence Dashboard for Crewed Space Environments**  
*NASA Space Apps Challenge 2026 · Challenge: "Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data"*  
**Global Submission Deadline:** November 15, 2026 at 11:59 PM Local Time (per participant's registered local event timezone; registration closes November 15, 2026 at 11:59 PM Local Time).  

PYRO-ASTRA is an interactive, research-grade web dashboard built to **summarize**, **rank**, and **interpret** four decades of microgravity combustion data from NASA's Physical Sciences Informatics (PSI) repository. Designed for aerospace engineers, life-support system designers, and safety researchers assessing fire safety in crewed spacecraft, lunar outposts, and planetary transit habitats.

---

## Key Differentiators

1. **Traceable Evidence**: Every single stored number carries SHA-256 or document-level provenance (DOI, source file, row/page number, and exact mathematical conversion formula). The UI refuses to render numbers without provenance.
2. **Empirical Grounding & Gap Disclosure**: Absolute physical realism. If a condition is not stated in authentic NASA documentation, it is stored as `null` and displayed as *"not reported"*.
3. **Live Tool-Using Agent (Ask ASTRA)**: Combines structured tools with LLM reasoning, where a deterministic TypeScript verifier interceptor has the final veto before rendering. Refuses partial gravity, rocket propellants, and ungrounded fabrications.
4. **Interactive Coverage Map & Gap Disclosure**: Pressure ($0\text{--}45\text{ psi}$) vs $O_2$ ($10\text{--}100\%$) environmental coordinate space highlighting tested flight domains, shaded exploration habitat reference ranges, and transparently exposing untested regimes (such as partial gravity).

---

## What We Refused to Guess (Non-Negotiable Rules)

1. **No Invented or Interpolated Data**: If NASA PSI does not report a condition, we store `null` and show *"not reported"*.
2. **Strict Provenance Guarantee**: All values render through the `<Val>` component. The UI refuses to render any value lacking provenance.
3. **No Partial-Gravity Predictions**: PSI contains zero partial-gravity combustion data. We show only $0g$ and $1g$ flight results as upper/lower physical bounds.
4. **Burner-Flow vs. Cabin Oxygen Separation**: High-oxygen burner flow (e.g. CFI-G burner co-flow reaching up to $85\%\text{ O}_2$) is strictly separated from habitat cabin air.
5. **No Rocket/Propellant Scope**: Ask ASTRA rejects rocket propulsion questions to focus squarely on habitat fire safety.
6. **No NASA Logos or Insignia**: Attribution to NASA and NASA PSI is provided strictly in plain text per NASA non-endorsement policy.

---

## Authentic Data Ingestion & Grounding Audit

To guarantee 100% scientific validity and reproducibility:

### Authentic Sources Ingested
- **NASA PSI GEODE API Metadata**: Ingested directly from official NASA endpoints into `raw_real/<PSI-ID>/investigation_metadata.json` for all 18 investigations (8 metadata-mined + 10 experimental-table-ingested), capturing verified DOIs, objectives, hardware, fuels, and sensors.
- **NASA/TM-20210011385 (BASS-II Flight Report)**: Table 5.1 extracted row-by-row (20 tests, M1–M20) from Page 57, documenting airflow velocities ($2.0\text{--}21.0\text{ cm/s}$), sample geometry, and initial/final oxygen concentrations ($16.8\%\text{--}22.2\%\text{ vol}$). Saved to `data/bass2_table_5_1.json` and `data/bass2_table_5_1.csv`.
- **Authentic Experimental Tables Ingested**:
  * **BASS-II (PSI-25):** 129 table rows spanning tests B1 through T28 across 5 principal investigators. Chamber pressure is `null` (*"not reported"*).
  * **FLEX (PSI-69):** 274 rows in CIR ($0.5\text{--}3.0\text{ atm}$, $12\%\text{--}34\%\text{ O}_2$). Near-miss verified: 24 rows with $O_2 \ge 30\%$ are all at pressure $\ge 10.33\text{ psi}$ (0 rows reach lunar $8.2\text{ psi}$).
  * **FLEX-2 (PSI-68):** 8 rows in CIR ($25.0^\circ\text{C}$). Candidate sets reach $30\%\text{ O}_2$ and $0.5\text{ atm}$ ($7.35\text{ psi}$) as unconfirmed sets.
  * **CFI-G (PSI-159):** 102 rows in CIR (179 in run-level compilation). Exactly 20 rows at $\sim 7.35\text{ psi}$ ($0.50665\text{ bar}$) with burner stream $O_2$ $35.85\%\text{--}39.26\%$—verified as burner oxidizer flow only, NOT cabin air (Rule 4).
  * **SAME-R (PSI-101):** 109 rows across Kapton (29), Silicone (22), Lampwick (20), Pyrell (20), Teflon (18) with max inlet velocity $8.1\text{ cm/s}$. Duplicate confirmed: Test 57 was executed twice (Row 56 Lampwick, Row 74 Teflon on 29-Jul). An earlier audit count of 108 rows was wrong because it counted unique test IDs. Questions Q02/Q11 depend on pyrolysis products where O2 and pressure are null in SAME-R, remaining strictly "Not assessable".
  * **SAME (PSI-102):** 18 rows in MSG (airflow $5.0\text{ cm/s}$, weight loss rate $2.0\text{ mg/min}$). Classified consistently under Smoke Particulate.
  * **SAFFIRE-II (PSI-99):** 9 sample burn sequence cards aboard Cygnus (15 run rows; airflow $20.0\text{ cm/s}$, ignition power $80.0\text{ W}$).
  * **SPICE (PSI-107):** 469 rows in CIR. 8 rows with negative airflow flagged suspect and excluded; valid airflow envelope spans $0.66\text{ to }85.28\text{ cm/s}$ ($n=436$), never starting below 0.
  * **Flame Design (PSI-10):** 327 rows in CIR (207 Normal + 120 Inverse). 18 Inverse Flame rows at $6.26\text{--}7.57\text{ psi}$ with oxidizer $O_2$ $31.97\text{--}85.0\%$ are strictly oxidizer stream flow, NOT cabin air. Cabin $O_2$ is not reported (stored as `null`).
  * **ACME-BRE (PSI-20):** 18 rows in CIR. Chamber pressure is strictly "pressure not reported" (stored as `null`), never a match or miss.
  * **ACME E-FIELD (PSI-22):** 32 rows in CIR. Tagged strictly as electric field analog, never partial gravity.
  * **Lunar Environmental Sweep Verification (676 rows report both, 369 cabin rows):** None are $\ge 30\%$ $O_2$ and $\le 10.2\text{ psi}$ in cabin air.
  * **Run Total Reconciliation:** 1,815 table rows (1,807 discrete test runs + 8 candidate sets) across Solid (272), Liquid Droplet (369 = 274 FLEX + 87 CFI + 8 FLEX-2 candidate sets), Gas (1,055), Smoke Pyrolysis (117), and Dust (2). Table 5.1 fields are deduplicated by merging onto BASS-II rows M1–M20 (keeping BASS-II at 129 rows), and bibliographic index PSI-142 (8 rows) is excluded.
  * **Analyzed Data Separation:** PSI-117 (2,860 rows) classified strictly as analyzed research data separate from run-level datasets.
- **NASA/TP-2015-218570 (BVAD)**: Official baseline environmental values and life-support assumptions for spacecraft cabins, spacesuits, and lunar habitats ($34\%\text{ O}_2$, $8.2\text{ psi}$).

---

## Project Structure & 16 Application Endpoints

```
├── data/
│   ├── schema.ts            # Core TypeScript interfaces & provenance types
│   ├── investigations.json  # 18 curated investigations (8 metadata-mined + 10 experimental-table-ingested, audited)
│   ├── investigations.csv   # Flattened CSV export with provenance
│   ├── bass2_table_5_1.json # 20 flight test runs from NASA/TM-20210011385 Table 5.1
│   ├── bass2_table_5_1.csv  # CSV export of Table 5.1
│   ├── bounds.json          # Paired 0g / 1g flight bounding data
│   ├── digests.json         # AI-drafted from NASA metadata (clearly labeled)
│   ├── links.json           # Earth applications & NASA reference links
│   ├── demo-answers.json    # Offline fallback fixtures for Ask ASTRA
│   ├── ask-eval.json        # 100-probe dual-mode evaluation benchmark report (100% pass)
│   └── table_runs/          # Ingested experimental tables with per-row provenance
├── raw_real/                # Authentic NASA downloads (read-only)
│   ├── PSI-*/               # Official investigation_metadata.json & CSV tables
│   └── reports/             # NASA/TM-20210011385.pdf and NASA-TP-2015-218570.pdf
├── release/                 # Curated public data release (CC0-1.0 & MIT)
│   ├── investigations.csv   # Flat 88-column research matrix
│   ├── extractions.json     # Grounded verbatim quotes and key paths
│   ├── table_5_1_bass2.csv  # Verified 20-run BASS-II flight matrix
│   ├── availability.json    # Investigation availability & missingness audit
│   ├── field_dictionary.json# Field data types, units, and validation rules
│   ├── manifest.sha256      # SHA-256 integrity checksums
│   └── DATACARD.md          # Dataset card & AWS registry attribution
├── src/
│   ├── app/                 # 15 application endpoints (14 page routes + 1 API route)
│   │   ├── page.tsx         # / (Home: Mission Overview, Hero Flame HUD, Gap Card)
│   │   ├── ask/             # /ask (Ask ASTRA live tool-using agent & verifier trace)
│   │   ├── compare/         # /compare (Multi-investigation parameter matrix)
│   │   ├── coverage/        # /coverage (Pressure vs O2 map & nearest flight evidence)
│   │   ├── data/            # /data (Open data download center & file catalog)
│   │   ├── data-quality/    # /data-quality (Missingness heatmap & conversion audit)
│   │   ├── functions/       # /functions (Scientific objectives & hardware facilities)
│   │   ├── path/            # /path (Earth-to-Mars transit fire risk transition)
│   │   ├── proposals/       # /proposals (Future reduced-gravity payload proposals)
│   │   ├── rank/            # /rank (Real-time multi-attribute relevance ranking engine)
│   │   ├── readiness/       # /readiness (NASA spacecraft material flammability ledger)
│   │   ├── surprises/       # /surprises (Microgravity counter-intuitions & cool flames)
│   │   ├── trust/           # /trust (Scientific provenance & automated test suites)
│   │   ├── _not-found.tsx   # /_not-found (Graceful 404 recovery)
│   │   └── api/ask/         # /api/ask (Deterministic policy-enforcing API route)
│   ├── components/          # <Val>, <HeroFlame>, <Navigation>, etc.
│   └── lib/                 # score.ts, nearest.ts, validate.ts, agent.ts
├── tests/                   # 45 automated unit & integration tests (node:test via tsx)
├── scripts/
│   ├── reproduce.py         # End-to-end single-command reproducibility runner
│   └── run-ask-eval.ts      # 50-probe adversarial policy evaluation runner
├── PROJECT_PAGE.md          # Space Apps project narrative & judging guide
├── JUDGE_GUIDE.md           # 60-second 3-click judge evaluation walkthrough
├── VIDEO_SCRIPT.md          # 30-second screen-recorded demo script
├── SLIDES.md                # 7-slide pitch deck text
├── DATACARD.md              # Research dataset card & open data documentation
└── SPEC.md                  # Comprehensive engineering specification
```

---

## Getting Started & Deployment Instructions

### Prerequisites
- Node.js 20+
- Python 3.10+ (for data extraction & audit verification)

### Installation & Verification

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run complete unit test suite (54 tests across 8 suites in `node:test via tsx`)**:
   ```bash
   npm test
   ```

3. **Run Ask ASTRA 100-probe dual-mode adversarial evaluation suite**:
   ```bash
   npx tsx scripts/run-ask-eval.ts
   ```

4. **Verify all 65 literature quotes verbatim against authentic NASA reports**:
   ```bash
   python analysis/verify_quotes.py
   ```

5. **Review Live Mode Operational Evidence & AI Disclosures**:
   Inspect [docs/LIVE_MODE.md](file:///docs/LIVE_MODE.md) and [AI-USE.md](file:///AI-USE.md) detailing Google Gemini REST integration, server-side env-key isolation, 12s timeout guards, circuit breaker cooldown, 15 RPM throttle, and 100% programmatic verifier interception (`src/lib/validate.ts`).

6. **Single-Command Full Pipeline Reproduction (< 50 seconds, all 28 endpoints verified)**:
   ```bash
   npm run reproduce
   # Or directly: python scripts/reproduce.py
   # Or on Windows: ./reproduce.ps1
   # Or on Linux/macOS: ./reproduce.sh
   ```

7. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Deployment

1. **Compile optimized production build**:
   ```bash
   npm run build
   ```

2. **Start standalone production server**:
   ```bash
   npm start
   ```

3. **Deploy to Vercel (Production)**:
   ```bash
   # Deploy directly via Vercel CLI
   vercel --prod
   ```

4. **Deploy via Docker**:
   ```bash
   # Build container image
   docker build -t pyro-astra .

   # Run container
   docker run -p 3000:3000 -e PORT=3000 pyro-astra
   ```

---

## Space Apps Award Alignment

- **Best Use of Data**: Full provenance on every single value; comprehensive missingness heatmap and unit audit in `/data-quality`; reproducible open data export (`investigations.csv`); row-by-row extraction of NASA/TM-20210011385 Table 5.1 and 129 BASS-II table rows.
- **Best Use of Science**: Grounded strictly in authentic NASA PSI metadata and technical reports; physical bounding regimes ($0g$ vs $1g$); zero fabrication; strict refusal of partial-gravity speculation and rocket propellants.
- **Best Mission Concept / Best Idea**: Coverage-first gap analysis exposing spacecraft atmospheric blindspots, combined with a deterministic tool-verified SI agent where code has the final veto.
- **Galactic Impact**: Directly addresses life-critical fire safety for Artemis lunar base and Mars transit missions, where an uncontrolled fire is catastrophic.
- **Presentation & Polish**: Mission control aesthetic, responsive phone layout, interactive WebGL/SVG flame physics HUD, light/dark modes, and a 60-second 3-click evaluation pathway.

---

## License & Attribution

- **Software**: Licensed under the [MIT License](file:///release/LICENSE.txt).
- **Data**: Dedicated to the public domain under [Creative Commons Zero v1.0 Universal (CC0-1.0)](file:///release/LICENSE.txt). Sourced from NASA Physical Sciences Informatics (PSI) per the Registry of Open Data on AWS: *"There are no restrictions on the use of this data."*
- **NASA Credit**: Credit to NASA Physical Sciences Informatics (PSI) and the NASA Glenn Research Center is provided in text only.
