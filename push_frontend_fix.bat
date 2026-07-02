@echo off
title RECI - Commit Frontend Fix
cd /d "c:\Users\anush\OneDrive\Desktop\Projects\IndiaRuns-Redrob\RankEngine"

echo === Staging changes ===
git add reci-ai/frontend/src/components/layout/Sidebar.tsx

echo.
echo === Committing ===
git commit -m "fix: remove unused inactiveStyle variable in Sidebar.tsx to fix build"

echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo === Done! ===
pause
