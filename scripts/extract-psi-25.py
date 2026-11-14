"""
Extractor for PSI-25: BASS-II (Burning and Suppression of Solids - II)
Section 4 & 5 compliance:
- DOI: 10.60555/4qc4-de67
- Ingested authentic table: PSI-25_Experimental_table_BASS-II.csv (129 rows)
- Stratified initial-O2 envelopes per material class
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-25",
        "acronym": "BASS-II",
        "name": "Burning and Suppression of Solids - II",
        "doi": "10.60555/4qc4-de67",
        "license": "CC0-1.0",
        "verified": False,
        "depth": "deep",
        "record_type": "test_matrix",
        "safety_areas": ["prevention", "suppression"],
        "gravity_regimes": ["microgravity"],
        "data_origin": ["flight"],
        "hardware": {
            "value": "Microgravity Science Glovebox (MSG) Flow Duct",
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "NASA/TM-20210011385",
                "row_or_page": "Section 2.1, p. 12",
                "entered_by": "hand",
                "note": "ISS MSG facility flow duct apparatus"
            }
        },
        "objectives": {
            "value": "Study the ignition, flame growth, flame spread, and extinction limits for solid fuels burning in low-velocity forced flows in microgravity.",
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "raw_real/PSI-25/investigation_metadata.json",
                "row_or_page": "data['objective']",
                "entered_by": "parsed",
                "note": "Primary science objectives from NASA metadata"
            }
        },
        "fuels": {
            "value": ["PMMA rods", "PMMA films", "PMMA slabs", "SIBAL", "Nomex III", "Japan Wax candle"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv",
                "row_or_page": "Material column, 129 test rows",
                "entered_by": "parsed",
                "note": "Materials reported in BASS-II experimental table: PMMA rods, PMMA films, PMMA slabs, SIBAL, Nomex III, and Japan Wax candle"
            }
        },
        "sample_shape": {
            "value": "cylindrical rods, thin films, flat slabs, fabric strips, and candle",
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv",
                "row_or_page": "Test Description and Dimensions columns",
                "entered_by": "parsed",
                "note": "Sample geometry classification"
            }
        },
        "sample_size": {
            "value": "0.635-1.27 cm diameter rods; 1.5-2.2 cm width films and slabs; 10 cm length",
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv",
                "row_or_page": "Dimensions column",
                "entered_by": "parsed",
                "note": "Sample dimensions reported across test matrix"
            }
        },
        "cabin_o2_pct": {
            "value": {"min": 13.6, "max": 22.2},
            "unit": "%",
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv",
                "row_or_page": "125 non-suspect tests (53 PMMA rods, 22 PMMA films, 20 PMMA slabs, 26 SIBAL, 3 Nomex III, 1 candle)",
                "entered_by": "parsed",
                "note": "Overall solid initial O2 range 13.6-22.2% across 125 non-suspect test runs (sha256: db4f5fcc2416fd2150e58c2d73d761090106271a640ecd189297eb7c3cf2951f)"
            }
        },
        "burner_flow_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": {
            "value": {"min": 2.0, "max": 21.0},
            "unit": "cm/s",
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "NASA-TM-20210011385.pdf",
                "row_or_page": "Table 5.1, Page 57 (PDF Page 65)",
                "entered_by": "hand",
                "note": "Table 5.1 cm/s (2.0-21.0) applies to 20 flat-PMMA slab tests only; airflow in full experimental table reported in instrument dial units only"
            }
        },
        "varied_variables": {
            "value": ["material type", "sample geometry", "forced airflow speed (dial)", "oxygen concentration"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "raw_real/PSI-25/investigation_metadata.json",
                "row_or_page": "data['approach']",
                "entered_by": "parsed",
                "note": "Experimental varied variables"
            }
        },
        "constant_variables": {
            "value": ["ambient pressure (~1 atm)", "duct geometry"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "NASA/TM-20210011385",
                "row_or_page": "Section 5.2, p. 50",
                "entered_by": "hand",
                "note": "Experimental constants"
            }
        },
        "sensors": {
            "value": ["High-resolution video camera", "Narrow-angle radiometer", "Flame-front tracking software"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "NASA/TM-20210011385",
                "row_or_page": "Section 3.1, p. 25",
                "entered_by": "hand",
                "note": "Sensor suite"
            }
        },
        "n_tests": {
            "value": 20,
            "unit": "tests",
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "NASA-TM-20210011385.pdf",
                "row_or_page": "Table 5.1, Page 57 (PDF Page 65)",
                "entered_by": "hand",
                "note": "20 flat-PMMA tests reported in Table 5.1"
            }
        },
        "fuel_phase": {
            "value": "solid",
            "unit": None,
            "provenance": {
                "source_id": "PSI-25",
                "doi": "10.60555/4qc4-de67",
                "file": "raw_real/PSI-25/investigation_metadata.json",
                "row_or_page": "data['objective']",
                "entered_by": "parsed",
                "note": "Solid fuels burning in low-velocity forced flows in microgravity"
            }
        },
        "stratified_o2_pct": {
            "PMMA rods": {"min": 13.6, "max": 22.2, "n_tests": 53},
            "PMMA films": {"min": 15.0, "max": 22.2, "n_tests": 22},
            "PMMA slabs": {"min": 17.9, "max": 22.2, "n_tests": 20},
            "SIBAL": {"min": 16.4, "max": 20.8, "n_tests": 26},
            "Nomex III": {"min": 21.0, "max": 22.2, "n_tests": 3},
            "candle": {"min": 17.4, "max": 17.4, "n_tests": 1},
            "overall_solid": {"min": 13.6, "max": 22.2, "n_tests": 125}
        }
    }
