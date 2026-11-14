# PYRO-ASTRA: Presentation Slide Deck Text

**NASA Space Apps Challenge 2026**  
**Challenge:** *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Global Submission Deadline:** November 15, 2026 at 11:59 PM Local Time (per participant's registered local event timezone; registration closes November 15, 2026 at 11:59 PM Local Time).  
**Format:** 7-Slide Competition Pitch Deck  
**Attribution:** Sourced from NASA Physical Sciences Informatics (PSI). Credited in text only per NASA policy.

---

## Slide 1: Title & Vision
### PYRO-ASTRA: Spacecraft Fire Safety Intelligence Dashboard
**Sub-title:** Unlocking Four Decades of Microgravity Combustion Data for Future Lunar and Deep-Space Missions

- **Team:** PYRO-ASTRA Science & Engineering Team
- **Challenge:** *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*
- **Global Deadline:** November 15, 2026 at 11:59 PM Local Time
- **Core Ethos:** *Evidence you can trace, gaps you can see.*
- **Visual:** High-contrast mission-control interface featuring the Hero Flame Physics HUD transitioning from terrestrial buoyant teardrop ($1g$) to microgravity spherical blue glow ($0g$).

---

## Slide 2: The Critical Problem & The Partial-Gravity Data Gap
### The Existential Hazard Facing Exploration Habitats

1. **Fire in Closed Spacecraft:**
   - In deep space transit and surface habitats, fire is an existential hazard. Buoyancy suppression drastically alters flame spread, soot residence, and extinction limits.
2. **Siloed Public Archives:**
   - Decades of combustion data across Shuttle, Mir, and ISS are fragmented across NASA Physical Sciences Informatics (PSI) in disparate formats and unlinked reports.
3. **The Empirical Gap Exposed:**
   - Planned lunar surface habitats require **$34\%\text{ O}_2\text{ at }8.2\text{ psi}$** (citing NASA NTRS-20210022143).
   - **Critical Finding:** Public flight archives in NASA PSI contain exactly **0** combustion datasets in lunar ($0.16g$) or Martian ($0.38g$) surface gravity.
   - Across all 19 experimental tables, **676 rows report both $O_2$ and pressure (369 cabin rows); none are $\ge 30\%$ $O_2$ and $\le 10.2\text{ psi}$ in cabin air**.
   - Solid-fuel flight investigations (BASS, SAFFIRE-II) leave this operational envelope completely unrepresented in public archives.

---

## Slide 3: What PYRO-ASTRA Delivers
### Mapping Directly to the 4 Core Challenge Mandates Across 16 Endpoints

- **1. Summarize:** Synthesizes 18 flight investigations (8 metadata-mined campaigns + 10 experimental-table-ingested records) with unified parameters, hardware facility profiles (CIR, MSG, Cygnus), and raw experimental tables.
- **2. Rank:** Dynamic multi-attribute relevance ranking engine (`/rank`) weighting oxygen concentrations, pressures, ventilation velocities, and fuel phases.
- **3. Interpret:** Interactive *Hero Flame Physics HUD* modeling soot chemistry, spherical flame geometries, and buoyant suppression; paired $0g$ vs $1g$ physical bounding regimes.
- **4. Deliver Insights:** Exposes dangerous habitat blindspots, projects atmospheric transit risks (`/path`), and delivers validated SI answers via Ask ASTRA (`/ask`).
- **Endpoint Architecture:** 16 robust application endpoints (15 interactive page routes + 1 deterministic API route).

---

## Slide 4: Radical Scientific Honesty & Traceable Provenance
### What We Refused to Guess

Where conventional hackathons mask data scarcity with ungrounded extrapolations or synthetic interpolations, PYRO-ASTRA enforces six non-negotiable physical rules:

1. **Nulls Over Guesses:** If NASA PSI did not state a parameter, we record `null` and show *"not reported"*.
2. **Mandatory Provenance:** Every single measurement carries verifiable provenance (DOI, source file, row/page, exact formula). The UI `<Val>` component refuses to render numbers without provenance.
3. **No Partial-Gravity Speculation:** We refuse to guess lunar or Martian flammability; $0g$ and $1g$ flight data serve as strict physical bounds.
4. **Burner-Flow vs Cabin $O_2$ Isolation:** CFI-G burner co-flow (up to $85\%\text{ O}_2$) is strictly partitioned from cabin life-support air.
5. **Rockets and Propellants Excluded:** Ask ASTRA refuses rocket propulsion queries to focus squarely on pressurized cabin safety.
6. **Plain-Text Credit Only:** Zero NASA logos or insignia; plain-text attribution to NASA PSI.

---

## Slide 5: Interactive Atmospheric Coverage & Nearest Flight Evidence
### Visualizing Flight Envelopes Against Planned Habitats

- **Atmospheric Coordinate Space (`/coverage`):**
  - Interactive D3-powered environmental coordinate system plotting Pressure ($0\text{--}45\text{ psi}$) against Oxygen Concentration ($10\text{--}100\%\text{ O}_2$).
  - Overlays target habitat envelopes: Nominal Cabin ($21\%\text{ O}_2$, $14.7\text{ psi}$), Exploration Atmosphere ($34\%\text{ O}_2$, $8.2\text{ psi}$), and EVA Spacesuit ($100\%\text{ O}_2$, $4.3\text{ psi}$).
- **Nearest Tested Evidence Engine:**
  - Automatically calculates normalized parameter distance vectors from planned habitat conditions to the closest empirical flight observations.
  - Demonstrates that the closest flight observation to lunar habitat conditions is liquid droplet combustion (PSI-69 FLEX at $7.35\text{ psi}$, $21\%\text{ O}_2$)—confirming zero solid-material flight coverage.

---

## Slide 6: Ask ASTRA — Live Verified AI Copilot
### Dual-Layer Intelligence with Deterministic TypeScript Interception

- **Tool-Using Research Copilot (`/ask`):**
  - Natural language copilot powered by 8 structured retrieval and calculation tools (`search_records`, `get_record`, `compute_rank`, `check_coverage`, etc.).
- **Deterministic Code Guardrails (`src/lib/validate.ts`):**
  - An LLM proposes answers, but a deterministic TypeScript runtime verifier has the absolute final veto before anything renders.
  - Intercepts and blocks hallucinated numbers, invalid units, dimensional mismatches, and ungrounded fuel claims.
  - Triggers strict, informative policy refusals for partial-gravity extrapolation requests and rocket propellant queries.
- **100-Probe Hybrid Adversarial Evaluation Suite:**
  - Evaluated against 100 adversarial attack probes spanning prompt injection, hallucination attempts, and policy bounds across both Offline and Live modes: **100% DUAL-MODE PASS RATE (100/100)**.

---

## Slide 7: Scientific Verification, Open Data & Judging Criteria
### Tested, Audited, and Cleared for Space Apps Excellence

- **Automated Verification Ledger:**
  - **54 Unit Tests across 8 Suites:** Executed via Node.js native test runner (`node:test via tsx`) — **100% PASS**.
  - **100 Adversarial Policy Probes:** Dual-mode benchmark evaluated with 100% policy compliance — **100% PASS**.
  - **65 Verbatim Literature Quotes:** Verified 100% verbatim against NASA reports via Python audit — **100% PASS**.
  - **Single-Command Reproducibility:** `npm run reproduce` executes data extraction, packaging, test suites, Next.js build, and latency SLA (< 2.0s) in < 55 seconds across all 29 endpoints.
- **Open Data Package (`/release`):**
  - Authoritative tidy datasets (`investigations.csv`, `table_5_1_bass2.csv`, `modeling_ready_runs.csv` [1,843 runs], `availability.json`) published under CC0-1.0 / MIT.
- **Judging Criteria Alignment:**
  - **Impact:** Solves existential fire safety blindspots for long-duration space flight.
  - **Creativity:** Radical empirical honesty + interactive flame physics HUD + code-verified AI.
  - **Validity:** 100% provenance, zero fabrication, 54 automated tests, 100 adversarial probes, published scientific null result.
  - **Relevance:** Mines 18 NASA investigations, 1,843 modeling-ready runs, 129 BASS-II runs, 274 FLEX rows, 109 SAME-R rows.
  - **Presentation:** High-contrast mission-control UI, responsive phone layout, 60-second 3-click tour.
