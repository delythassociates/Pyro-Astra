#!/usr/bin/env bash
# PYRO-ASTRA Single-Command Reproducibility Pipeline (Unix/macOS/Bash)
# NASA Space Apps Challenge 2026

set -e
echo "================================================================================"
echo " Launching PYRO-ASTRA Single-Command Reproducibility Pipeline"
echo "================================================================================"

python3 scripts/reproduce.py || python scripts/reproduce.py
