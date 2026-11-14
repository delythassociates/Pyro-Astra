# PYRO-ASTRA: Hand Verification Spot-Check List

Prepared for @Nevan to verify authentic physical values directly in NASA source documents without relying on automated scripts.

---

### 1. BASS-II (PSI-25) Cabin Oxygen Range
- **Source File**: [`raw_real/reports/NASA-TM-20210011385.pdf`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/reports/NASA-TM-20210011385.pdf)
- **Page / Location**: Page 57 (PDF Page 65), Table 5.1 (*"BASS-II flat PMMA burn tests"*), column *"Initial O2 %"*
- **Exact Value**: **`16.8% to 22.2%`** (Minimum: 16.8 vol% in Test M11; Maximum: 22.2 vol% in Test M3)
- **In-App Usage**: Stored in `data/investigations.json` under `PSI-25.cabin_o2_pct`.

---

### 2. BASS-II (PSI-25) Forced Flow Velocity Range
- **Source File**: [`raw_real/reports/NASA-TM-20210011385.pdf`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/reports/NASA-TM-20210011385.pdf)
- **Page / Location**: Page 57 (PDF Page 65), Table 5.1 (*"BASS-II flat PMMA burn tests"*), column *"Airflow cm/s"*
- **Exact Value**: **`2.0 to 21.0 cm/s`** (Minimum: 2.0 cm/s in Test M16; Maximum: 21.0 cm/s in Test M13)
- **In-App Usage**: Stored in `data/investigations.json` under `PSI-25.airflow_speed_cm_s`.

---

### 3. BASS-II (PSI-25) Flight Burn Test Count
- **Source File**: [`raw_real/reports/NASA-TM-20210011385.pdf`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/reports/NASA-TM-20210011385.pdf)
- **Page / Location**: Page 57 (PDF Page 65), Table 5.1 (*"BASS-II flat PMMA burn tests"*), column *"Test ID"*
- **Exact Value**: **`20 tests`** (Explicit rows labeled Test M1 through Test M20)
- **In-App Usage**: Stored in `data/investigations.json` under `PSI-25.n_tests` and exported to `data/bass2_table_5_1.csv`.

---

### 4. FLEX (PSI-69) Test Pressure Range
- **Source File**: [`raw_real/PSI-69/investigation_metadata.json`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/PSI-69/investigation_metadata.json)
- **Key Path**: `approach` (Numbered list, Step 1)
- **Exact Value**: **`0.5 − 1.5 atm`** (Converted with exact formula `1 atm = 14.6959 psi`: **`7.35 to 22.04 psi`**)
- **Quote**: *"1. Select the test pressure (0.5 − 1.5 atm) for the LOI tests."*
- **In-App Usage**: Stored in `data/investigations.json` under `PSI-69.pressure_psi` and rendered as the FLEX pressure band on `/coverage`.

---

### 5. FLEX-2 (PSI-68) Environmental Chamber Pressure Range
- **Source File**: [`raw_real/PSI-68/investigation_metadata.json`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/PSI-68/investigation_metadata.json)
- **Key Path**: `approach` (Paragraph 1)
- **Exact Value**: **`0.5 atm to 3.0 atm`** (`7.35 to 44.09 psi`)
- **Quote**: *"The chamber was filled with the appropriate atmosphere, which was varied in pressure between 0.5 atm to 3.0 atm and O2 concentration between 0.1 to 0.4 mole fraction"*
- **In-App Usage**: Stored in `data/metadata_inventory.md` and documented under PSI-68 approach.

---

### 6. FLEX-2 (PSI-68) O₂ Mole Fraction Range
- **Source File**: [`raw_real/PSI-68/investigation_metadata.json`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/PSI-68/investigation_metadata.json)
- **Key Path**: `approach` (Paragraph 1)
- **Exact Value**: **`0.1 to 0.4 mole fraction`** (10.0% to 40.0% O₂)
- **Quote**: *"O2 concentration between 0.1 to 0.4 mole fraction with the diluent gas making up the balance."*
- **In-App Usage**: Documented in `data/metadata_inventory.md`.

---

### 7. BASS (PSI-26) Maximum Fan Airflow Speed
- **Source File**: [`raw_real/PSI-26/investigation_metadata.json`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/PSI-26/investigation_metadata.json)
- **Key Path**: `approach` (Paragraph 1)
- **Exact Value**: **`40 cm/s`**
- **Quote**: *"Airflow was controlled using a variable speed fan, with airflow speeds reaching as high as 40 cm/s."*
- **In-App Usage**: Documented in `data/metadata_inventory.md`.

---

### 8. SAFFIRE-II (PSI-99) Sample Dimensions and Flow Velocity
- **Source File**: [`raw_real/PSI-99/investigation_metadata.json`](file:///c:/Users/Nevan/Desktop/nasa_space_apps_challenge_2026/raw_real/PSI-99/investigation_metadata.json)
- **Key Path**: `approach` (Paragraph 1)
- **Exact Value**: **`5 cm x 29 cm`** (9 samples) and **`20 or 30 cm/s`**
- **Quote**: *"Saffire-II has a sample card that contains 9 samples, each 5 cm x 29 cm. Depending on the sample material, the Saffire-II was conducted at an air flow velocity of either 20 or 30 cm/s, the flow being either concurrent or opposed."*
- **In-App Usage**: Documented in `data/metadata_inventory.md` and `data/digests.json`.

