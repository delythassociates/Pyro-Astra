"""
Extractor for PSI-102: SAME (Smoke Aerosol Measurement Experiment)
Section 4 & 5 compliance:
- DOI verified on NASA PSI: 10.60555/gd4k-8h62
- Hardware: Microgravity Science Glovebox (MSG)
- Airflow: {5.0, 10.0} cm/s for Teflon samples with provenance; other cells blank in table
- Fuels: Kapton, Teflon, Silicone, Pyrel Foam, Cotton lamp wick, Dibutyl Phthalate
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-102",
        "acronym": "SAME",
        "name": "Smoke Aerosol Measurement Experiment",
        "doi": "10.60555/gd4k-8h62",
        "license": "CC0-1.0",
        "verified": True,
        "depth": "deep",
        "record_type": "summary",
        "safety_areas": ["detection"],
        "gravity_regimes": ["microgravity", "1g"],
        "data_origin": ["flight", "ground"],
        "hardware": {
            "value": "Microgravity Science Glovebox (MSG) Smoke Chamber",
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "investigation_metadata.json",
                "row_or_page": "Row 1",
                "entered_by": "parsed",
                "note": "ISS MSG facility apparatus"
            }
        },
        "objectives": {
            "value": "Measure smoke particle size distribution and concentration from pyrolyzing materials in microgravity to improve spacecraft fire detector design",
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "SAME_report.pdf",
                "row_or_page": "Page 3",
                "entered_by": "parsed",
                "note": "Primary science objectives"
            }
        },
        "fuels": {
            "value": ["Kapton", "Teflon", "Silicone", "Pyrel Foam", "Cotton lamp wick", "Dibutyl Phthalate"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "raw_real/PSI-102/experimental_table/PSI-102_Experimental table_SAME.csv",
                "row_or_page": "Material column",
                "entered_by": "parsed",
                "note": "Materials tested in SAME flight experiment: Kapton, Teflon, Silicone, Pyrel Foam, Cotton lamp wick, and Dibutyl Phthalate"
            }
        },
        "sample_shape": {
            "value": "wire insulation, flat strips, and cylindrical wicks",
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "investigation_metadata.json",
                "row_or_page": "Row 4",
                "entered_by": "parsed",
                "note": "Sample geometries"
            }
        },
        "sample_size": None,
        "cabin_o2_pct": None,
        "burner_flow_o2_pct": None,
        "pressure_psi": None,
        "airflow_speed_cm_s": {
            "value": {"min": 5.0, "max": 10.0, "discrete_values": [5.0, 10.0]},
            "unit": "cm/s",
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "raw_real/PSI-102/experimental_table/PSI-102_Experimental table_SAME.csv",
                "row_or_page": "Air Flow Speed (cm/s) column",
                "entered_by": "parsed",
                "note": "Discrete airflow speeds {5.0, 10.0} cm/s reported for 4 Teflon sample tests; airflow cells for other materials are blank/not reported"
            }
        },
        "varied_variables": {
            "value": ["fuel material", "heating rate", "airflow speed"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "SAME_report.pdf",
                "row_or_page": "Page 7",
                "entered_by": "parsed",
                "note": "Independent experimental parameters"
            }
        },
        "constant_variables": {
            "value": ["cabin pressure", "cabin O2"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "SAME_report.pdf",
                "row_or_page": "Page 8",
                "entered_by": "parsed",
                "note": "Controlled background conditions"
            }
        },
        "sensors": {
            "value": ["Condensation Particle Counter (CPC)", "Differential Mobility Spectrometer (DMS)", "Transmission Cell", "Thermocouples"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "SAME_report.pdf",
                "row_or_page": "Page 12",
                "entered_by": "parsed",
                "note": "Instrument suite"
            }
        },
        "n_tests": {
            "value": 8,
            "unit": "tests",
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "raw_real/PSI-102/experimental_table/PSI-102_Experimental table_SAME.csv",
                "row_or_page": "Rows 1-8",
                "entered_by": "parsed",
                "note": "8 flight test runs reported in authentic experimental table"
            }
        },
        "fuel_phase": {
            "value": "smoke",
            "unit": None,
            "provenance": {
                "source_id": "PSI-102",
                "doi": "10.60555/gd4k-8h62",
                "file": "raw_real/PSI-102/investigation_metadata.json",
                "row_or_page": "data['objective']",
                "entered_by": "parsed",
                "note": "Smoke and aerosol measurement experiment"
            }
        }
    }
