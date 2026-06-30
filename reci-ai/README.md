# RECI - Redrob Explainable Candidate Intelligence

RECI is an enterprise-grade, explainable AI candidate ranking and recruitment platform. This repository contains the complete project architecture and working foundation (Part 1).

## Project Overview

RECI aims to solve the black-box problem of typical AI resume parsing and matching tools. It focuses on transparency, structured suitability vectors, and explainability for hiring teams. 

This foundation sets up a decoupled React + TypeScript frontend (Vite, Tailwind, React Query) and a Fast API backend (Uvicorn, Pydantic, CORS enabled) with complete setup for future modules like embeddings, multi-agent frameworks, and retrieval-augmented verification.

## Architecture

RECI is built on a clean, scalable architectural foundation:
- **Frontend Layer:** Built using React 19, TypeScript, and Vite. Styling is powered by a custom Tailwind CSS configuration using premium SaaS tokens. Data fetching and state management utilize TanStack React Query and Axios.
- **Backend Layer:** Powered by FastAPI for highly performant asynchronous routing. Configuration is handled using Pydantic settings. CORS is enabled globally for local and staging access.
- **Docker Layer:** Preconfigured with a multi-stage Dockerfile and a docker-compose pipeline linking backend and frontend containers.

## Folder Structure

```text
reci-ai/
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── api/                  # Axios core clients
│   │   ├── components/           # Reusable UI & layout templates
│   │   ├── hooks/                # Global React Query hooks
│   │   ├── pages/                # High-fidelity dashboard views
│   │   ├── types/                # Strict TypeScript typings
│   │   ├── utils/                # Helper modules
│   │   ├── App.tsx               # App routers
│   │   └── main.tsx              # React mounting root
│   ├── package.json              # Frontend npm dependencies
│   ├── tailwind.config.js        # Styling system tokens
│   └── vite.config.ts            # Vite configuration
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── api/                  # Versioned API routes
│   │   ├── core/                 # Config & settings loaders
│   │   ├── models/               # [Part 2] Database schemas
│   │   ├── job_understanding/    # [Part 2] Job requirements mapping
│   │   ├── candidate_understanding/ # [Part 2] Resume parsing & profile parsing
│   │   ├── decision_engine/      # [Part 2] Semantic matching & ranking engine
│   │   ├── parser/               # [Part 2] Document extractions
│   │   ├── retrieval/            # [Part 2] Embeddings & vector search
│   │   ├── explainability/       # [Part 2] Explainable AI vectors
│   │   ├── reports/              # [Part 2] Automated summaries
│   │   ├── utils/                # Shared Python helpers
│   │   └── main.py               # FastAPI application startup
│   └── tests/                    # Endpoint test cases
├── docs/                         # Platform design docs
├── deployment/                   # Cloud configuration templates
├── outputs/                      # Ingested resume artifacts
├── cache/                        # Cached model embeddings
├── Dockerfile                    # Multi-stage production container
├── docker-compose.yml            # Local deployment composition
├── requirements.txt              # Backend dependencies
├── package.json                  # Root runner configurations
├── .gitignore                    # OS/Node/Python exclusions
└── .env.example                  # Environment blueprint
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and pip

### Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```

Variables configured:
- `VITE_API_URL`: Path to Fast API endpoint (default: `http://localhost:8000/api/v1`)
- `PORT`: Python uvicorn port (default: `8000`)
- `ENV`: Environment descriptor (`development`/`production`)
- `MODEL_CACHE`: Cache paths for local LLMs or tokenizers
- `OUTPUT_PATH`: Ingested resume storage directory

---

## Running the Application

### Option 1: Root Commands (Recommended)
From the `reci-ai` root directory, install dependencies:
```bash
# Install concurrently at the root
npm install

# Install all workspace dependencies
npm run install:all
```

Start both servers concurrently:
```bash
npm run dev
```
The React frontend will spin up on `http://localhost:5173`, and the FastAPI backend will run on `http://localhost:8000`.

### Option 2: Running Services Separately

#### Running Backend
1. Create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r ../requirements.txt
   ```
2. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
3. API documentation is available at `http://localhost:8000/docs` (Swagger UI).

#### Running Frontend
1. Move to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

---

## Docker Containerization
To run the full stack containerized:
```bash
docker-compose up --build
```
- Backend runs on `http://localhost:8000`
- Frontend is served via Nginx on `http://localhost:3000`

---

## Future Roadmap (Part 2)
1. **Resume Parser:** Add layout-aware PDF text extraction and metadata chunking.
2. **Embeddings & Retrieval:** Standardize FAISS/Chroma search mappings using sentence-transformers.
3. **Cross-Encoder Ranking:** Rerank candidate profiles based on skill vectors.
4. **Digital Twin & Multi-Agents:** Deploy autonomous agents for simulated candidate interviews and code evaluation.
5. **Explainability Logic:** Generate graph visualizations representing matches and skill gap analysis.
