"""
Job intelligence endpoints.

Serves, updates and confirms job understanding data tied to a session.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.core.logging_config import app_logger
from app.understanding.upload_service import UploadService

router = APIRouter()

_OUTPUT_DIR = Path(settings.OUTPUT_PATH)
_BASE_UPLOAD_DIR = Path(settings.OUTPUT_PATH).parent / "uploads"


def _get_service() -> UploadService:
    return UploadService(
        base_upload_dir=_BASE_UPLOAD_DIR,
        output_dir=settings.OUTPUT_PATH,
    )


def _load_job_intelligence() -> Dict[str, Any]:
    job_path = _OUTPUT_DIR / "job_intelligence.json"
    if not job_path.exists():
        raise HTTPException(status_code=404, detail="No job intelligence found. Please upload a job description first.")
    with open(job_path, "r", encoding="utf-8") as fh:
        return json.load(fh)


@router.get("/jobs/{session_id}")
async def get_job_understanding(session_id: str) -> Dict[str, Any]:
    """Return extracted job intelligence for a session."""
    service = _get_service()
    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    data = _load_job_intelligence()
    return {"success": True, "data": data}


@router.put("/jobs/{session_id}")
async def update_job_understanding(session_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Update job intelligence for a session (after human review)."""
    service = _get_service()
    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    job_path = _OUTPUT_DIR / "job_intelligence.json"
    existing = {}
    if job_path.exists():
        with open(job_path, "r", encoding="utf-8") as fh:
            existing = json.load(fh)

    existing.update(body)
    with open(job_path, "w", encoding="utf-8") as fh:
        json.dump(existing, fh, indent=2)

    app_logger.info("job_updated", extra={"event": "job_update", "session_id": session_id})
    return {"success": True, "data": existing}


@router.post("/jobs/{session_id}/confirm")
async def confirm_job_understanding(session_id: str) -> Dict[str, Any]:
    """Confirm job understanding, advancing session status to job_reviewed."""
    service = _get_service()
    payload = service.get_session(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    # Advance session status
    payload["status"] = "candidates_parsed"
    payload["job_confirmed"] = True
    session_file = _BASE_UPLOAD_DIR / f"{session_id}.json"
    with open(session_file, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)

    app_logger.info("job_confirmed", extra={"event": "job_confirm", "session_id": session_id})
    return {"success": True, "data": {"session_id": session_id, "status": "job_reviewed"}}
