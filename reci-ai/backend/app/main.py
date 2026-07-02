import uvicorn
from fastapi import FastAPI, APIRouter, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.endpoints.candidates import router as candidates_router
from app.api.v1.endpoints.decision import router as decision_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.sessions import router as sessions_router
from app.api.v1.endpoints.system import router as system_router
from app.api.v1.endpoints.understanding import router as understanding_router
from app.api.v1.endpoints.uploads import router as uploads_router
from app.core.config import settings
from app.core.exceptions import APIException, api_exception_handler, generic_exception_handler, http_exception_handler, validation_exception_handler
from app.core.logging_config import app_logger

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Redrob Explainable Candidate Intelligence (RECI) API Foundation",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if not origins:
    origins = ["*"]

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False if "*" in origins else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register global exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get("/", tags=["General"])
async def root():
    """Root endpoint returning a welcome message."""
    return {
        "message": "Welcome to RECI (Redrob Explainable Candidate Intelligence) API Services.",
        "docs": "/docs",
        "version": settings.VERSION,
    }


@app.get("/health", tags=["System"])
async def health_check():
    """Legacy system health check endpoint."""
    return {
        "status": "healthy",
        "service": "RECI Backend",
        "version": settings.VERSION,
    }


# Create api/v1 router
api_router = APIRouter()


@api_router.get("/health", tags=["System"])
async def v1_health_check():
    """Version 1 health check endpoint."""
    return {
        "status": "healthy",
        "service": "RECI Backend",
        "version": settings.VERSION,
    }


# Import understanding endpoints
api_router.include_router(understanding_router, prefix="/understanding", tags=["Understanding"])
api_router.include_router(decision_router, prefix="/decision", tags=["Decision"])

# Session & upload management endpoints
api_router.include_router(sessions_router, tags=["Sessions"])
api_router.include_router(uploads_router, tags=["Uploads"])
api_router.include_router(jobs_router, tags=["Jobs"])
api_router.include_router(candidates_router, tags=["Candidates"])

# Register v1 router to the app
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(system_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def configure_runtime():
    app_logger.info("startup", extra={"event": "startup", "environment": settings.ENV})

    # ── 1. Ensure spaCy model is available ──────────────────────────────────
    try:
        import spacy
        spacy.load("en_core_web_sm")
    except Exception:
        app_logger.warning("spaCy model missing; attempting download", extra={"event": "startup_model_download"})
        try:
            import spacy.cli
            spacy.cli.download("en_core_web_sm")
        except Exception as exc:
            app_logger.warning("spaCy download failed", extra={"event": "startup_model_download_failed", "error": str(exc)})

    # ── 2. Auto-init demo data so judges see results immediately ─────────────
    _auto_init_demo_data()


def _auto_init_demo_data() -> None:
    """
    On startup, check if candidate_intelligence.json exists in OUTPUT_PATH.
    If not, discover and process the bundled sample_candidates.json so the
    app works immediately without any manual file uploads.
    Also creates a persistent demo session.
    """
    import json
    from pathlib import Path
    from app.core.config import settings
    from app.core.logging_config import app_logger

    output_dir = Path(settings.OUTPUT_PATH)
    output_dir.mkdir(parents=True, exist_ok=True)

    cand_intel_path = output_dir / "candidate_intelligence.json"

    # Skip if already processed and scored
    if cand_intel_path.exists():
        try:
            with open(cand_intel_path, "r", encoding="utf-8") as fh:
                existing = json.load(fh)
            if existing and any(c.get("scores") for c in existing):
                app_logger.info("demo_data_already_present", extra={"event": "auto_init", "count": len(existing)})
                _ensure_demo_session(output_dir)
                return
        except Exception:
            pass

    # ── Discover sample_candidates.json ────────────────────────────────────
    dataset_path = _find_sample_dataset()
    if dataset_path is None:
        app_logger.warning("sample_dataset_not_found", extra={"event": "auto_init"})
        return

    app_logger.info("auto_init_starting", extra={"event": "auto_init", "dataset": str(dataset_path)})

    try:
        import json
        from app.understanding.candidate_understanding import CandidateUnderstandingEngine
        from app.understanding.behavior_understanding import BehaviorUnderstanding
        from app.understanding.validation_engine import ValidationEngine
        from app.understanding.parser_metadata import ParserMetadataEngine
        from app.understanding.loader import Loader

        with open(dataset_path, "r", encoding="utf-8") as fh:
            raw_candidates = json.load(fh)

        if not isinstance(raw_candidates, list):
            raw_candidates = raw_candidates.get("candidates", [])

        if not raw_candidates:
            app_logger.warning("sample_dataset_empty", extra={"event": "auto_init"})
            return

        validation_report = ValidationEngine.validate_candidate_dataset(raw_candidates)

        processed_candidates = []
        behavior_profiles = []
        for cand in raw_candidates:
            cand_intel = CandidateUnderstandingEngine.process_candidate(cand)
            processed_candidates.append(cand_intel)
            profile = BehaviorUnderstanding.generate_profile(cand_intel, validation_report.status)
            behavior_profiles.append(profile)

        ParserMetadataEngine.generate_artifacts(
            candidates=raw_candidates,
            processed_candidates=processed_candidates,
            behavior_profiles=behavior_profiles,
            validation_report=validation_report,
            dataset_path=dataset_path,
            output_dir=output_dir,
            job_intelligence=_get_demo_job_intelligence(),
        )

        # Write demo job intelligence
        job_intel = _get_demo_job_intelligence()
        with open(output_dir / "job_intelligence.json", "w", encoding="utf-8") as fh:
            json.dump(job_intel, fh, indent=2)

        enhanced_candidates = []
        for idx, (candidate, profile) in enumerate(zip(processed_candidates, behavior_profiles)):
            enhanced_candidates.append(
                ParserMetadataEngine.enrich_candidate_payload(
                    candidate=candidate,
                    behavior_profile=profile,
                    validation_status=validation_report.status,
                    profile_completeness=profile.profile_completeness_score,
                    index=idx,
                )
            )

        # Rerank and score candidates for the demo job
        try:
            from app.decision_engine.decision_engine import DecisionEngine
            engine = DecisionEngine()
            engine.prepare_embeddings_and_index()
            
            job_text = " ".join(job_intel.get("required_skills", []) + job_intel.get("preferred_skills", []))
            top = engine.retrieve_top_candidates(job_text, top_k=50)
            
            cand_map = {c["candidate_id"]: c for c in enhanced_candidates}
            candidates_for_rerank = []
            for item in top:
                cid = item.get("candidate_id")
                c = cand_map.get(cid, {})
                text = " ".join(c.get("skills", []) + [p.get("name", "") for p in c.get("projects", [])])
                candidates_for_rerank.append({"candidate_id": cid, "text": text})
                
            reranked = engine.rerank_with_cross_encoder(job_text, candidates_for_rerank)
            scored_results = engine.score_candidates(reranked, job_intel)
            
            scored_map = {item["candidate_id"]: item for item in scored_results}
            for c in enhanced_candidates:
                cid = c.get("candidate_id")
                scores_item = scored_map.get(cid)
                if scores_item:
                    sm = scores_item.get("skill_match", {})
                    cm = scores_item.get("career_match", {})
                    
                    technical = float(sm.get("overall", 0))
                    career = float(cm.get("experience_score", 0))
                    behavior = float(c.get("profile_completeness_score", 85.0) or 85.0)
                    experience = float(cm.get("experience_score", 0))
                    domain = float(sm.get("score_req", 0) * 0.8 + 20)
                    trust = float(c.get("profile_completeness_score", 90.0) or 90.0)
                    
                    overall_fit = round((technical * 0.4) + (career * 0.3) + (behavior * 0.1) + (experience * 0.2), 2)
                    
                    c["scores"] = {
                        "overall_fit": overall_fit,
                        "trust": trust,
                        "technical": technical,
                        "career": career,
                        "behavior": behavior,
                        "experience": experience,
                        "domain": domain,
                    }
                    c["overall_fit_score"] = overall_fit
                    c["recruiter_trust_score"] = trust
                    c["technical_fit"] = technical
                    c["career_fit"] = career
                    c["behavior_fit"] = behavior
                    c["experience_fit"] = experience
                    c["domain_fit"] = domain
                    if overall_fit >= 85:
                        c["recommendation"] = "strong_match"
                    elif overall_fit >= 70:
                        c["recommendation"] = "good_match"
                    else:
                        c["recommendation"] = "potential_match"
                else:
                    c["scores"] = {
                        "overall_fit": 0.0,
                        "trust": 0.0,
                        "technical": 0.0,
                        "career": 0.0,
                        "behavior": 0.0,
                        "experience": 0.0,
                        "domain": 0.0,
                    }
                    c["recommendation"] = "potential_match"
        except Exception as exc:
            app_logger.warning("failed_to_score_demo_candidates", extra={"error": str(exc)})

        with open(cand_intel_path, "w", encoding="utf-8") as fh:
            json.dump(enhanced_candidates, fh, indent=2)

        with open(output_dir / "behavior_profiles.json", "w", encoding="utf-8") as fh:
            json.dump([p.model_dump() for p in behavior_profiles], fh, indent=2)

        with open(output_dir / "validation_report.json", "w", encoding="utf-8") as fh:
            fh.write(validation_report.model_dump_json(indent=2))

        _ensure_demo_session(output_dir)

        app_logger.info(
            "auto_init_complete",
            extra={"event": "auto_init", "candidate_count": len(enhanced_candidates)},
        )

    except Exception as exc:
        app_logger.error("auto_init_failed", extra={"event": "auto_init", "error": str(exc)})


def _find_sample_dataset():
    """Search known locations for sample_candidates.json."""
    from pathlib import Path
    from app.core.config import settings

    # Explicit search paths — covers local dev and Render deployment
    candidates_filename = "sample_candidates.json"
    repo_root_candidates = [
        # reci-ai/data/ (bundled copy)
        Path(settings.OUTPUT_PATH).parent / "data" / candidates_filename,
        # Repo-root Dataset folder (works on Render since full repo is cloned)
        Path(settings.OUTPUT_PATH).parent.parent / "Dataset" / "[PUB] India_runs_data_and_ai_challenge" / "India_runs_data_and_ai_challenge" / candidates_filename,
        Path(settings.OUTPUT_PATH).parent.parent / "Dataset" / "India_runs_data_and_ai_challenge" / "India_runs_data_and_ai_challenge" / candidates_filename,
        Path(settings.OUTPUT_PATH).parent.parent / "Dataset" / candidates_filename,
        Path(settings.OUTPUT_PATH).parent.parent / "extracted_data" / candidates_filename,
    ]

    for p in repo_root_candidates:
        if p.exists():
            return p

    # Fall back to ParserMetadataEngine discovery
    try:
        from app.understanding.parser_metadata import ParserMetadataEngine
        found, _ = ParserMetadataEngine.discover_candidate_dataset()
        if found.exists():
            return found
    except Exception:
        pass

    return None


def _get_demo_job_intelligence():
    """Return a pre-built job intelligence dict for the India Runs AI challenge role."""
    return {
        "role": {
            "title": "AI/ML Engineer",
            "category": "Engineering",
            "seniority": "Mid-Senior"
        },
        "industry": "Technology / AI",
        "required_skills": [
            "Python", "Machine Learning", "Deep Learning", "SQL",
            "Data Engineering", "PyTorch", "TensorFlow", "Scikit-learn"
        ],
        "preferred_skills": [
            "NLP", "LLMs", "FastAPI", "Docker", "Kubernetes",
            "Spark", "Airflow", "AWS", "GCP", "Vector Databases"
        ],
        "responsibilities": [
            "Design and implement ML models for production use",
            "Build and maintain data pipelines",
            "Collaborate with cross-functional teams on AI products",
            "Conduct experiments and evaluate model performance",
            "Deploy and monitor ML systems at scale"
        ],
        "experience_requirement": {"years": 3, "description": "3+ years in ML engineering or data science"},
        "education_requirement": {"degree": "Bachelor's or above", "major": ["Computer Science", "Data Science", "Statistics"]},
        "employment_type": "Full-time",
        "location": "Remote / India",
        "soft_skills": ["Problem Solving", "Communication", "Collaboration", "Initiative"],
        "keywords": ["AI", "ML", "Python", "Data", "LLM", "NLP", "Engineer"],
        "inferred_expectations": [
            "Experience with large-scale data processing",
            "Familiarity with modern ML tooling and MLOps practices"
        ]
    }


def _ensure_demo_session(output_dir) -> None:
    """Create or refresh a pinned demo session so the Home page always shows at least one session."""
    import json
    from pathlib import Path
    from datetime import datetime, timezone
    from app.core.config import settings

    uploads_dir = Path(settings.OUTPUT_PATH).parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    demo_session_file = uploads_dir / "session_demo.json"
    demo_session_id = "session_demo"

    if demo_session_file.exists():
        return  # already exists, don't overwrite

    payload = {
        "session_id": demo_session_id,
        "role_title": "AI/ML Engineer — IndiaRuns Challenge",
        "status": "candidates_parsed",
        "upload_dir": str(uploads_dir / demo_session_id),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "uploads": {
            "candidates": {"file_name": "sample_candidates.json", "size_bytes": 0}
        },
        "candidate_count": None,
    }

    # Try to get candidate count
    cand_path = Path(output_dir) / "candidate_intelligence.json"
    if cand_path.exists():
        try:
            with open(cand_path, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            payload["candidate_count"] = len(data)
        except Exception:
            pass

    with open(demo_session_file, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.ENV != "production")

