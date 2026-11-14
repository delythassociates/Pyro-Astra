#!/usr/bin/env python3
import json
import os

maps = {
    "PSI-98": {
        "psi_id": "PSI-98",
        "investigation_title": "SAFFIRE-I",
        "source_file": "raw_real/PSI-98/experimental_table/PSI-98_Experimental table_SAFFIRE-1.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Sample Number": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Sample run identifier",
                "unit": None,
                "reason": "Unambiguously identifies test sample run"
            },
            "Material": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel material identity",
                "unit": None,
                "reason": "Unambiguously names fuel sample material"
            },
            "Sample Thickness (cm)": {
                "mapped": True,
                "canonical_field": "sample_thickness_cm",
                "quantity": "Sample thickness",
                "unit": "cm",
                "reason": "Unambiguously names sample thickness and centimeter unit"
            },
            "Sample Length (cm)": {
                "mapped": True,
                "canonical_field": "sample_length_cm",
                "quantity": "Sample length",
                "unit": "cm",
                "reason": "Unambiguously names sample length and centimeter unit"
            },
            "Sample Width (cm)": {
                "mapped": True,
                "canonical_field": "sample_width_cm",
                "quantity": "Sample width",
                "unit": "cm",
                "reason": "Unambiguously names sample width and centimeter unit"
            },
            "Air Flow (cm/s)": {
                "mapped": True,
                "canonical_field": "airflow_speed_cm_s",
                "quantity": "Air flow velocity",
                "unit": "cm/s",
                "reason": "Unambiguously names air flow velocity and cm/s unit"
            },
            "Percent O2": {
                "mapped": True,
                "canonical_field": "o2_initial_pct",
                "quantity": "Oxygen concentration",
                "unit": "percent",
                "reason": "Unambiguously names oxygen quantity and percent unit"
            },
            "Ignition Power (W)": {
                "mapped": True,
                "canonical_field": "ignition_power_w",
                "quantity": "Ignition power",
                "unit": "W",
                "reason": "Unambiguously names ignition power and Watt unit"
            },
            "Ignition Time (s)": {
                "mapped": True,
                "canonical_field": "ignition_time_s",
                "quantity": "Ignition duration",
                "unit": "s",
                "reason": "Unambiguously names ignition duration and second unit"
            },
            "Burn Time (s)": {
                "mapped": True,
                "canonical_field": "burn_time_s",
                "quantity": "Burn duration",
                "unit": "s",
                "reason": "Unambiguously names burn duration and second unit"
            },
            "Flow Direction": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Flow orientation",
                "unit": None,
                "reason": "Qualitative orientation descriptor ('Concurrent', 'Opposed'); no measurement unit"
            },
            "Camera 1": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Camera 1 identifier",
                "unit": None,
                "reason": "Instrument camera identifier without physical measurement unit"
            },
            "Camera 2": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Camera 2 identifier",
                "unit": None,
                "reason": "Instrument camera identifier without physical measurement unit"
            }
        },
        "material_map": {
            "SIBAL Fabric": "SIBAL",
            "Pre-test flow visulation data for sample 1": "unmapped"
        }
    },
    "PSI-100": {
        "psi_id": "PSI-100",
        "investigation_title": "SAFFIRE-III",
        "source_file": "raw_real/PSI-100/experimental_table/PSI-100_Experimental table_SAFFIRE-3.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Sample Number": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Sample run identifier",
                "unit": None,
                "reason": "Unambiguously identifies test sample run"
            },
            "Material": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel material identity",
                "unit": None,
                "reason": "Unambiguously names fuel sample material"
            },
            "Sample Thickness": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Sample thickness",
                "unit": None,
                "reason": "Header lacks unit specification in column title"
            },
            "Sample Length": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Sample length",
                "unit": None,
                "reason": "Header lacks unit specification in column title"
            },
            "Sample Width": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Sample width",
                "unit": None,
                "reason": "Header lacks unit specification in column title"
            },
            "Air Flow": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Air flow velocity",
                "unit": None,
                "reason": "Header lacks unit specification in column title ('Air Flow ' contains no unit; cell contains '30 cm/s')"
            },
            "Direction": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Flow orientation",
                "unit": None,
                "reason": "Qualitative orientation descriptor ('Concurrent ', 'Opposed'); no measurement unit"
            },
            "Camera 1": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Camera 1 identifier",
                "unit": None,
                "reason": "Instrument camera identifier without physical measurement unit"
            },
            "Camera 2": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Camera 2 identifier",
                "unit": None,
                "reason": "Instrument camera identifier without physical measurement unit"
            }
        },
        "material_map": {
            "SIBAL Fabric": "SIBAL"
        }
    },
    "PSI-39": {
        "psi_id": "PSI-39",
        "investigation_title": "CFI",
        "source_file": "raw_real/PSI-39/experimental_table/PSI-39_Experimental table_CFI.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Flex Number": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Test identifier",
                "unit": None,
                "reason": "Unambiguously identifies individual test run"
            },
            "Test Date": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar date",
                "unit": None,
                "reason": "Calendar date string without physical measurement unit"
            },
            "Local Time": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Time stamp",
                "unit": None,
                "reason": "Time string without physical measurement unit"
            },
            "CIR": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Chamber run code",
                "unit": None,
                "reason": "Instrument run identifier code without physical measurement unit"
            },
            "Pressure": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Chamber pressure",
                "unit": None,
                "reason": "Header lacks unit specification in column title (cells contain string '1 atm')"
            },
            "Oxygen": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Oxygen mole fraction",
                "unit": None,
                "reason": "Header lacks unit specification in column title (dimensionless mole fraction implied by cell values '0.21')"
            },
            "Nitrogen": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Nitrogen mole fraction",
                "unit": None,
                "reason": "Secondary inert gas component; lacks unit specification in header"
            },
            "Helium": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Helium mole fraction",
                "unit": None,
                "reason": "Secondary inert gas component; lacks unit specification in header"
            },
            "Fiber": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Tether fiber presence",
                "unit": None,
                "reason": "Binary observation flag ('Yes', 'No'); no physical measurement unit"
            },
            "Fuel": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel identity",
                "unit": None,
                "reason": "Unambiguously names fuel substance"
            }
        },
        "material_map": {
            "C12H26": "n-Dodecane",
            "C7H16": "n-Heptane"
        }
    },
    "PSI-10": {
        "psi_id": "PSI-10",
        "investigation_title": "Flame Design",
        "source_file": "raw_real/PSI-10/experimental_table/PSI-10_Experimental table_Flame Design_Normal Flame (1).csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Flame Type": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Flame geometry category",
                "unit": None,
                "reason": "Qualitative flame category ('Normal', 'Inverse'); no physical measurement unit"
            },
            "Day": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Test day",
                "unit": None,
                "reason": "Day sequence number without physical measurement unit"
            },
            "Fuel": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel identity",
                "unit": None,
                "reason": "Unambiguously names fuel gas substance"
            },
            "Test": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Test identifier",
                "unit": None,
                "reason": "Unambiguously identifies individual test run"
            },
            "Xfuel": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Fuel mole fraction",
                "unit": None,
                "reason": "Header lacks explicit unit specification in column title"
            },
            "mfuel (mg/s)": {
                "mapped": True,
                "canonical_field": "fuel_mass_flow_mg_s",
                "quantity": "Fuel mass flow rate",
                "unit": "mg/s",
                "reason": "Unambiguously names fuel mass flow rate and mg/s unit"
            },
            "mN2 (mg/s)": {
                "mapped": True,
                "canonical_field": "nitrogen_mass_flow_mg_s",
                "quantity": "Nitrogen mass flow rate",
                "unit": "mg/s",
                "reason": "Unambiguously names nitrogen mass flow rate and mg/s unit"
            },
            "mtot (mg/s)": {
                "mapped": True,
                "canonical_field": "total_mass_flow_mg_s",
                "quantity": "Total reactant mass flow rate",
                "unit": "mg/s",
                "reason": "Unambiguously names total reactant mass flow rate and mg/s unit"
            },
            "XO2 (init)": {
                "mapped": True,
                "canonical_field": "o2_initial_mole_fraction",
                "quantity": "Initial oxygen mole fraction",
                "unit": "mole fraction",
                "reason": "Names initial oxygen mole fraction (standard notation X denotes mole fraction)"
            },
            "XO2 (final)": {
                "mapped": True,
                "canonical_field": "o2_final_mole_fraction",
                "quantity": "Final oxygen mole fraction",
                "unit": "mole fraction",
                "reason": "Names final oxygen mole fraction (standard notation X denotes mole fraction)"
            },
            "pinit (atm)": {
                "mapped": True,
                "canonical_field": "pressure_initial_atm",
                "quantity": "Initial chamber pressure",
                "unit": "atm",
                "reason": "Unambiguously names initial pressure and atmosphere unit"
            },
            "pfinal (atm)": {
                "mapped": True,
                "canonical_field": "pressure_final_atm",
                "quantity": "Final chamber pressure",
                "unit": "atm",
                "reason": "Unambiguously names final pressure and atmosphere unit"
            },
            "pmean (atm)": {
                "mapped": True,
                "canonical_field": "pressure_atm",
                "quantity": "Mean chamber pressure",
                "unit": "atm",
                "reason": "Unambiguously names mean chamber pressure and atmosphere unit (convertible to psi via 1 atm = 14.6959 psi)"
            },
            "mean Zst": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Stoichiometric mixture fraction",
                "unit": None,
                "reason": "Dimensionless stoichiometric mixture fraction; lacks unit specification in header"
            },
            "Tad (K)": {
                "mapped": True,
                "canonical_field": "adiabatic_temperature_k",
                "quantity": "Adiabatic flame temperature",
                "unit": "K",
                "reason": "Unambiguously names adiabatic flame temperature and Kelvin unit"
            }
        },
        "material_map": {
            "C2H4": "Ethylene"
        }
    },
    "PSI-22": {
        "psi_id": "PSI-22",
        "investigation_title": "ACME E-FIELD Flames",
        "source_file": "raw_real/PSI-22/experimental_table/PSI-22_Experimental table_ACME E-FIELD Flames.csv",
        "gravity_regime": "electric-field-analog",
        "note": "MANDATORY: E-FIELD Flames uses an electric field to mimic buoyant convection. Stored strictly under gravity_regime 'electric-field-analog' as an analogue, NEVER as partial gravity per Rule 5.",
        "column_mappings": {
            "Test Type": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Test configuration description",
                "unit": None,
                "reason": "Qualitative test configuration description without physical measurement unit"
            },
            "Test Day": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Test day identifier",
                "unit": None,
                "reason": "Unambiguously identifies test run day (YYDDD format)"
            },
            "Year": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar year",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Month": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar month",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Date": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar day",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Mesh Polarity": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Electrode mesh polarity",
                "unit": None,
                "reason": "Qualitative electrode polarity ('positive', 'negative'); no physical measurement unit"
            },
            "Fuel Bottle": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel identity",
                "unit": None,
                "reason": "Unambiguously names fuel gas mixture"
            },
            "Fuel Conc": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Fuel concentration",
                "unit": None,
                "reason": "Header lacks unit specification in column title ('Fuel Conc' has no unit; cell has '100%')"
            },
            "Flames Ignited": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Ignited flame count",
                "unit": None,
                "reason": "Integer count of test ignitions without physical measurement unit"
            },
            "Notes": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Operator notes",
                "unit": None,
                "reason": "Free-text documentation notes without physical measurement unit"
            }
        },
        "material_map": {
            "100% CH4": "Methane",
            "100% C2H4": "Ethylene"
        }
    },
    "PSI-23": {
        "psi_id": "PSI-23",
        "investigation_title": "ACME s-Flame",
        "source_file": "raw_real/PSI-23/experimental_table/PSI-23_Experimental table_ACME s-Flame.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Test Type": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Test type description",
                "unit": None,
                "reason": "Qualitative test configuration description without physical measurement unit"
            },
            "Test Day*": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Test day identifier",
                "unit": None,
                "reason": "Unambiguously identifies test run day (YYDDD format)"
            },
            "Year": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar year",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Month": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar month",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Date": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar day",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Atmosphere*": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Atmosphere description",
                "unit": None,
                "reason": "Qualitative atmosphere description ('~21% O2 with N2'); no physical measurement unit in header"
            },
            "Fuel Bottle": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel identity",
                "unit": None,
                "reason": "Unambiguously names fuel bottle mixture"
            },
            "Flames Ignited*": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Ignited flame count",
                "unit": None,
                "reason": "Integer count of test ignitions without physical measurement unit"
            },
            "Notes": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Operator notes",
                "unit": None,
                "reason": "Free-text documentation notes without physical measurement unit"
            }
        },
        "material_map": {
            "50% C2H4 with N2": "Ethylene mixture",
            "50% C2H4 with N3": "Ethylene mixture",
            "45% CH4 with N2": "Methane mixture"
        }
    },
    "PSI-20": {
        "psi_id": "PSI-20",
        "investigation_title": "ACME BRE",
        "source_file": "raw_real/PSI-20/experimental_table/PSI-20_Experimental table_ACME BRE.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Year": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar year",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Month": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar month",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Date": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar day",
                "unit": None,
                "reason": "Date field without physical measurement unit"
            },
            "Burner Size (mm)": {
                "mapped": True,
                "canonical_field": "burner_diameter_mm",
                "quantity": "Burner diameter",
                "unit": "mm",
                "reason": "Unambiguously names burner size and millimeter unit"
            },
            "Fuel Bottle": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel bottle identity",
                "unit": None,
                "reason": "Unambiguously names fuel bottle mixture"
            },
            "Oxygen Conc (percent)": {
                "mapped": True,
                "canonical_field": "o2_initial_pct",
                "quantity": "Oxygen concentration",
                "unit": "percent",
                "reason": "Unambiguously names oxygen concentration and percent unit"
            },
            "Flames Ignited": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Ignited flame count",
                "unit": None,
                "reason": "Integer count of test ignitions without physical measurement unit"
            },
            "Notes": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Operator notes",
                "unit": None,
                "reason": "Free-text documentation notes without physical measurement unit"
            }
        },
        "material_map": {
            "100% C2H4": "Ethylene",
            "50% C2H4": "Ethylene mixture"
        }
    },
    "PSI-107": {
        "psi_id": "PSI-107",
        "investigation_title": "Spice",
        "source_file": "raw_real/PSI-107/experimental_table/PSI-107_Experimental table_Spice.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "GMT date": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "GMT day of year",
                "unit": None,
                "reason": "Day of year counter without physical measurement unit"
            },
            "GMT ignition": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Ignition timestamp",
                "unit": None,
                "reason": "Time string without physical measurement unit"
            },
            "GMT Flame Off": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Extinction timestamp",
                "unit": None,
                "reason": "Time string without physical measurement unit"
            },
            "Fuel": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel identity",
                "unit": None,
                "reason": "Unambiguously names fuel substance"
            },
            "Nozzle (mm)": {
                "mapped": True,
                "canonical_field": "nozzle_diameter_mm",
                "quantity": "Burner nozzle diameter",
                "unit": "mm",
                "reason": "Unambiguously names nozzle diameter and millimeter unit"
            },
            "Fuel Rate (sccm)": {
                "mapped": True,
                "canonical_field": "fuel_flow_sccm",
                "quantity": "Fuel volumetric flow rate",
                "unit": "sccm",
                "reason": "Unambiguously names fuel flow rate and sccm unit"
            },
            "Fuel Rate (mg/s)": {
                "mapped": True,
                "canonical_field": "fuel_mass_flow_mg_s",
                "quantity": "Fuel mass flow rate",
                "unit": "mg/s",
                "reason": "Unambiguously names fuel mass flow rate and mg/s unit"
            },
            "HC Fuel Rate (mg/s)": {
                "mapped": True,
                "canonical_field": "hydrocarbon_fuel_mass_flow_mg_s",
                "quantity": "Hydrocarbon fuel mass flow rate",
                "unit": "mg/s",
                "reason": "Unambiguously names hydrocarbon mass flow rate and mg/s unit"
            },
            "Air Rate (cm/s)": {
                "mapped": True,
                "canonical_field": "airflow_speed_cm_s",
                "quantity": "Coflow air rate",
                "unit": "cm/s",
                "reason": "Unambiguously names coflow air velocity and cm/s unit"
            }
        },
        "material_map": {
            "Ethylene": "Ethylene",
            "Methane": "Methane"
        }
    },
    "PSI-106": {
        "psi_id": "PSI-106",
        "investigation_title": "SLICE",
        "source_file": "raw_real/PSI-106/experimental_table/PSI-106_Experimental table_Slice.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Test Date": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Calendar date",
                "unit": None,
                "reason": "Date string without physical measurement unit"
            },
            "Fuel Type": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Fuel identity",
                "unit": None,
                "reason": "Unambiguously names fuel type"
            }
        },
        "material_map": {
            "100% CH4": "Methane",
            "40% CH4 (balance N2) including 2 pyrometry calibration tests and 2 fan calibrations": "Methane mixture",
            "70% CH4 (balance N2) including 1 pyrometry calibration test": "Methane mixture"
        }
    },
    "PSI-47": {
        "psi_id": "PSI-47",
        "investigation_title": "DAFT",
        "source_file": "raw_real/PSI-47/experimental_table/PSI-47_Experimental table_DAFT.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Session Name": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Session identifier",
                "unit": None,
                "reason": "Unambiguously identifies DAFT test session"
            },
            "Actual Day": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Execution day",
                "unit": None,
                "reason": "Day timestamp without physical measurement unit"
            },
            "Hardware Description": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Hardware description",
                "unit": None,
                "reason": "Qualitative equipment description without physical measurement unit"
            },
            "Sample Material": {
                "mapped": True,
                "canonical_field": "fuel",
                "quantity": "Aerosol particulate material",
                "unit": None,
                "reason": "Unambiguously names aerosol sample particulate material"
            },
            "Sampled Location": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "ISS sampling location",
                "unit": None,
                "reason": "Qualitative ISS module location without physical measurement unit"
            }
        },
        "material_map": {
            "Arizona Road Dust (ARD Fine) in combination with ISS GN2 to create an aerosol for measurement purposes.": "Arizona Road Dust"
        }
    },
    "PSI-142": {
        "psi_id": "PSI-142",
        "investigation_title": "CFE Data Summary",
        "source_file": "raw_real/PSI-142/experimental_table/PSI-142_Experimental table_Data Summary Table.csv",
        "gravity_regime": "microgravity",
        "column_mappings": {
            "Data ID": {
                "mapped": True,
                "canonical_field": "test_id",
                "quantity": "Dataset identifier",
                "unit": None,
                "reason": "Unambiguously identifies published dataset item"
            },
            "Data Description": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Dataset description",
                "unit": None,
                "reason": "Qualitative publication dataset description without physical measurement unit"
            },
            "Reference Publication Link": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "DOI URL",
                "unit": None,
                "reason": "Literature DOI hyperlink without physical measurement unit"
            },
            "Figure ID in Reference": {
                "mapped": False,
                "canonical_field": None,
                "quantity": "Figure index",
                "unit": None,
                "reason": "Publication figure reference without physical measurement unit"
            }
        },
        "material_map": {}
    }
}

os.makedirs(os.path.join("analysis", "table_maps"), exist_ok=True)
for psi_id, m in maps.items():
    p = os.path.join("analysis", "table_maps", f"{psi_id}.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(m, f, indent=2)
    print(f"Wrote {p}")
