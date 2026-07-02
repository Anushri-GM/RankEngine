@echo off
title RECI Backend - FastAPI
cd /d "c:\Users\anush\OneDrive\Desktop\Projects\IndiaRuns-Redrob\RankEngine\reci-ai\backend"
echo Starting RECI Backend on http://localhost:8000 ...
echo API Docs: http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
pause
