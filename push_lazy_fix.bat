@echo off
title RECI - Commit Lazy Load Fix
cd /d "c:\Users\anush\OneDrive\Desktop\Projects\IndiaRuns-Redrob\RankEngine"

echo === Staging changes ===
git add reci-ai/backend/app/decision_engine/decision_engine.py
git add reci-ai/backend/app/decision_engine/model_loader.py
git add reci-ai/backend/app/core/config.py
git add render.yaml

echo.
echo === Committing ===
git commit -m "fix: make model engines completely lazy-loaded + introduce LIGHTWEIGHT_MODE to prevent Render OOM"

echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo === Done! ===
pause
