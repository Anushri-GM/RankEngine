@echo off
title RECI Frontend - Vite
cd /d "c:\Users\anush\OneDrive\Desktop\Projects\IndiaRuns-Redrob\RankEngine\reci-ai\frontend"
echo Installing dependencies...
call npm install
echo.
echo Starting RECI Frontend on http://localhost:5173 ...
echo.
npm run dev
pause
