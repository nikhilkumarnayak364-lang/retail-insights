Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Starting Retail Insights FastAPI Backend Server..." -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000

