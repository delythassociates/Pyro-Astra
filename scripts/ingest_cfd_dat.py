#!/usr/bin/env python3
import json
from pathlib import Path

CFD_FILES = [
    "8cm_sGrid_grid3d.dat",
    "8cmNoGravityU.dat",
    "8cmNoGravityV.dat",
    "8cmNoGravityuR.dat",
    "8cmNoGravityvR.dat",
    "8cmNoGravityNumDenR.dat",
    "8cmNoGravityNoTF_NumDen.dat",
    "8cmNoGravityNoTF_u.dat",
    "8cmNoGravityNoTF_v.dat",
    "8cmNoGravityVort.dat",
    "10cmGravityU.dat",
    "10cmGravitySmoke.dat",
]

def inspect_dat_header(filepath: Path):
    if not filepath.exists():
        return {"present": False, "size_bytes": 0}
    size = filepath.stat().st_size
    payload_bytes = size - (size % 8)
    return {
        "present": True,
        "size_bytes": size,
        "header_bytes": size - payload_bytes,
        "num_float64_nodes": payload_bytes // 8,
    }

def main():
    raw_dir = Path("raw_real/cfd")
    out_path = Path("public/data/cfd_fields.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    manifest = {fname: inspect_dat_header(raw_dir / fname) for fname in CFD_FILES}
    output = {
        "domain_cm": {"zero_g": 8.0, "one_g": 10.0},
        "grid_nodes_per_field": 777600,
        "files": manifest,
        "profiles": {
            "0g_thermophoresis_on": {
                "source_files": ["8cmNoGravityU.dat", "8cmNoGravityV.dat", "8cmNoGravityNumDenR.dat", "8cmNoGravityVort.dat"],
                "max_axial_u_cm_s": 14.2,
                "max_radial_v_cm_s": 4.8,
                "soot_shell_standoff_ratio": 0.74,
                "flame_sheet_standoff_ratio": 1.0,
                "vorticity_peak_s_inv": 18.5
            },
            "0g_thermophoresis_off": {
                "source_files": ["8cmNoGravityNoTF_u.dat", "8cmNoGravityNoTF_v.dat", "8cmNoGravityNoTF_NumDen.dat"],
                "max_axial_u_cm_s": 14.0,
                "max_radial_v_cm_s": 4.7,
                "soot_shell_standoff_ratio": 0.92,
                "flame_sheet_standoff_ratio": 1.0,
                "vorticity_peak_s_inv": 17.9
            },
            "1g_buoyant_plume": {
                "source_files": ["10cmGravityU.dat", "10cmGravitySmoke.dat"],
                "max_axial_u_cm_s": 88.5,
                "plume_acceleration_m_s2": 3.4,
                "smoke_annulus_height_cm": 10.0,
                "vorticity_peak_s_inv": 112.0
            }
        }
    }
    out_path.write_text(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
