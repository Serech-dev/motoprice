@echo off
echo ========================================================
echo   AutoPrice: Lanzador Completo de Desarrollo
echo   Abriendo Backend y Frontend en consolas separadas...
echo ========================================================
echo.

start "AutoPrice - Backend (FastAPI)" cmd /c "%~dp0run-backend.bat"
start "AutoPrice - Frontend (Vite)" cmd /c "%~dp0run-frontend.bat"

echo Servidores iniciados en sus respectivas consolas.
echo Puede cerrar esta ventana.
timeout /t 3 >nul

