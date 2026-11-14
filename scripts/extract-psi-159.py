"""
Extractor for PSI-159: CFI-G (Cool Flames Investigation with Gases)
Section 4 & 5 compliance:
- DOI: 10.60555/cyt1-kh64
- Hardware: ACME / CIR
- Burner flow O2: up to 85% (Rule 4: NEVER cabin O2)
- Table-listed fuels: 30% butane, 30% ethane, 30% propane, 50% butane, ethane, propane
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-159",
        "acronym": "CFI-G",
        "name": "Cool Flames Investigation with Gases",
        "doi": "10.60555/cyt1-kh64",
        "license": "CC0-1.0",
        "verified": False,
        "depth": "deep",
        "record_type": "condition_range",
        "safety_areas": ["other"],
        "gravity_regimes": ["microgravity"],
        "data_origin": ["flight"],
        "hardware": {
            "value": "ACME / Combustion Integrated Rack (CIR)",
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "raw_real/PSI-159/investigation_metadata.json",
                "row_or_page": "data['hardware']",
                "entered_by": "parsed",
                "note": "ISS CIR facility"
            }
        },
        "objectives": {
            "value": "Study the flammability boundaries, low-temperature combustion kinetics, and extinction of non-premixed cool diffusion flames in microgravity under oxygen-enriched coflow",
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "CFI_G_report.pdf",
                "row_or_page": "Page 2",
                "entered_by": "hand",
                "note": "Primary science objectives"
            }
        },
        "fuels": {
            "value": [
                "30% butane",
                "30% ethane",
                "30% propane",
                "50% butane",
                "ethane",
                "propane"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (1).csv",
                "row_or_page": "Fuel column, 168 rows",
                "entered_by": "parsed",
                "note": "Fuels listed in authentic experimental table: 30% butane, 30% ethane, 30% propane, 50% butane, ethane, propane; metadata hypothesis mentions propane, butane, pentane; methane and ethylene are not table-listed"
            }
        },
        "sample_shape": {
            "value": "coflow diffusion burner flame",
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "CFI_G_report.pdf",
                "row_or_page": "Page 4",
                "entered_by": "hand",
                "note": "Flame configuration"
            }
        },
        "sample_size": None,
        "cabin_o2_pct": None,
        "burner_flow_o2_pct": {
            "value": {
                "min": None,
                "max": 85
            },
            "unit": "% (burner stream)",
            "provenance": {
                "source_id": "challenge-brief",
                "doi": "10.60555/cyt1-kh64",
                "file": "NASA Space Apps Challenge Brief: Flame in Freefall",
                "row_or_page": "Challenge Background",
                "entered_by": "hand",
                "note": "source: challenge brief"
            }
        },
        "pressure_psi": None,
        "airflow_speed_cm_s": None,
        "varied_variables": {
            "value": [
                "fuel gas species",
                "burner flow O2 concentration (21-85%)",
                "coflow velocity",
                "diluent type (N2 vs He)"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "CFI_G_report.pdf",
                "row_or_page": "Page 6",
                "entered_by": "hand",
                "note": "Varied parameters"
            }
        },
        "constant_variables": {
            "value": [
                "chamber pressure (1 atm)",
                "nozzle temperature"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "CFI_G_report.pdf",
                "row_or_page": "Page 6",
                "entered_by": "hand",
                "note": "Constants"
            }
        },
        "sensors": {
            "value": [
                "Photomultiplier Tube (PMT)",
                "Color video cameras",
                "Chamber gas chromatograph",
                "Broadband radiometer"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "CFI_G_report.pdf",
                "row_or_page": "Page 9",
                "entered_by": "hand",
                "note": "Diagnostics"
            }
        },
        "n_tests": {
            "value": 168,
            "unit": "tests",
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (1).csv",
                "row_or_page": "Rows 1-168",
                "entered_by": "parsed",
                "note": "168 test runs reported in authentic experimental table"
            }
        },
        "fuel_phase": {
            "value": "gas",
            "unit": None,
            "provenance": {
                "source_id": "PSI-159",
                "doi": "10.60555/cyt1-kh64",
                "file": "raw_real/PSI-159/investigation_metadata.json",
                "row_or_page": "data['title']",
                "entered_by": "parsed",
                "note": "Gaseous fuel burner flames (Cool Flames Investigation with Gases)"
            }
        }
    }
