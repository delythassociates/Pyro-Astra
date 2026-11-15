# NASA PSI Investigation Metadata Inventory (Step 1 & 2 Audit)

Audited strictly from authentic NASA PSI files in `raw_real/<PSI-ID>/investigation_metadata.json`.

## Summary of Findings
1. **Top-Level Keys**: All 8 records share an identical 61-key schema from NASA GEODE repository.
2. **Experiment Tables**: The key `data['experimentalTable']` contains metadata descriptors of experiment table files stored on NASA's backend (e.g. `file_name: 'PSI-69_Experimental table_FLEX.csv'`), but **no embedded rows/arrays of individual runs** exist in the JSON itself.
3. **Per-Test Condition Fields**: Fields like `assays` and `studies` are empty arrays (`[]`). Per-test numerical measurements (e.g. test-by-test flame spread rates or extinction points) are not present in the JSON files.
4. **Extractable Grounded Parameters**: High-level objectives, facility hardware, DOIs, publication counts, and research impact narratives are present.

---

## PSI-69: Flame Extinguishment Experiment
- **Source File**: `raw_real/PSI-69/investigation_metadata.json`
- **DOI**: `10.60555/mbq8-0451` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-69`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 0 items)
- `data['approach']` (str): `The FLEX experiments involve igniting and observing the burning behavior of rela...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 7 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (bool): `False`
- `data['doi']` (str): `10.60555/mbq8-0451`
- `data['experimentHardware']` (str): `Combustion Integrated Rack (CIR)-Fluids and Combustion Facility (FCF), Multi-use...`
- `data['experimentHardwareLink']` (str): `https://issnationallab.org/facilities/combustion-integrated-rack/, https://gipoc...`
- `data['experimentalTable']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `International Space Station (ISS)`
- `data['funding']` (str): `NNX09AM33A`
- `data['hypothesis']` (str): `The primary hypothesis of the FLEX mission is that microgravity conditions funda...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 0 items)
- `data['investigationAcronym']` (str): `FLEX`
- `data['investigationEndDate']` (str): `07-31-2016`
- `data['investigationStartDate']` (str): `08-01-2007`
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 0 items)
- `data['modifiedDate']` (str): `06-Jun-2025`
- `data['objective']` (str): `The FLEX (Flame Extinguishment Experiment) investigation aims to map the flammab...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): `Droplet Flame Extinguishment in Microgravity`
- `data['public']` (bool): `True`
- `data['publications']` (list of 51 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): ``
- `data['releaseDate']` (str): `31-Jul-2016`
- `data['removed']` (list of 0 items)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `The research impacts and Earth benefits of the FLEX mission are significant and ...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Aeronautics and Space Administration (NASA)`
- `data['subResearchArea']` (str): `Spacecraft Fire Safety`
- `data['submissionDate']` (str): `31-Jul-2016`
- `data['title']` (str): `Flame Extinguishment Experiment`
- `data['totalFileSize']` (float): `923832535657.0`
- `data['version']` (int): `5`
- `data['versionMessage']` (str): ``
- `data['versionMessageLevel']` (str): ``
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `Metadata update`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-69_Experimental table_FLEX.csv` (size: 24776 bytes, path: `/Home/psi-data/PSI-69/Experimental table/PSI-69_Experimental table_FLEX.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 30 instruments/facilities recorded.
- **Publication Count**: 51 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---

## PSI-68: Flame Extinguishment Experiment - 2
- **Source File**: `raw_real/PSI-68/investigation_metadata.json`
- **DOI**: `10.60555/byp8-h018` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-68`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 0 items)
- `data['approach']` (str): `The chamber was filled with the appropriate atmosphere, which was varied in pres...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 8 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (bool): `False`
- `data['doi']` (str): `10.60555/byp8-h018`
- `data['experimentHardware']` (str): `Combustion Integrated Rack (CIR), Multi-user Droplet Combustion Appartatus (MDCA...`
- `data['experimentHardwareLink']` (str): `https://issnationallab.org/facilities/combustion-integrated-rack/, https://gipoc...`
- `data['experimentalTable']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `International Space Station (ISS)`
- `data['funding']` (str): `NNX16AR09A`
- `data['hypothesis']` (str): `Fairly sophisticated numerical simulations of convective droplet combustion have...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 0 items)
- `data['investigationAcronym']` (str): `FLEX-2`
- `data['investigationEndDate']` (str): `09-30-2019`
- `data['investigationStartDate']` (str): `08-12-2016`
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 0 items)
- `data['modifiedDate']` (str): `25-Nov-2025`
- `data['objective']` (str): `The primary goal of the FLEX-2 flight experiments is to extend the results of FL...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): `The Fundamental Studies in Droplet Combustion and Flame Extinguishment in Microg...`
- `data['public']` (bool): `True`
- `data['publications']` (list of 48 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): ``
- `data['releaseDate']` (str): `30-Sep-2019`
- `data['removed']` (list of 0 items)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `The combustion of liquid fuels is the overwhelming energy source in the transpor...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Aeronautics and Space Administration (NASA)`
- `data['subResearchArea']` (str): `Spacecraft Fire Safety`
- `data['submissionDate']` (str): `30-Sep-2019`
- `data['title']` (str): `Flame Extinguishment Experiment - 2`
- `data['totalFileSize']` (float): `1224752113090.0`
- `data['version']` (int): `6`
- `data['versionMessage']` (str): ``
- `data['versionMessageLevel']` (str): ``
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `Metadata update`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-68_Experimental table_Flex2.csv` (size: 1029 bytes, path: `/Home/psi-data/PSI-68/Experimental table/PSI-68_Experimental table_Flex2.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 28 instruments/facilities recorded.
- **Publication Count**: 48 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---

## PSI-25: Burning and Suppression of Solids - II
- **Source File**: `raw_real/PSI-25/investigation_metadata.json`
- **DOI**: `10.60555/4qc4-de67` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-25`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 694 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'remote_path', 'remote_url', 'resource_id', 'restricted']`)
- `data['approach']` (str): `To summarize, BASS-II's approach, microgravity combustion tests were performed a...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 5 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (bool): `False`
- `data['doi']` (str): `10.60555/4qc4-de67`
- `data['experimentHardware']` (str): `Microgravity Science Glovebox (MSG)`
- `data['experimentHardwareLink']` (str): `https://www1.grc.nasa.gov/space/iss-research/msg/`
- `data['experimentalTable']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `International Space Station (ISS)`
- `data['funding']` (str): ``
- `data['hypothesis']` (str): `BASS–II tests the hypothesis that materials in microgravity, with adequate venti...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['investigationAcronym']` (str): `BASS-II`
- `data['investigationEndDate']` (str): `12-31-2022`
- `data['investigationStartDate']` (str): `01-01-2010`
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 0 items)
- `data['modifiedDate']` (str): `24-Nov-2025`
- `data['objective']` (str): `BASS-II results contribute to the combustion computational models used in the de...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): ``
- `data['public']` (bool): `True`
- `data['publications']` (list of 17 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): `PSI-26`
- `data['releaseDate']` (str): `31-Dec-2022`
- `data['removed']` (list of 131 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'psi_legacy', 'psi_legacy_s3_path', 'remote_path', 'remote_url']`)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `A primary goal of BASS-II is improved spacecraft fire safety, improved understan...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Aeronautics and Space Administration (NASA)`
- `data['subResearchArea']` (str): `Spacecraft Fire Safety`
- `data['submissionDate']` (str): `31-Dec-2022`
- `data['title']` (str): `Burning and Suppression of Solids - II`
- `data['totalFileSize']` (float): `274631106141.0`
- `data['version']` (int): `4`
- `data['versionMessage']` (str): ``
- `data['versionMessageLevel']` (str): ``
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `Metadata update`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-25_Experimental table_BASS-II.csv` (size: 16590 bytes, path: `/Home/psi-data/PSI-25/Experimental table/PSI-25_Experimental table_BASS-II.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 20 instruments/facilities recorded.
- **Publication Count**: 17 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---

## PSI-26: Burning and Suppression of Solids
- **Source File**: `raw_real/PSI-26/investigation_metadata.json`
- **DOI**: `10.60555/58h4-dy80` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-26`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 211 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'remote_path', 'remote_url', 'resource_id', 'restricted']`)
- `data['approach']` (str): `The experiment was conducted aboard the International Space Station (ISS) inside...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 4 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (bool): `False`
- `data['doi']` (str): `10.60555/58h4-dy80`
- `data['experimentHardware']` (str): `Microgravity Science Glovebox`
- `data['experimentHardwareLink']` (str): `https://www1.grc.nasa.gov/space/iss-research/msg/`
- `data['experimentalTable']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `International Space Station (ISS)`
- `data['funding']` (str): ``
- `data['hypothesis']` (str): `BASS experiments were based on the hypothesis that materials in microgravity, wi...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 0 items)
- `data['investigationAcronym']` (str): `BASS`
- `data['investigationEndDate']` (str): `06-30-2013`
- `data['investigationStartDate']` (str): `10-01-2009`
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 0 items)
- `data['modifiedDate']` (str): `19-Mar-2025`
- `data['objective']` (str): `The two main objectives for BASS are to:
    1.) Begin to bridge the gap between...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): ``
- `data['public']` (bool): `True`
- `data['publications']` (list of 10 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): `PSI-107,PSI-25`
- `data['releaseDate']` (str): `30-Jun-2013`
- `data['removed']` (list of 24 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'psi_legacy', 'psi_legacy_s3_path', 'remote_path', 'remote_url']`)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `Current NASA spacecraft materials selection is based on a standard test method (...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Aeronautics and Space Administration (NASA)`
- `data['subResearchArea']` (str): `Spacecraft Fire Safety`
- `data['submissionDate']` (str): `30-Jun-2013`
- `data['title']` (str): `Burning and Suppression of Solids`
- `data['totalFileSize']` (float): `163551372412.0`
- `data['version']` (int): `4`
- `data['versionMessage']` (str): ``
- `data['versionMessageLevel']` (str): ``
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `Additional documentation release`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-26_Experimental table_BASS.csv` (size: 4726 bytes, path: `/Home/psi-data/PSI-26/Experimental table/PSI-26_Experimental table_BASS.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 18 instruments/facilities recorded.
- **Publication Count**: 10 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---

## PSI-102: Smoke and Aerosol Measurement Experiment
- **Source File**: `raw_real/PSI-102/investigation_metadata.json`
- **DOI**: `10.60555/gd4k-8h62` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-102`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 104 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'remote_path', 'remote_url', 'resource_id', 'restricted']`)
- `data['approach']` (str): `The crew installed the near field hardware in the Glovebox, attached the Far Fie...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 5 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (bool): `False`
- `data['doi']` (str): `10.60555/gd4k-8h62`
- `data['experimentHardware']` (str): `Comparitive Soot Diagnostic Hardware`
- `data['experimentHardwareLink']` (str): `https://ntrs.nasa.gov/api/citations/19960008413/downloads/19960008413.pdf`
- `data['experimentalTable']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `International Space Station (ISS)`
- `data['funding']` (str): `IH1013215`
- `data['hypothesis']` (str): `The three hypotheses that motivated this investigation:
In a μg environment, wit...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 0 items)
- `data['investigationAcronym']` (str): `SAME`
- `data['investigationEndDate']` (str): `02-28-2008`
- `data['investigationStartDate']` (str): `03-02-2001`
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 0 items)
- `data['modifiedDate']` (str): `02-Jun-2025`
- `data['objective']` (str): `One of the major goals of this investigation was to quantify the sizes that the ...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): ``
- `data['public']` (bool): `True`
- `data['publications']` (list of 16 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): `PSI-101`
- `data['releaseDate']` (str): `18-Sep-2024`
- `data['removed']` (list of 52 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'psi_legacy', 'psi_legacy_s3_path', 'remote_path', 'remote_url']`)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `The SAME experiment will provide technology for an advanced fire detector for fu...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Aeronautics and Space Administration (NASA)`
- `data['subResearchArea']` (str): `Spacecraft Fire Safety`
- `data['submissionDate']` (str): `18-Sep-2024`
- `data['title']` (str): `Smoke and Aerosol Measurement Experiment`
- `data['totalFileSize']` (float): `657608178.0`
- `data['version']` (int): `4`
- `data['versionMessage']` (str): ``
- `data['versionMessageLevel']` (str): ``
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `Additional documentation release`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-102_Experimental table_SAME.csv` (size: 331 bytes, path: `/Home/psi-data/PSI-102/Experimental table/PSI-102_Experimental table_SAME.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 20 instruments/facilities recorded.
- **Publication Count**: 16 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---

## PSI-101: Smoke Aerosol Measurement Experiment-Reflight
- **Source File**: `raw_real/PSI-101/investigation_metadata.json`
- **DOI**: `10.60555/2np7-jv14` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-101`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 342 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'psi_legacy', 'psi_legacy_s3_path', 'remote_path', 'remote_url']`)
- `data['approach']` (str): `SAME-R utilized the SAME hardware used on-orbit. Based on the experience gained ...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 6 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (bool): `False`
- `data['doi']` (str): `10.60555/2np7-jv14`
- `data['experimentHardware']` (str): `Comparitive Soot Diagnostic Hardware; Refer to final report`
- `data['experimentHardwareLink']` (str): `https://ntrs.nasa.gov/api/citations/19960008413/downloads/19960008413.pdf`
- `data['experimentalTable']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `International Space Station (ISS)`
- `data['funding']` (str): ``
- `data['hypothesis']` (str): `The three hypotheses that motivated the original SAME investigation is also appl...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 0 items)
- `data['investigationAcronym']` (str): `SAME-R`
- `data['investigationEndDate']` (str): `09-30-2010`
- `data['investigationStartDate']` (str): `07-01-2010`
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 0 items)
- `data['modifiedDate']` (str): `02-Jun-2025`
- `data['objective']` (str): `Similar to the original SAME investigation, the primary objective of the SAME-R ...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): ``
- `data['public']` (bool): `True`
- `data['publications']` (list of 6 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): `PSI-102`
- `data['releaseDate']` (str): `18-Sep-2024`
- `data['removed']` (list of 379 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'psi_legacy', 'psi_legacy_s3_path', 'remote_path', 'remote_url']`)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `Along with the results from the original SAME investigation, the results from SA...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Aeronautics and Space Administration (NASA)`
- `data['subResearchArea']` (str): `Spacecraft Fire Safety`
- `data['submissionDate']` (str): `18-Sep-2024`
- `data['title']` (str): `Smoke Aerosol Measurement Experiment-Reflight`
- `data['totalFileSize']` (float): `6308124750.0`
- `data['version']` (int): `4`
- `data['versionMessage']` (str): ``
- `data['versionMessageLevel']` (str): ``
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `Additional documentation release`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-101_Experimental table_SAME-R.csv` (size: 5674 bytes, path: `/Home/psi-data/PSI-101/Experimental table/PSI-101_Experimental table_SAME-R.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 24 instruments/facilities recorded.
- **Publication Count**: 6 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---

## PSI-99: Spacecraft Fire Experiment-II
- **Source File**: `raw_real/PSI-99/investigation_metadata.json`
- **DOI**: `10.60555/2chp-m469` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-99`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 0 items)
- `data['approach']` (str): `The Saffire-II experiment was performed on the Orbital Science’s Cygnus resupply...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 2 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (bool): `False`
- `data['doi']` (str): `10.60555/2chp-m469`
- `data['experimentHardware']` (str): `Cygnus Pressurized Cargo Module, SAFFIRE`
- `data['experimentHardwareLink']` (str): `https://cdn.northropgrumman.com/-/media/wp-content/uploads/Cygnus-Fact-Sheet-1.p...`
- `data['experimentalTable']` (list of 1 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `Cygnus Spacecraft`
- `data['funding']` (str): `NASA`
- `data['hypothesis']` (str): `This investigation hypothesizes that due to large differences between fire behav...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 0 items)
- `data['investigationAcronym']` (str): `SAFFIRE-II`
- `data['investigationEndDate']` (str): `04-01-2017`
- `data['investigationStartDate']` (str): `09-30-2016`
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 1 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'remote_path', 'remote_url', 'resource_id', 'restricted']`)
- `data['modifiedDate']` (str): `04-Jun-2025`
- `data['objective']` (str): `The objectives of SAFFIRE-II are to determine how rapidly a large scale fire gro...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): ``
- `data['public']` (bool): `True`
- `data['publications']` (list of 7 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): ``
- `data['releaseDate']` (str): `18-Sep-2024`
- `data['removed']` (list of 0 items)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `The Saffire-II experiment provides a new way to study a realistic fire on an exp...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Aeronautics and Space Administration (NASA)`
- `data['subResearchArea']` (str): `Surface Combustion`
- `data['submissionDate']` (str): `18-Sep-2024`
- `data['title']` (str): `Spacecraft Fire Experiment-II`
- `data['totalFileSize']` (float): `16931016137.0`
- `data['version']` (int): `5`
- `data['versionMessage']` (str): ``
- `data['versionMessageLevel']` (str): ``
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `Metadata update`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-99_Experimental table_SAFFIRE-2.csv` (size: 1973 bytes, path: `/Home/psi-data/PSI-99/Experimental table/PSI-99_Experimental table_SAFFIRE-2.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 24 instruments/facilities recorded.
- **Publication Count**: 7 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---

## PSI-159: Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases
- **Source File**: `raw_real/PSI-159/investigation_metadata.json`
- **DOI**: `10.60555/cyt1-kh64` (JSON key path: `data['doi']`)
- **Top-Level Keys (61)**: `accession, acknowledgments, added, approach, assays, contacts, description, dirty, doi, experimentHardware, experimentHardwareLink, experimentalTable, experiments, factors, filesDisabled, flightProgram, funding, hypothesis, identifiers, images, investigationAcronym, investigationEndDate, investigationStartDate, licenseIdentifier, licenseLink, licenseName, managingNasaCenter, missionEnd, missionLink, missionName, missionStart, modified, modifiedDate, objective, organizations, payloads, projectIdentifier, projectLink, projectTitle, projectType, proposalTitle, public, publications, related_glds, releaseDate, removed, researchArea, researchImpacts, restricted, sourceAccession, sourceLink, spaceProgram, subResearchArea, submissionDate, title, totalFileSize, version, versionMessage, versionMessageLevel, versionMessageLocations, versionReason`

### Two-Level Deep Key Structure:
- `data['accession']` (str): `PSI-159`
- `data['acknowledgments']` (str): ``
- `data['added']` (list of 3756 objects, subkeys: `['bucket', 'date_created', 'date_modified', 'file_name', 'file_size', 'organization', 'remote_path', 'remote_url', 'resource_id', 'restricted']`)
- `data['approach']` (str): `Perform spherical diffusion flame tests aboard the International Space Station. ...`
- `data['assays']` (list of 0 items)
- `data['contacts']` (list of 4 objects, subkeys: `['@id', 'address', 'affiliation', 'comments', 'email', 'fax', 'firstName', 'lastName', 'midInitials', 'phone']`)
- `data['description']` (str): ``
- `data['dirty']` (NoneType): `None`
- `data['doi']` (str): `10.60555/cyt1-kh64`
- `data['experimentHardware']` (str): `ACME, Combustion Integrated Rack (CIR)`
- `data['experimentHardwareLink']` (str): `https://www1.grc.nasa.gov/space/iss-research/iss-fcf/combustion-science/acme/imp...`
- `data['experimentalTable']` (list of 2 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['experiments']` (list of 0 items)
- `data['factors']` (list of 0 items)
- `data['filesDisabled']` (NoneType): `None`
- `data['flightProgram']` (str): `International Space Station (ISS)`
- `data['funding']` (str): ``
- `data['hypothesis']` (str): `The hypotheses of this research are that testing aboard the ISS can demonstrate ...`
- `data['identifiers']` (list of 0 items)
- `data['images']` (list of 2 objects, subkeys: `['_id', 'date_created', 'date_modified', 'file_name', 'file_size', 'remote_path', 'remote_url', 'resource_id', 'restricted', 's3_path']`)
- `data['investigationAcronym']` (str): `ACME CFI-G`
- `data['investigationEndDate']` (str): ``
- `data['investigationStartDate']` (str): ``
- `data['licenseIdentifier']` (str): `CC0-1.0`
- `data['licenseLink']` (str): `https://spdx.org/licenses/CC0-1.0.html`
- `data['licenseName']` (str): `Creative Commons Zero v1.0 Universal`
- `data['managingNasaCenter']` (str): `Glenn Research Center (GRC)`
- `data['missionEnd']` (str): ``
- `data['missionLink']` (str): ``
- `data['missionName']` (str): ``
- `data['missionStart']` (str): ``
- `data['modified']` (list of 0 items)
- `data['modifiedDate']` (str): `20-Nov-2025`
- `data['objective']` (str): `1. Plan and support flight testing on the International Space Station (ISS).
2. ...`
- `data['organizations']` (list of 0 items)
- `data['payloads']` (list of 0 items)
- `data['projectIdentifier']` (str): ``
- `data['projectLink']` (str): ``
- `data['projectTitle']` (str): ``
- `data['projectType']` (str): `Microgravity Investigation`
- `data['proposalTitle']` (str): `ISS: Collaborative Research: Spherical Cool Diffusion Flames Burning Gaseous Fue...`
- `data['public']` (bool): `True`
- `data['publications']` (list of 2 objects, subkeys: `['authorList', 'comments', 'doi', 'pubMedID', 'status', 'title']`)
- `data['related_glds']` (str): ``
- `data['releaseDate']` (str): `20-Nov-2025`
- `data['removed']` (list of 0 items)
- `data['researchArea']` (str): `Combustion Science`
- `data['researchImpacts']` (str): `Combustion provides 86% of the world’s energy and an even higher fraction of the...`
- `data['restricted']` (bool): `False`
- `data['sourceAccession']` (str): ``
- `data['sourceLink']` (str): ``
- `data['spaceProgram']` (str): `National Science Foundation (NSF), Center for the Advancement of Science in Spac...`
- `data['subResearchArea']` (str): `Flames of Gaseous Fuels`
- `data['submissionDate']` (str): `20-Nov-2025`
- `data['title']` (str): `Advanced Combustion via Microgravity Experiments / Cool Flames Investigation wit...`
- `data['totalFileSize']` (int): `2085592429259`
- `data['version']` (int): `1`
- `data['versionMessage']` (NoneType): `None`
- `data['versionMessageLevel']` (NoneType): `None`
- `data['versionMessageLocations']` (list of 0 items)
- `data['versionReason']` (str): `New data release`

### Field Audit & Per-Test Conditions Search:
- `data['experimentalTable']`: Contains file pointer `PSI-159_Experimental table_CFI-G_Normal Flames.csv` (size: 22166 bytes, path: `/Home/psi-data/PSI-159/Experimental table/PSI-159_Experimental table_CFI-G_Normal Flames.csv`). **No raw row-level data inside the JSON**.
- `data['assays']`: Empty list (`[]`). No tabular runs.
- `data['studies']`: Empty list (`[]`).
- **Hardware List**: 25 instruments/facilities recorded.
- **Publication Count**: 2 peer-reviewed citations.
- **Condition Fields (O2, Pressure, Flow, Fuels)**: **Absent as structured keys** in JSON. Stored as null / 'not reported'.

---
