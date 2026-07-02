@echo off
title RECI - Commit Theme and CORS Fixes
cd /d "c:\Users\anush\OneDrive\Desktop\Projects\IndiaRuns-Redrob\RankEngine"

echo === Staging changes ===
git add reci-ai/frontend/src/index.css
git add reci-ai/backend/app/main.py

echo.
echo === Committing ===
git commit -m "fix: resolve Tailwind v4 custom theme colors + fix backend CORS credentials wildcard conflict"

echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo === Done! ===
pause
