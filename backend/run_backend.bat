@echo off
title Retail Insights - Backend API Server
echo =======================================================
echo Starting Retail Insights FastAPI Backend Server...
echo API Docs will be available at: http://localhost:8000/docs
echo =======================================================
cd /d "%~dp0"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
pause

