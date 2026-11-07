@echo off
title Retail Insights - Full Stack Launcher
echo Starting Retail Insights Full Stack Application...
echo.
echo [1/2] Launching Python FastAPI Backend Server on port 8000...
start "Retail Insights - Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Next.js 14 Frontend on port 3000...
start "Retail Insights - Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers launched!
echo - Web Application: http://localhost:3000
echo - Swagger API Docs: http://localhost:8000/docs
echo.
pause

