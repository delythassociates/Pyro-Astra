"""
Extractor for PSI-69: FLEX (Flame Extinction Experiment)
Section 4 & 5 compliance:
- DOI: 10.60555/mbq8-0451
- Hardware: MDCA / CIR
- Safety area: suppression
- Droplet combustion in sealed CIR chamber (quiescent airflow: 0 cm/s)
- Cabin O2: 12.0-34.0% from authentic experimental table
- Pressure: min null, max 44.86 psi (converted from 2319.9 mmHg via exact formula 1 mmHg = 14.6959488/760 psi)
- Full provenance on every stored value
"""

def extract():
    return {
        "id": "PSI-69",
        "acronym": "FLEX",
        "name": "Flame Extinction Experiment",
        "doi": "10.60555/mbq8-0451",
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
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "investigation_metadata.json",
                "row_or_page": "Row 1",
                "entered_by": "hand",
                "note": "ISS CIR facility"
            }
        },
        "objectives": {
            "value": "Measure flame extinction of isolated liquid fuel droplets under varied diluents (CO2, N2, He) and pressures to study radiative and diffusive extinction",
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "FLEX_report.pdf",
                "row_or_page": "Page 2",
                "entered_by": "hand",
                "note": "Primary science objectives"
            }
        },
        "fuels": {
            "value": ["n-Heptane", "Methanol", "Ethanol", "n-Decane"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "investigation_metadata.json",
                "row_or_page": "Table 1",
                "entered_by": "hand",
                "note": "Liquid hydrocarbon and alcohol fuels"
            }
        },
        "sample_shape": {
            "value": "spherical liquid droplet on SiC fibers",
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "FLEX_report.pdf",
                "row_or_page": "Page 5",
                "entered_by": "hand",
                "note": "Droplet geometry"
            }
        },
        "sample_size": {
            "value": "1.5 to 5.0 mm diameter",
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "FLEX_report.pdf",
                "row_or_page": "Page 5",
                "entered_by": "hand",
                "note": "Droplet diameter range"
            }
        },
        "cabin_o2_pct": {
            "value": {"min": 12.0, "max": 34.0},
            "unit": "%",
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv",
                "row_or_page": "Oxygen Index (%) column",
                "entered_by": "parsed",
                "note": "Tested cabin O2 range 12.0-34.0% reported across 271 test rows in authentic experimental table (sha256: 37c88ce8ae9391b7544ff630a45ce87543d04d317cdbfbed104fe7d5c27e1b96)"
            }
        },
        "burner_flow_o2_pct": None,
        "pressure_psi": {
            "value": {"min": None, "max": 44.86},
            "unit": "psi",
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv",
                "row_or_page": "Pressure (mmHg) column",
                "entered_by": "parsed",
                "note": "Converted from 2319.9 mmHg via exact formula 1 mmHg = 14.6959488/760 psi; 0.0 mmHg values treated as null (unpressurized/not reported)"
            }
        },
        "airflow_speed_cm_s": {
            "value": {"min": 0.0, "max": 0.0},
            "unit": "cm/s",
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "investigation_metadata.json",
                "row_or_page": "Row 4",
                "entered_by": "hand",
                "note": "Quiescent microgravity chamber (no forced flow)"
            }
        },
        "varied_variables": {
            "value": ["initial droplet diameter", "diluent species (CO2, He, N2)", "chamber pressure", "oxygen dilution mole fraction"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "FLEX_report.pdf",
                "row_or_page": "Page 7",
                "entered_by": "hand",
                "note": "Experimental variations"
            }
        },
        "constant_variables": {
            "value": ["ambient temperature (298 K)", "quiescent flow environment"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "FLEX_report.pdf",
                "row_or_page": "Page 7",
                "entered_by": "hand",
                "note": "Constants"
            }
        },
        "sensors": {
            "value": ["High-speed color camera", "UV radiometer", "Infrared radiometer", "Backlit droplet camera"],
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "FLEX_report.pdf",
                "row_or_page": "Page 10",
                "entered_by": "hand",
                "note": "Optical diagnostics"
            }
        },
        "n_tests": {
            "value": 271,
            "unit": "tests",
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv",
                "row_or_page": "Rows 1-271",
                "entered_by": "parsed",
                "note": "271 flight test runs reported in authentic experimental table"
            }
        },
        "fuel_phase": {
            "value": "liquid droplet",
            "unit": None,
            "provenance": {
                "source_id": "PSI-69",
                "doi": "10.60555/mbq8-0451",
                "file": "raw_real/PSI-69/investigation_metadata.json",
                "row_or_page": "data['objective']",
                "entered_by": "parsed",
                "note": "Droplet combustion and flame extinction in microgravity"
            }
        }
    }
