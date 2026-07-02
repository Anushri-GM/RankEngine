"""
Session management endpoints.

Provides CRUD operations for hiring sessions backed by the UploadService.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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


def _session_to_response(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a raw session payload to the shape the frontend expects."""
    status_map = {
        "created": "new",
        "uploaded": "job_uploaded",
        "ready": "job_uploaded",
        "job_parsed": "job_uploaded",
        "candidates_parsed": "job_reviewed",
        "processing": "processing",
        "completed": "completed",
        "error": "error",
    }
    raw_status = payload.get("status", "created")
    normalized_status = status_map.get(raw_status, raw_status)

    return {
        "session_id": payload.get("session_id", ""),
        "role_title": payload.get("role_title", payload.get("session_id", "")),
        "status": normalized_status,
        "created_at": payload.get("created_at", ""),
        "updated_at": payload.get("updated_at", ""),
        "candidate_count": payload.get("candidate_count"),
        "uploads": payload.get("uploads", {}),
    }


class CreateSessionRequest(BaseModel):
    role_title: str


@router.post("/sessions")
async def create_session(body: CreateSessionRequest) -> Dict[str, Any]:
    """Create a new hiring session."""
    service = _get_service()
    payload = service.create_session()

    # Persist the role_title in the session file
    session_file = _BASE_UPLOAD_DIR / f"{payload['session_id']}.json"
    payload["role_title"] = body.role_title
    with open(session_file, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)

    app_logger.info(
        "session_created_with_title",
        extra={"event": "session_create", "session_id": payload["session_id"], "role_title": body.role_title},
    )
    return {"success": True, "data": _session_to_response(payload)}


@router.get("/sessions")
async def list_sessions() -> Dict[str, Any]:
    """List all active hiring sessions."""
    service = _get_service()
    sessions: List[Dict[str, Any]] = []

    upload_dir = _BASE_UPLOAD_DIR
    if upload_dir.exists():
        for session_file in sorted(upload_dir.glob("session_*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
            try:
                with open(session_file, "r", encoding="utf-8") as fh:
                    raw = json.load(fh)
                sessions.append(_session_to_response(raw))
            except Exception:
                continue

    return {"success": True, "data": sessions}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    """Retrieve a specific session by ID."""
    service = _get_service()
    payload = service.get_session(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return {"success": True, "data": _session_to_response(payload)}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str) -> Dict[str, Any]:
    """Delete a session and its associated uploads."""
    service = _get_service()
    payload = service.get_session(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    result = service.delete_session(session_id)
    return {"success": True, "data": result}


@router.get("/sessions/{session_id}/processing-status")
async def get_processing_status(session_id: str) -> Dict[str, Any]:
    """Return processing status details for a session."""
    service = _get_service()
    payload = service.get_session(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    status = payload.get("status", "created")
    stage_map = {
        "created": ("idle", 0, "Waiting for uploads"),
        "uploaded": ("uploading", 10, "Files uploaded"),
        "ready": ("ready", 20, "Ready to process"),
        "job_parsed": ("parsing", 40, "Job description parsed"),
        "candidates_parsed": ("ranking", 80, "Candidates parsed"),
        "processing": ("processing", 60, "Running AI ranking"),
        "completed": ("completed", 100, "Processing complete"),
        "error": ("error", 0, "An error occurred"),
    }
    stage, progress, step = stage_map.get(status, ("idle", 0, "Unknown"))

    processing_status = {
        "stage": stage,
        "progress": progress,
        "current_step": step,
        "estimated_time_remaining": None,
    }
    return {"success": True, "data": processing_status}
