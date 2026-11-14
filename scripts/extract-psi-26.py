"""
Extractor for PSI-26: BASS (Burning and Suppression of Solids)
Section 4 & 5 compliance:
- DOI: 10.60555/58h4-dy80
- Hardware: Microgravity Science Glovebox (MSG) Flow Duct
- Airflow: max 40 cm/s from metadata prose; min not reported
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-26",
        "acronym": "BASS",
        "name": "Burning and Suppression of Solids",
        "doi": "10.60555/58h4-dy80",
        "license": "CC0-1.0",
        "verified": True,
        "depth": "deep",
        "record_type": "test_matrix",
        "safety_areas": ["prevention", "suppression"],
        "gravity_regimes": ["microgravity"],
        "data_origin": ["flight"],
        "hardware": {
            "value": "Microgravity Science Glovebox (MSG) Flow Duct",
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/58h4-dy80",
                "file": "raw_real/PSI-26/investigation_metadata.json",
                "row_or_page": "data['hardware']",
                "entered_by": "parsed",
                "note": "ISS MSG facility apparatus"
            }
        },
        "objectives": {
            "value": "Examine solid material flammability and extinction limits in microgravity under forced flow",
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/58h4-dy80",
                "file": "BASS_report.pdf",
                "row_or_page": "Page 1",
                "entered_by": "hand",
                "note": "Primary science objectives"
            }
        },
        "fuels": {
            "value": ["PMMA (acrylic)", "Cotton fiberglass fabric", "Nomex"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/58h4-dy80",
                "file": "raw_real/PSI-26/investigation_metadata.json",
                "row_or_page": "data['fuels']",
                "entered_by": "parsed",
                "note": "Solid fuels matrix"
            }
        },
        "sample_shape": {
            "value": "flat slabs and cylindrical rods",
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/58h4-dy80",
                "file": "raw_real/PSI-26/investigation_metadata.json",
                "row_or_page": "data['sample_shape']",
                "entered_by": "parsed",
                "note": "Sample geometry"
            }
        },
        "sample_size": None,
        "cabin_o2_pct": None,
        "burner_flow_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": {
            "value": {"min": None, "max": 40},
            "unit": "cm/s",
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/318t-7t35",
                "file": "raw_real/PSI-26/investigation_metadata.json",
                "row_or_page": "data['approach']",
                "entered_by": "parsed",
                "note": "Airflow speeds reaching as high as 40 cm/s; minimum not reported"
            }
        },
        "varied_variables": {
            "value": ["airflow speed", "fuel thickness", "ambient O2 concentration"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/58h4-dy80",
                "file": "BASS_report.pdf",
                "row_or_page": "Page 4",
                "entered_by": "hand",
                "note": "Test matrix variations"
            }
        },
        "constant_variables": {
            "value": ["chamber pressure", "convective flow direction"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/58h4-dy80",
                "file": "BASS_report.pdf",
                "row_or_page": "Page 4",
                "entered_by": "hand",
                "note": "Fixed variables"
            }
        },
        "sensors": {
            "value": ["Color video camera", "Narrow-angle radiometer", "Thermocouple array"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/58h4-dy80",
                "file": "BASS_report.pdf",
                "row_or_page": "Page 2",
                "entered_by": "hand",
                "note": "Diagnostics"
            }
        },
        "n_tests": None,
        "fuel_phase": {
            "value": "solid",
            "unit": None,
            "provenance": {
                "source_id": "PSI-26",
                "doi": "10.60555/318t-7t35",
                "file": "raw_real/PSI-26/investigation_metadata.json",
                "row_or_page": "data['title']",
                "entered_by": "parsed",
                "note": "Solid fuel combustion (Burning and Suppression of Solids)"
            }
        }
    }
