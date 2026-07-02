# RECI - Redrob Explainable Candidate Intelligence

RECI is a production-ready hiring intelligence platform that combines structured candidate understanding, semantic retrieval, ranking, and explainability into a deployable demo experience for recruiters and judges.

## Overview
- Upload a job description and candidate dataset
- Parse and validate candidate information
- Rank candidates with explainable evidence
- Export reports and explore results in a recruiter workspace
- Launch a one-click demo without any manual setup

## Architecture
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: FastAPI, Pydantic, Uvicorn
- AI layer: understanding engine, embeddings, FAISS-style vector retrieval, and cross-encoder reranking
- Deployment: Docker, Vercel, Render, GitHub Actions

## Folder Structure
```text
reci-ai/
├── backend/              # FastAPI backend and AI modules
├── frontend/             # React frontend
├── deployment/           # Render/Vercel deployment notes
├── docs/                 # Architecture and API docs
├── .github/workflows/    # CI pipeline
└── Dockerfile            # Container build definition
```

## Local Development
```bash
python -m pip install -r requirements.txt
npm install --prefix frontend
python -m pytest backend/tests -q
```

## Deployment
- Backend: Render with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Frontend: Vercel with `npm run build --prefix frontend`
- Health check: `/api/v1/system/health`

## Demo
- Open `/demo` in the web app or use the “Start Demo” CTA from the home page.

## Production Checklist
- Health endpoint available
- Structured logging enabled
- Upload validation and size limits enabled
- Session cleanup configured
- CI pipeline configured
