"""
Extractor for PSI-99: SAFFIRE-II (Spacecraft Fire Safety Experiment - II)
Section 4 & 5 compliance:
- DOI: 10.60555/2chp-m469
- Hardware: Saffire Flow Duct in Cygnus Cargo Module
- Airflow: {20, 30} cm/s with source note; table rows report 20 cm/s (n=9 of 15)
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-99",
        "acronym": "SAFFIRE-II",
        "name": "Spacecraft Fire Safety Experiment - II",
        "doi": "10.60555/2chp-m469",
        "license": "CC0-1.0",
        "verified": False,
        "depth": "deep",
        "record_type": "mixed",
        "safety_areas": ["prevention"],
        "gravity_regimes": ["microgravity", "1g"],
        "data_origin": ["flight", "ground"],
        "hardware": {
            "value": "Saffire Flow Duct in Cygnus Cargo Module (OA-5)",
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "SAFFIRE_II_overview.pdf",
                "row_or_page": "Section 1",
                "entered_by": "hand",
                "note": "Cygnus uncrewed cargo resupply vehicle test rig"
            }
        },
        "objectives": {
            "value": "Assess the flammability of mixed materials and sample thicknesses in low-gravity and normal-gravity companion tests",
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "SAFFIRE_II_report.pdf",
                "row_or_page": "Page 3",
                "entered_by": "hand",
                "note": "Primary science objectives"
            }
        },
        "fuels": {
            "value": [
                "SIBAL fabric",
                "PMMA (acrylic)",
                "Nomex",
                "Silicone sheet"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "raw_real/PSI-99/investigation_metadata.json",
                "row_or_page": "data['fuels']",
                "entered_by": "parsed",
                "note": "Fuel samples tested"
            }
        },
        "sample_shape": {
            "value": "thin fabric cards and thick solid slabs",
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "raw_real/PSI-99/investigation_metadata.json",
                "row_or_page": "data['sample_shape']",
                "entered_by": "parsed",
                "note": "Specimen geometries"
            }
        },
        "sample_size": None,
        "cabin_o2_pct": None,
        "burner_flow_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": {
            "value": {
                "min": 20.0,
                "max": 30.0,
                "discrete_values": [20.0, 30.0]
            },
            "unit": "cm/s",
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "raw_real/PSI-99/experimental_table/PSI-99_Experimental table_SAFFIRE-2.csv",
                "row_or_page": "Air Flow Speed (cm/s) column",
                "entered_by": "parsed",
                "note": "Airflow speed of 20 cm/s reported in 9 of 15 table rows (6 rows unlisted/blank); metadata approach cites nominal test velocities of 20 and 30 cm/s"
            }
        },
        "varied_variables": {
            "value": [
                "material type",
                "thickness",
                "airflow speed",
                "gravity regime (0g vs 1g)"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "SAFFIRE_II_report.pdf",
                "row_or_page": "Page 6",
                "entered_by": "hand",
                "note": "Independent variables"
            }
        },
        "constant_variables": {
            "value": [
                "cabin oxygen mole fraction (~21%)",
                "duct cross-section"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "SAFFIRE_II_report.pdf",
                "row_or_page": "Page 6",
                "entered_by": "hand",
                "note": "Controlled variables"
            }
        },
        "sensors": {
            "value": [
                "Calibrated video cameras",
                "Thermocouple rake",
                "Flow anemometers",
                "Radiometers",
                "Pressure sensors"
            ],
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "SAFFIRE_II_report.pdf",
                "row_or_page": "Page 11",
                "entered_by": "hand",
                "note": "Diagnostics"
            }
        },
        "n_tests": {
            "value": 15,
            "unit": "tests",
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/2chp-m469",
                "file": "raw_real/PSI-99/experimental_table/PSI-99_Experimental table_SAFFIRE-2.csv",
                "row_or_page": "Rows 1-15",
                "entered_by": "parsed",
                "note": "15 test runs reported in authentic experimental table"
            }
        },
        "fuel_phase": {
            "value": "solid",
            "unit": None,
            "provenance": {
                "source_id": "PSI-99",
                "doi": "10.60555/y4z3-t452",
                "file": "raw_real/PSI-99/investigation_metadata.json",
                "row_or_page": "data['approach']",
                "entered_by": "parsed",
                "note": "Solid sample card testing (SIBAL, silicone, PMMA, Nomex)"
            }
        }
    }
