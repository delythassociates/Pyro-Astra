# PYRO-ASTRA Single-Command Reproducibility Pipeline (Windows PowerShell)
# NASA Space Apps Challenge 2026

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " Launching PYRO-ASTRA Single-Command Reproducibility Pipeline" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

python scripts/reproduce.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Reproducibility pipeline failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
