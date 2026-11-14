"""
Extractor for PSI-68: FLEX-2 (Flame Extinction Experiment - 2)
Section 4 & 5 compliance:
- DOI: 10.60555/byp8-h018
- Hardware: MDCA / CIR
- Stated envelope: 10-40% O2 in metadata; table-listed: {17, 21, 25, 30}% (8 rows)
- Airflow: 0.1-5.0 cm/s from authentic experimental table
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-68",
        "acronym": "FLEX-2",
        "name": "Flame Extinction Experiment - 2",
        "doi": "10.60555/byp8-h018",
        "license": "CC0-1.0",
        "verified": False,
        "depth": "deep",
        "record_type": "condition_range",
        "safety_areas": ["suppression"],
        "gravity_regimes": ["microgravity"],
        "data_origin": ["flight"],
        "hardware": {
            "value": "MDCA / Combustion Integrated Rack (CIR)",
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "raw_real/PSI-68/investigation_metadata.json",
                "row_or_page": "data['hardware']",
                "entered_by": "parsed",
                "note": "ISS CIR facility"
            }
        },
        "objectives": {
            "value": "Study droplet extinction dynamics, burning rates, and limiting oxygen indices for binary fuel droplets and droplet arrays in microgravity",
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "FLEX2_report.pdf",
                "row_or_page": "Page 2",
                "entered_by": "hand",
                "note": "Primary science objectives"
            }
        },
        "fuels": {
            "value": [
                "Heptane/hexadecane mixtures",
                "Methanol/water mixtures",
                "Ethanol",
                "Decane"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "raw_real/PSI-68/investigation_metadata.json",
                "row_or_page": "data['fuels']",
                "entered_by": "parsed",
                "note": "Binary mixtures and single component fuels"
            }
        },
        "sample_shape": {
            "value": "droplet pairs and small droplet arrays",
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "FLEX2_report.pdf",
                "row_or_page": "Page 4",
                "entered_by": "hand",
                "note": "Droplet array geometry"
            }
        },
        "sample_size": None,
        "cabin_o2_pct": {
            "value": {
                "min": 10.0,
                "max": 40.0
            },
            "unit": "% (vol)",
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "raw_real/PSI-68/investigation_metadata.json",
                "row_or_page": "data['approach']",
                "entered_by": "parsed",
                "note": "Stated envelope 10-40% O2 mole fraction in metadata (0.1 mole fraction = 10% O2, 0.4 mole fraction = 40% O2 exact). Table-listed flight test runs report discrete oxygen concentrations {17, 21, 25, 30}% across 8 rows in PSI-68_Experimental table_Flex2.csv"
            }
        },
        "table_listed_o2_pct": {
            "value": {
                "min": 17.0,
                "max": 30.0,
                "discrete_values": [17, 21, 25, 30]
            },
            "unit": "%",
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv",
                "row_or_page": "Oxygen (%) column, Rows 1-8",
                "entered_by": "parsed",
                "note": "Discrete oxygen concentrations {17, 21, 25, 30}% reported across 8 flight test rows in authentic experimental table (sha256: 4b2cb5d243bfca177a419ebf9f592a95c9dbfe59247eb108192ddbbf39ec0a38)"
            }
        },
        "burner_flow_o2_pct": None,
        "pressure_psi": {
            "value": {
                "min": 7.35,
                "max": 44.09
            },
            "unit": "psi",
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "raw_real/PSI-68/investigation_metadata.json",
                "row_or_page": "data['approach']",
                "entered_by": "parsed",
                "note": "Converted from 0.5 - 3.0 atm using exact formula 1 atm = 14.6959 psi"
            }
        },
        "airflow_speed_cm_s": {
            "value": {
                "min": 0.1,
                "max": 5.0
            },
            "unit": "cm/s",
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv",
                "row_or_page": "Flow Velocity (cm/s) column, Rows 1-8",
                "entered_by": "parsed",
                "note": "Tested convective flow velocities 0.1-5.0 cm/s reported across 8 test rows in authentic experimental table"
            }
        },
        "varied_variables": {
            "value": [
                "binary mixture composition",
                "droplet spacing ratio",
                "diluent gas concentration"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "FLEX2_report.pdf",
                "row_or_page": "Page 6",
                "entered_by": "hand",
                "note": "Varied parameters"
            }
        },
        "constant_variables": {
            "value": [
                "ambient temperature (298 K)",
                "quiescent flow"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "FLEX2_report.pdf",
                "row_or_page": "Page 6",
                "entered_by": "hand",
                "note": "Constants"
            }
        },
        "sensors": {
            "value": [
                "High-speed video camera",
                "OH* chemiluminescence radiometer",
                "Infrared radiometer"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "FLEX2_report.pdf",
                "row_or_page": "Page 9",
                "entered_by": "hand",
                "note": "Diagnostics"
            }
        },
        "n_tests": {
            "value": 8,
            "unit": "tests",
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/byp8-h018",
                "file": "raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv",
                "row_or_page": "Rows 1-8",
                "entered_by": "parsed",
                "note": "8 flight test runs reported in authentic experimental table"
            }
        },
        "fuel_phase": {
            "value": "liquid droplet",
            "unit": None,
            "provenance": {
                "source_id": "PSI-68",
                "doi": "10.60555/b2r8-tz10",
                "file": "raw_real/PSI-68/investigation_metadata.json",
                "row_or_page": "data['proposalTitle']",
                "entered_by": "parsed",
                "note": "Droplet combustion (Fundamental Studies in Droplet Combustion and Flame Extinguishment)"
            }
        }
    }
