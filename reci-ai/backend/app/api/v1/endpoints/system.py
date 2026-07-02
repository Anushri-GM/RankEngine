import json
import os
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter

from app.core.config import settings
from app.core.logging_config import app_logger
from app.understanding.upload_service import UploadService

router = APIRouter()


@router.get("/system/health")
async def system_health() -> Dict[str, Any]:
    output_dir = Path(settings.OUTPUT_PATH)
    output_dir.mkdir(parents=True, exist_ok=True)

    backend_status = "healthy"
    if not output_dir.exists():
        backend_status = "degraded"

    components = {
        "backend": {"status": backend_status, "service": "RECI Backend", "version": settings.VERSION},
        "frontend": {"status": "healthy", "service": "RECI Frontend"},
        "ai_models_loaded": {"status": "degraded", "details": "Model loading is lazy and may require a warm-up request"},
        "vector_index_status": {"status": "pending", "details": "Index builds on-demand during ranking"},
        "session_manager_status": {"status": "healthy", "details": "Sessions are persisted on disk"},
        "storage_status": {"status": "healthy", "path": str(output_dir)},
        "api_status": {"status": "healthy", "docs": "/docs"},
    }

    app_logger.info("health_checked", extra={"event": "health", "status": backend_status})
    return {
        "status": "healthy" if backend_status == "healthy" else "degraded",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "components": components,
    }


@router.post("/system/demo")
async def demo_mode() -> Dict[str, Any]:
    service = UploadService(base_upload_dir=Path(settings.OUTPUT_PATH).parent / "uploads", output_dir=settings.OUTPUT_PATH)
    session = service.create_session()
    sample_payload = {
        "session_id": session["session_id"],
        "status": "demo_ready",
        "sample_job_description": "Senior Python Engineer with experience in FastAPI, Docker, and cloud platforms",
        "sample_candidate_dataset": "Sample candidate dataset prepared for demo mode",
    }
    (Path(settings.OUTPUT_PATH) / "demo_manifest.json").write_text(json.dumps(sample_payload, indent=2), encoding="utf-8")
    app_logger.info("demo_session_created", extra={"event": "demo", "session_id": session["session_id"]})
    return sample_payload
