@echo off
title RECI - Commit OOM Fix
cd /d "c:\Users\anush\OneDrive\Desktop\Projects\IndiaRuns-Redrob\RankEngine"

echo === Staging changes ===
git add reci-ai/backend/app/decision_engine/model_loader.py

echo.
echo === Committing ===
git commit -m "fix: change spaCy model to en_core_web_sm to prevent Render 512MB RAM OOM"

echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo === Done! ===
pause
