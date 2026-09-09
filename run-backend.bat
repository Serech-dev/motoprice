@echo off
title AutoPrice - Backend (FastAPI)
echo ========================================================
echo   AutoPrice: Motor de Precios y Cruces Automotor
echo   Iniciando Backend FastAPI con .venv...
echo ========================================================
echo.

cd /d "%~dp0backend"

if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] No se encontro el entorno virtual en backend\.venv
    echo Por favor ejecute: py -3.13 -m venv backend\.venv
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat
echo [OK] Entorno virtual activado.
echo Servidor escuchando en: http://127.0.0.1:8000
echo Documentacion Swagger:  http://127.0.0.1:8000/docs
echo.
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause

