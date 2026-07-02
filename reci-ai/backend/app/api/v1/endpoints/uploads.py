"""
File upload endpoints.

Handles job description and candidate dataset uploads tied to a session.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.core.logging_config import app_logger
from app.understanding.upload_service import UploadService

router = APIRouter()

_BASE_UPLOAD_DIR = Path(settings.OUTPUT_PATH).parent / "uploads"


def _get_service() -> UploadService:
    return UploadService(
        base_upload_dir=_BASE_UPLOAD_DIR,
        output_dir=settings.OUTPUT_PATH,
    )


@router.post("/uploads/job-description")
async def upload_job_description(
    file: UploadFile = File(...),
    session_id: str = Form(...),
) -> Dict[str, Any]:
    """
    Upload a Job Description (DOCX) for a given session.
    Persists the file and extracts job intelligence immediately.
    """
    service = _get_service()

    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    file_bytes = await file.read()
    file_name = file.filename or "job_description.docx"

    try:
        result = service.process_job_upload(session_id, file_name, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        app_logger.error("upload_job_failed", extra={"event": "upload", "session_id": session_id, "error": str(exc)})
        raise HTTPException(status_code=500, detail=f"Failed to process job description: {exc}")

    return {
        "success": True,
        "data": {
            "session_id": session_id,
            "file_name": file_name,
            "file_type": "job_description",
            "status": "uploaded",
            "job_intelligence": result.get("job_intelligence"),
        },
    }


@router.post("/uploads/candidate-dataset")
async def upload_candidate_dataset(
    file: UploadFile = File(...),
    session_id: str = Form(...),
) -> Dict[str, Any]:
    """
    Upload a Candidate Dataset (JSON) for a given session.
    Validates, processes, and generates behavior profiles for all candidates.
    """
    service = _get_service()

    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    file_bytes = await file.read()
    file_name = file.filename or "candidates.json"

    try:
        result = service.process_candidates_upload(session_id, file_name, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        app_logger.error(
            "upload_candidates_failed",
            extra={"event": "upload", "session_id": session_id, "error": str(exc)},
        )
        raise HTTPException(status_code=500, detail=f"Failed to process candidate dataset: {exc}")

    # Update candidate_count on session record
    session_file = _BASE_UPLOAD_DIR / f"{session_id}.json"
    if session_file.exists():
        try:
            with open(session_file, "r", encoding="utf-8") as fh:
                s = json.load(fh)
            s["candidate_count"] = result.get("candidate_count", 0)
            with open(session_file, "w", encoding="utf-8") as fh:
                json.dump(s, fh, indent=2)
        except Exception:
            pass

    return {
        "success": True,
        "data": {
            "session_id": session_id,
            "file_name": file_name,
            "file_type": "candidate_dataset",
            "status": "uploaded",
            "candidate_count": result.get("candidate_count"),
            "validation_status": result.get("validation_status"),
        },
    }
