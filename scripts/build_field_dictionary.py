#!/usr/bin/env python3
"""
PYRO-ASTRA: Field Dictionary Generator
Generates comprehensive release/field_dictionary.json and mirrors to public/release/.
Documents both Investigation Schema fields and Run-Level Modeling Schema fields.
"""

import os
import json
import shutil
from datetime import datetime, timezone

RELEASE_DIR = 'release'
PUBLIC_RELEASE_DIR = os.path.join('public', 'release')

# 1. Investigation-level fields (25 fields from data/schema.ts)
INVESTIGATION_FIELDS = [
    {
        "name": "id",
        "category": "investigation",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Unique NASA Physical Sciences Informatics (PSI) investigation identifier.",
        "example": "PSI-102"
    },
    {
        "name": "acronym",
        "category": "investigation",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Short official mission or experiment acronym.",
        "example": "SAME"
    },
    {
        "name": "name",
        "category": "investigation",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Full scientific investigation title as registered in NASA PSI.",
        "example": "Smoke Aerosol Measurement Experiment"
    },
    {
        "name": "doi",
        "category": "investigation",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Digital Object Identifier assigned by NASA/OSTI for permanent citation.",
        "example": "10.60555/gd4k-8h62"
    },
    {
        "name": "license",
        "category": "investigation",
        "type": "string | null",
        "required": False,
        "unit": None,
        "description": "SPDX license identifier for the investigation dataset.",
        "example": "CC0-1.0"
    },
    {
        "name": "verified",
        "category": "investigation",
        "type": "boolean",
        "required": True,
        "unit": None,
        "description": "Indicates whether metadata and DOI have been verified against official NASA PSI records.",
        "example": True
    },
    {
        "name": "depth",
        "category": "investigation",
        "type": "'deep' | 'catalog'",
        "required": True,
        "unit": None,
        "description": "'deep' records contain multi-field physical condition extractions; 'catalog' records contain metadata and DOI references.",
        "example": "deep"
    },
    {
        "name": "record_type",
        "category": "investigation",
        "type": "'test_matrix' | 'condition_range' | 'summary' | 'telemetry' | 'mixed'",
        "required": True,
        "unit": None,
        "description": "Classification of experimental record content.",
        "example": "summary"
    },
    {
        "name": "safety_areas",
        "category": "investigation",
        "type": "string[]",
        "required": True,
        "unit": None,
        "allowed_values": ["prevention", "detection", "suppression", "other"],
        "description": "Spacecraft fire safety domains to which this investigation applies.",
        "example": ["detection"]
    },
    {
        "name": "gravity_regimes",
        "category": "investigation",
        "type": "string[]",
        "required": True,
        "unit": None,
        "allowed_values": ["microgravity", "1g", "electric-field-analog"],
        "description": "Gravitational environments tested. Partial-gravity is prohibited in PSI combustion records.",
        "example": ["microgravity", "1g"]
    },
    {
        "name": "data_origin",
        "category": "investigation",
        "type": "string[]",
        "required": True,
        "unit": None,
        "allowed_values": ["flight", "ground", "simulation"],
        "description": "Origin of experimental data.",
        "example": ["flight", "ground"]
    },
    {
        "name": "hardware",
        "category": "investigation",
        "type": "Val<string>",
        "required": False,
        "unit": None,
        "description": "Experimental facility or apparatus used on ISS or aircraft.",
        "example": "Microgravity Science Glovebox (MSG) Smoke Chamber"
    },
    {
        "name": "objectives",
        "category": "investigation",
        "type": "Val<string>",
        "required": False,
        "unit": None,
        "description": "Primary scientific and engineering goals.",
        "example": "Measure smoke particle size distribution..."
    },
    {
        "name": "fuels",
        "category": "investigation",
        "type": "Val<string[]>",
        "required": False,
        "unit": None,
        "description": "List of combustible materials or gaseous fuels evaluated.",
        "example": ["Kapton", "Teflon", "Silicone"]
    },
    {
        "name": "sample_shape",
        "category": "investigation",
        "type": "Val<string>",
        "required": False,
        "unit": None,
        "description": "Geometric configuration of fuel samples (e.g. flat strips, rods, droplets, wicks).",
        "example": "wire insulation, flat strips, and cylindrical wicks"
    },
    {
        "name": "sample_size",
        "category": "investigation",
        "type": "Val<string>",
        "required": False,
        "unit": None,
        "description": "Physical dimensions of the fuel samples.",
        "example": "5 cm x 29 cm"
    },
    {
        "name": "cabin_o2_pct",
        "category": "investigation",
        "type": "Val<{min: number | null, max: number}>",
        "required": False,
        "unit": "%",
        "description": "Ambient crew cabin oxygen volume percentage tested. Must NOT be confused with burner flow oxygen.",
        "example": {"min": 16.8, "max": 22.2}
    },
    {
        "name": "burner_flow_o2_pct",
        "category": "investigation",
        "type": "Val<{min: number | null, max: number}>",
        "required": False,
        "unit": "%",
        "description": "Oxygen percentage in gas burner feed line (e.g. ACME CFI-G up to 85%). Strictly isolated from cabin O2.",
        "example": {"min": None, "max": 85.0}
    },
    {
        "name": "pressure_psi",
        "category": "investigation",
        "type": "Val<{min: number | null, max: number}>",
        "required": False,
        "unit": "psi",
        "description": "Ambient environmental chamber pressure. Converted with exact formula (1 psi = 6.894757 kPa; 1 atm = 14.6959 psi).",
        "example": {"min": 7.35, "max": 22.04}
    },
    {
        "name": "airflow_speed_cm_s",
        "category": "investigation",
        "type": "Val<{min: number | null, max: number}>",
        "required": False,
        "unit": "cm/s",
        "description": "Forced convective airflow velocity along the sample.",
        "example": {"min": 2.0, "max": 21.0}
    },
    {
        "name": "varied_variables",
        "category": "investigation",
        "type": "Val<string[]>",
        "required": False,
        "unit": None,
        "description": "Parameters systematically varied in the experimental test matrix.",
        "example": ["airflow speed", "fuel thickness", "ambient O2"]
    },
    {
        "name": "constant_variables",
        "category": "investigation",
        "type": "Val<string[]>",
        "required": False,
        "unit": None,
        "description": "Parameters held constant across test series.",
        "example": ["cabin pressure", "ambient temperature"]
    },
    {
        "name": "sensors",
        "category": "investigation",
        "type": "Val<string[]>",
        "required": False,
        "unit": None,
        "description": "Diagnostic instruments, sensors, cameras, and radiometers deployed.",
        "example": ["Color video camera", "Narrow-angle radiometer"]
    },
    {
        "name": "n_tests",
        "category": "investigation",
        "type": "Val<number>",
        "required": False,
        "unit": "tests",
        "description": "Count of documented flight or ground test runs.",
        "example": 20
    },
    {
        "name": "not_reported",
        "category": "investigation",
        "type": "string[]",
        "required": True,
        "unit": None,
        "description": "Automated ledger of core physical fields where NASA PSI did not state a value (Rule 1).",
        "example": ["burner_flow_o2_pct", "sample_size"]
    }
]

# 2. Run-level modeling fields (44 columns in release/modeling_ready_runs.csv/.json)
MODELING_RUN_FIELDS = [
    {
        "name": "run_id",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Globally unique identifier for each experimental run across all NASA PSI datasets.",
        "example": "PSI-25_B1"
    },
    {
        "name": "investigation_id",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Parent NASA Physical Sciences Informatics investigation identifier.",
        "example": "PSI-25"
    },
    {
        "name": "investigation_acronym",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Official experiment acronym.",
        "example": "BASS-II"
    },
    {
        "name": "source_table",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Source experimental CSV table filename or report table identifier.",
        "example": "PSI-25_Experimental_table_BASS-II.csv"
    },
    {
        "name": "test_id",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Original test or sample number from primary NASA table.",
        "example": "B1"
    },
    {
        "name": "date",
        "category": "modeling_run",
        "type": "string | null",
        "required": False,
        "unit": None,
        "description": "Date or GMT day of test execution aboard ISS or flight platform.",
        "example": "2/19/2014"
    },
    {
        "name": "gravity_regime",
        "category": "modeling_run",
        "type": "'microgravity' | '1g' | 'electric-field-analog'",
        "required": True,
        "unit": None,
        "description": "Gravitational environment. Microgravity for flight runs; 1g for companion ground tests; electric-field-analog for PSI-22. Partial-gravity is strictly prohibited.",
        "example": "microgravity"
    },
    {
        "name": "is_suspect",
        "category": "modeling_run",
        "type": "boolean",
        "required": True,
        "unit": None,
        "description": "Quality flag indicating suspect or anomalous test data (e.g. final O2 > initial O2 or negative airflow).",
        "example": False
    },
    {
        "name": "suspect_reason",
        "category": "modeling_run",
        "type": "string | null",
        "required": False,
        "unit": None,
        "description": "Scientific justification for suspect flag.",
        "example": "Calibrated final O2 exceeds initial O2"
    },
    {
        "name": "group_condition",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Grouping key for leave-one-condition-out grouped cross-validation in machine learning pipelines.",
        "example": "PSI-25_PMMA film"
    },
    {
        "name": "fuel_raw",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Verbatim fuel or combustible material string from authentic NASA table.",
        "example": "100 micron PMMA film 2 cm wide"
    },
    {
        "name": "material_class",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Normalized physical material classification.",
        "example": "PMMA film"
    },
    {
        "name": "fuel_phase",
        "category": "modeling_run",
        "type": "'solid' | 'liquid droplet' | 'gas' | 'smoke'",
        "required": True,
        "unit": None,
        "description": "Physical phase of the combustible fuel. Enforces fuel-phase partition protocol.",
        "example": "solid"
    },
    {
        "name": "cabin_o2_pct",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "%",
        "description": "Ambient crew cabin or chamber oxygen concentration (% vol). Converted from mole fraction (1.0 mole frac = 100%). Strictly null for burner oxidizer feeds.",
        "example": 22.2
    },
    {
        "name": "burner_flow_o2_pct",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "%",
        "description": "Burner oxidizer feed oxygen concentration (% vol). Populated for CFI-G and Flame Design; strictly null for cabin life support atmospheres.",
        "example": 39.39
    },
    {
        "name": "pressure_psi",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "psi",
        "description": "Ambient environmental chamber pressure converted to psi using exact formula (1 mmHg = 14.6959488/760 psi, 1 bar = 100000/6894.757 psi, 1 atm = 14.69595 psi).",
        "example": 14.65147
    },
    {
        "name": "pressure_raw_value",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": None,
        "description": "Original raw numeric pressure value from source table before unit conversion.",
        "example": 757.7
    },
    {
        "name": "pressure_raw_unit",
        "category": "modeling_run",
        "type": "string | null",
        "required": False,
        "unit": None,
        "description": "Original physical pressure unit stated in source table header ('mmHg', 'bar', 'atm', or null).",
        "example": "mmHg"
    },
    {
        "name": "airflow_speed_cm_s",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "cm/s",
        "description": "Forced convective airflow velocity along the sample in cm/s. Null when only instrument dial values are reported.",
        "example": 9.0
    },
    {
        "name": "temperature_c",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "°C",
        "description": "Chamber ambient temperature in degrees Celsius.",
        "example": 25.0
    },
    {
        "name": "sample_shape",
        "category": "modeling_run",
        "type": "string | null",
        "required": False,
        "unit": None,
        "description": "Specimen geometrical form factor ('flat slab', 'film', 'rod', 'droplet', 'burner nozzle', etc.).",
        "example": "flat slab"
    },
    {
        "name": "sample_thickness_mm",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "mm",
        "description": "Solid fuel sample thickness in millimeters.",
        "example": 1.0
    },
    {
        "name": "sample_width_cm",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "cm",
        "description": "Sample width in centimeters.",
        "example": 2.2
    },
    {
        "name": "sample_length_cm",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "cm",
        "description": "Sample length in centimeters.",
        "example": 10.0
    },
    {
        "name": "initial_diameter_mm",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "mm",
        "description": "Initial droplet, burner nozzle, or rod diameter in millimeters.",
        "example": 1.69
    },
    {
        "name": "flame_spread_rate_mm_s",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "mm/s",
        "description": "Measured solid flame spread rate in mm/s (reported in BASS-II Table 5.1).",
        "example": 0.071
    },
    {
        "name": "burn_duration_s",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "s",
        "description": "Total burn duration or observation period in seconds.",
        "example": 4.3
    },
    {
        "name": "extinction_diameter_mm",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "mm",
        "description": "Droplet diameter at visible flame extinction in mm (FLEX).",
        "example": 0.89
    },
    {
        "name": "burning_rate_mm2_s",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "mm²/s",
        "description": "Droplet burning rate constant (d²-law slope) in mm²/s.",
        "example": 0.42
    },
    {
        "name": "weight_loss_rate_mg_min",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "mg/min",
        "description": "Fuel pyrolysis weight loss rate in mg/min (SAME).",
        "example": 2.0
    },
    {
        "name": "smoke_inlet_velocity_cm_s",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "cm/s",
        "description": "Inlet flow velocity in smoke aerosol chamber in cm/s (SAME-R).",
        "example": 8.1
    },
    {
        "name": "particle_aging_time_s",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "s",
        "description": "Smoke particle residence and agglomeration aging duration in seconds (SAME/SAME-R).",
        "example": 38.0
    },
    {
        "name": "calibrated_initial_o2_pct",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "%",
        "description": "Calibrated initial oxygen concentration before ignition in % vol (BASS-II).",
        "example": 22.2
    },
    {
        "name": "calibrated_final_o2_pct",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "%",
        "description": "Calibrated final oxygen concentration post-burn in % vol (BASS-II).",
        "example": 21.9
    },
    {
        "name": "initial_co2_pct",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "%",
        "description": "Initial CO2 concentration in % vol (BASS-II).",
        "example": 0.44
    },
    {
        "name": "final_co2_pct",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "%",
        "description": "Final post-combustion CO2 concentration in % vol (BASS-II).",
        "example": 0.44
    },
    {
        "name": "initial_co_ppm",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "ppm",
        "description": "Initial carbon monoxide concentration in ppm (BASS-II).",
        "example": 0.0
    },
    {
        "name": "final_co_ppm",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "ppm",
        "description": "Final post-combustion carbon monoxide concentration in ppm (BASS-II).",
        "example": 6.0
    },
    {
        "name": "adiabatic_flame_temp_k",
        "category": "modeling_run",
        "type": "number | null",
        "required": False,
        "unit": "K",
        "description": "Theoretical adiabatic flame temperature Tad in Kelvin (CFI-G / Flame Design).",
        "example": 2719.32
    },
    {
        "name": "provenance_file",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Relative repository path to authentic NASA source CSV file or technical report.",
        "example": "raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv"
    },
    {
        "name": "provenance_file_sha256",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "SHA-256 SHA-256 hash of the authentic source file for tamper-evident data integrity.",
        "example": "37c88ce8ae9391b7544ff630a45ce87543d04d317cdbfbed104fe7d5c27e1b96"
    },
    {
        "name": "provenance_row_id",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Authentic row identifier or test number in the source table.",
        "example": "1"
    },
    {
        "name": "provenance_column",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Primary source column header from authentic table.",
        "example": "FLEX Test #"
    },
    {
        "name": "provenance_note",
        "category": "modeling_run",
        "type": "string",
        "required": True,
        "unit": None,
        "description": "Exact unit conversion mathematical formula or grounding provenance citation.",
        "example": "Exact pressure conversion: 1 mmHg = 14.6959487755134 / 760 psi = 0.0193367747 psi"
    }
]

def generate_field_dictionary():
    # Combined fields array for backward compatibility
    combined_fields = INVESTIGATION_FIELDS + MODELING_RUN_FIELDS

    doc = {
        "_schema_version": "2.0.0",
        "_description": "PYRO-ASTRA Comprehensive Schema Data Dictionary (Investigation Schema & Modeling-Ready Runs)",
        "_updated_at": datetime.now(timezone.utc).isoformat(),
        "_license_statement": "There are no restrictions on the use of this data. (Registry of Open Data on AWS, https://registry.opendata.aws/nasa-psi/)",
        "_rules_governance": {
            "G1_strict_nulls": "Never invent, estimate, round up or interpolate a value. If PSI does not state it, store null and show 'not reported'.",
            "G1_row_provenance": "Every single row carries authentic {file, sha256, row id, column, unit_conversion_note}.",
            "G1_exact_unit_conversions": "Unit conversions are allowed only with an exact formula (e.g. 1 mmHg = 14.6959488/760 psi, 1 bar = 14.50377 psi, 1 atm = 14.6959 psi).",
            "G1_oxygen_isolation": "Oxygen in burner oxidizer flow (e.g. CFI-G, Flame Design) is NOT cabin oxygen. Separate fields and separate labels everywhere.",
            "G1_zero_partial_gravity": "PSI has zero partial-gravity data. Never show a partial-gravity prediction. ACME E-FIELD Flames is electric-field-analog only."
        },
        "fields": combined_fields,
        "investigation_fields": INVESTIGATION_FIELDS,
        "modeling_run_fields": MODELING_RUN_FIELDS,
        "provenance_structure": {
            "investigation_level": {
                "source_id": "NASA PSI investigation identifier (e.g. 'PSI-102')",
                "doi": "Official Digital Object Identifier or null",
                "file": "Source file name inside raw_real or official report name",
                "row_or_page": "Exact table row, JSON key path, or report page number",
                "entered_by": "Parsing method: 'parsed' (deterministic JSON extractor) or 'hand' (human-verified report table)",
                "note": "Exact unit conversion formula or grounding note"
            },
            "run_level_row_provenance": {
                "file": "Relative repository path to authentic source file",
                "sha256": "64-character SHA-256 SHA-256 digest of source file",
                "row_id": "Exact test ID or sample number from primary NASA table",
                "column": "Primary column header from authentic table",
                "unit_conversion_note": "Exact mathematical conversion formula or physical grounding note"
            }
        }
    }

    out_file = os.path.join(RELEASE_DIR, 'field_dictionary.json')
    pub_file = os.path.join(PUBLIC_RELEASE_DIR, 'field_dictionary.json')

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(doc, f, indent=2)
    with open(pub_file, 'w', encoding='utf-8') as f:
        json.dump(doc, f, indent=2)

    print(f"Generated {out_file} and {pub_file} ({len(combined_fields)} total fields documented: {len(INVESTIGATION_FIELDS)} investigation fields + {len(MODELING_RUN_FIELDS)} modeling run fields).")

if __name__ == '__main__':
    generate_field_dictionary()
