@echo off
title AutoPrice - Test Suite
echo ========================================================
echo   AutoPrice: Ejecutando Suite de Tests (pytest)
echo ========================================================
echo.

cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
python -m pytest tests/ -v

echo.
echo ========================================================
pause

