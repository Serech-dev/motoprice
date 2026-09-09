# AutoPrice: Lanzador completo PowerShell
Write-Host "Iniciando Backend y Frontend en consolas separadas..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$PSScriptRoot\run-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$PSScriptRoot\run-frontend.ps1"

Write-Host "[OK] Ambas consolas han sido iniciadas." -ForegroundColor Green

