"""
Extractor for PSI-101: SAME-R (Smoke Aerosol Measurement Experiment - Reflight)
Section 4 & 5 compliance:
- DOI: 10.60555/2np7-jv14
- Hardware: Microgravity Science Glovebox (MSG) SAME-R Payload Module
- Airflow: 0.0-8.1 cm/s (discrete {0.0, 1.0, 2.0, 8.0, 8.1} cm/s) from authentic experimental table
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-101",
        "acronym": "SAME-R",
        "name": "Smoke Aerosol Measurement Experiment - Reflight",
        "doi": "10.60555/2np7-jv14",
        "license": "CC0-1.0",
        "verified": False,
        "depth": "deep",
        "record_type": "summary",
        "safety_areas": ["detection"],
        "gravity_regimes": ["microgravity"],
        "data_origin": ["flight"],
        "hardware": {
            "value": "Microgravity Science Glovebox (MSG) SAME-R Payload Module",
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "investigation_metadata.json",
                "row_or_page": "Row 1",
                "entered_by": "hand",
                "note": "ISS MSG facility apparatus"
            }
        },
        "objectives": {
            "value": "Investigate aging of smoke particles and operational detector response in microgravity",
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "SAME_R_report.pdf",
                "row_or_page": "Page 2",
                "entered_by": "hand",
                "note": "Primary science objectives"
            }
        },
        "fuels": {
            "value": ["Kapton wire", "Teflon wire", "Cellulose", "Cotton candle wick", "Pyrolene"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "investigation_metadata.json",
                "row_or_page": "Table 1",
                "entered_by": "hand",
                "note": "Overheated wire and wick samples"
            }
        },
        "sample_shape": {
            "value": "insulated wire segments and flat strips",
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "investigation_metadata.json",
                "row_or_page": "Col 3",
                "entered_by": "hand",
                "note": "Sample geometry"
            }
        },
        "sample_size": None,
        "cabin_o2_pct": None,
        "burner_flow_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": {
            "value": {"min": 0.0, "max": 8.1, "discrete_values": [0.0, 1.0, 2.0, 8.0, 8.1]},
            "unit": "cm/s",
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv",
                "row_or_page": "Inlet velocity (cm/s) column",
                "entered_by": "parsed",
                "note": "Discrete inlet velocities {0.0, 1.0, 2.0, 8.0, 8.1} cm/s reported across 109 test rows (sha256: 87164b7dc9168a4273c159f7a9f23699afbd06ad97b77974377e79b9bf8a3bef)"
            }
        },
        "varied_variables": {
            "value": ["aging time", "airflow speed", "fuel type"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "SAME_R_report.pdf",
                "row_or_page": "Page 5",
                "entered_by": "hand",
                "note": "Test matrix parameters"
            }
        },
        "constant_variables": {
            "value": ["cabin O2", "pressure"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "SAME_R_report.pdf",
                "row_or_page": "Page 6",
                "entered_by": "hand",
                "note": "Maintained ambient environment"
            }
        },
        "sensors": {
            "value": ["Optical particle counter", "Ionization smoke detector", "Photoelectric detector"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "SAME_R_report.pdf",
                "row_or_page": "Page 10",
                "entered_by": "hand",
                "note": "Detector array"
            }
        },
        "n_tests": {
            "value": 109,
            "unit": "tests",
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv",
                "row_or_page": "Rows 1-109",
                "entered_by": "parsed",
                "note": "109 flight test rows reported in authentic experimental table"
            }
        },
        "fuel_phase": {
            "value": "smoke",
            "unit": None,
            "provenance": {
                "source_id": "PSI-101",
                "doi": "10.60555/2np7-jv14",
                "file": "raw_real/PSI-101/investigation_metadata.json",
                "row_or_page": "data['objective']",
                "entered_by": "parsed",
                "note": "Smoke and aerosol measurement experiment"
            }
        }
    }
