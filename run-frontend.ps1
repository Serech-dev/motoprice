# AutoPrice: Iniciar Frontend Vite
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AutoPrice: Frontend (React + Vite + Tailwind)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Instalando paquetes de Node..." -ForegroundColor Yellow
    npm install
}

Write-Host "Frontend listo en: http://localhost:5173" -ForegroundColor Green
Write-Host ""

npm run dev

