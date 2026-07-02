@echo off
title RECI - Deploy to GitHub
cd /d "c:\Users\anush\OneDrive\Desktop\Projects\IndiaRuns-Redrob\RankEngine"

echo === Staging all changes ===
git add -A

echo.
echo === Committing ===
git commit -m "feat: add deployment configs (Render + Vercel) + auto-init demo data on startup

- render.yaml: Render free tier backend (Python/FastAPI)
- reci-ai/frontend/vercel.json: Vercel Vite/React SPA config
- reci-ai/backend/requirements.txt: pinned backend deps
- reci-ai/backend/build_setup.py: copies sample dataset at build time
- reci-ai/backend/app/main.py: auto-init processes sample_candidates.json on startup
- reci-ai/backend/app/api/v1/endpoints/: sessions, uploads, candidates, jobs endpoints
- reci-ai/frontend/.env: VITE_API_URL=http://localhost:8000"

echo.
echo === Pushing to GitHub ===
git push origin main

echo.
echo === Done! ===
echo Now go to render.com and vercel.com to deploy.
pause
