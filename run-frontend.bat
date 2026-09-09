@echo off
title AutoPrice - Frontend (React + Vite)
echo ========================================================
echo   AutoPrice: Dashboard de Repuestos Automotor
echo   Iniciando Frontend Vite...
echo ========================================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] Instalando dependencias de Node...
    call npm install
)

echo App frontend lista en: http://localhost:5173
echo.
call npm run dev

pause

