# Deployment Guide

## Backend (Render)
- Build Command: `pip install -r requirements.txt`
- Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health Check: `/api/v1/system/health`

## Frontend (Vercel)
- Build Command: `npm install && npm run build`
- Output Directory: `frontend/dist`
- Environment Variable: `VITE_API_URL=https://<backend-url>/api/v1`

## Environment Variables
- PORT=8000
- ENV=production
- MODEL_CACHE=/app/cache
- OUTPUT_PATH=/app/outputs
- SESSION_TIMEOUT_SECONDS=86400
- MAX_UPLOAD_SIZE_BYTES=5000000
