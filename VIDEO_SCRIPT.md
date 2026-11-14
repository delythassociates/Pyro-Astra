# PYRO-ASTRA: 30-Second Video Demonstration Script

**NASA Space Apps Challenge 2026**  
**Challenge:** *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Global Submission Deadline:** November 15, 2026 at 11:59 PM Local Time (per participant's registered local event timezone; registration closes November 15, 2026 at 11:59 PM Local Time).  
**Total Runtime:** Exactly 30 Seconds  
**Format:** High-Definition Screen Recording with High-Contrast On-Screen Captions  
**Audio / Narration Rule:** Word-for-word alignment between spoken narration and on-screen captions. Every visual assertion is backed by verifiable on-screen UI elements. Attribution to NASA and NASA PSI is provided in plain text only.

---

### Shot 1: The Empirical Gap (0:00 – 0:06 | 6s)
* **Visual:**  
  Start on the PYRO-ASTRA home screen ([`/`](file:///)). The camera centers on the glowing amber-and-red Gap Card beneath the Hero Flame HUD. A pulsing indicator highlights the headline: *"Critical Finding: The Partial-Gravity Data Gap"*.
* **On-Screen Action:**  
  Cursor hovers over the Gap Card text disclosing that NASA PSI contains 0 partial-gravity combustion datasets.
* **On-Screen Caption (Bottom Monospace Overlay):**  
  `The public record has no partial-gravity combustion data, so PYRO-ASTRA shows the gap instead of faking it.`
* **Voiceover Narration:**  
  *"The public record has no partial-gravity combustion data, so PYRO-ASTRA shows the gap instead of faking it."*

---

### Shot 2: Lunar Environment Audit Table (0:06 – 0:12 | 6s)
* **Visual:**  
  Smooth scroll down to the **Moon-Base Target Criteria Audit Table** on the homepage.
* **On-Screen Action:**  
  Cursor highlights the benchmark exploration target: $34\%\text{ O}_2\text{ at }8.2\text{ psi}$ (citing NASA NTRS-20210022143). The view highlights the solid fuel rows: BASS-II reports $16.8\%\text{--}22.2\%\text{ O}_2$ with chamber pressure not reported, while BASS and SAFFIRE-II display *"not reported"* for both parameters.
* **On-Screen Caption (Bottom Monospace Overlay):**  
  `Planned lunar habitats require 34% O₂ at 8.2 psi. Public solid-fuel microgravity archives report zero tests in this regime.`
* **Voiceover Narration:**  
  *"Planned lunar habitats require 34% oxygen at 8.2 psi. Public solid-fuel microgravity archives report zero tests in this regime."*

---

### Shot 3: Atmospheric Coverage Map (0:12 – 0:18 | 6s)
* **Visual:**  
  Instant cut to the **Atmospheric Coverage Map** ([`/coverage`](file:///coverage)).
* **On-Screen Action:**  
  User clicks the **"Moon Habitat"** preset button. The D3 coordinate space plots Pressure ($0\text{--}45\text{ psi}$) versus Oxygen ($10\text{--}100\%\text{ O}_2$). A shaded box highlights the planned lunar habitat zone in the untested region. The **Nearest Tested Flight Evidence** panel calculates the distance vector to the closest flight test (PSI-69 FLEX at $7.35\text{ psi}$, $21\%\text{ O}_2$, liquid droplet).
* **On-Screen Caption (Bottom Monospace Overlay):**  
  `Atmospheric Coverage Map: Visualizing 18 NASA investigations against crewed habitats and computing nearest tested flight evidence.`
* **Voiceover Narration:**  
  *"Atmospheric coverage map: Visualizing 18 NASA investigations against crewed habitats and computing nearest tested flight evidence."*

---

### Shot 4: Ask ASTRA Agent & Grounded Guardrails (0:18 – 0:24 | 6s)
* **Visual:**  
  Cut to **Ask ASTRA** ([`/ask`](file:///ask)).
* **On-Screen Action:**  
  User enters the query: *"What pressure did BASS-II use?"*. The agent immediately displays its verified answer: *"Chamber pressure was not reported in authentic NASA PSI metadata."* The Tool Execution Trace expands below, revealing the execution of `search_records`, `get_record`, and the deterministic TypeScript `verifier` step.
* **On-Screen Caption (Bottom Monospace Overlay):**  
  `Ask ASTRA: A tool-using research agent verified by code. When pressure is missing in PSI, it answers 'not reported'.`
* **Voiceover Narration:**  
  *"Ask ASTRA: A tool-using research agent verified by code. When pressure is missing in PSI, it answers 'not reported'."*

---

### Shot 5: Traceable Provenance Panel (0:24 – 0:30 | 6s)
* **Visual:**  
  Zoom in on a highlighted measurement rendered by the `<Val>` component.
* **On-Screen Action:**  
  The user clicks on the oxygen concentration value ($16.8\%$). The **Provenance Modal** smoothly opens on screen, displaying:
  - **Source ID:** `PSI-25` (BASS-II)
  - **Source File:** `NASA-TM-20210011385.pdf`
  - **Location:** `Page 57, Table 5.1 (Test M1)`
  - **DOI:** `10.60555/4qc4-de67`
  - **Status:** Verified primary source · Exact formula
* **On-Screen Caption (Bottom Monospace Overlay):**  
  `Traceable Evidence: Every number links to DOI, file, row, and exact formula. Refusing to guess.`
* **Voiceover Narration:**  
  *"Traceable evidence: Every single number links to DOI, file, row, and exact formula. Refusing to guess."*
