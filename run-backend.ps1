# AutoPrice: Iniciar Backend FastAPI
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AutoPrice: Backend (FastAPI + SQLite/PostgreSQL)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"

if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Host "[ERROR] No se encontro el entorno virtual en backend\.venv" -ForegroundColor Red
    exit 1
}

& ".\.venv\Scripts\Activate.ps1"
Write-Host "[OK] Entorno virtual activado." -ForegroundColor Green
Write-Host "Backend escuchando en: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Docs interactivos:     http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

