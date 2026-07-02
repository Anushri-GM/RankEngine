import hashlib
import json
import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4
from zipfile import BadZipFile

from app.core.config import settings
from app.understanding.behavior_understanding import BehaviorUnderstanding
from app.understanding.candidate_understanding import CandidateUnderstandingEngine
from app.understanding.job_understanding import JobUnderstandingEngine
from app.understanding.loader import Loader
from app.understanding.parser_metadata import ParserMetadataEngine
from app.understanding.validation_engine import ValidationEngine


class UploadService:
    def __init__(self, base_upload_dir: Optional[Path | str] = None, output_dir: Optional[Path | str] = None):
        self.base_upload_dir = Path(base_upload_dir or Path(settings.OUTPUT_PATH).parent / "uploads").resolve()
        self.output_dir = Path(output_dir or settings.OUTPUT_PATH).resolve()
        self.base_upload_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.job_engine = JobUnderstandingEngine()

    def create_session(self) -> Dict[str, Any]:
        self._cleanup_expired_sessions()
        session_id = f"session_{uuid4().hex}"
        session_dir = self.base_upload_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)

        payload = {
            "session_id": session_id,
            "status": "created",
            "upload_dir": str(session_dir),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "uploads": {},
        }
        self._write_session_payload(session_id, payload)
        return payload

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        self._cleanup_expired_sessions()
        payload = self._read_session_payload(session_id)
        if not payload:
            return None
        return payload

    def save_upload(self, session_id: str, file_name: str, file_bytes: bytes, kind: str) -> Dict[str, Any]:
        session = self.get_session(session_id)
        if not session:
            raise ValueError("Unknown upload session")

        suffix = Path(file_name).suffix.lower()
        allowed = {"job": {".docx"}, "candidates": {".json"}}
        if kind not in allowed or suffix not in allowed[kind]:
            supported = ", ".join(sorted(allowed[kind]))
            raise ValueError(f"Unsupported file type for {kind}. Supported types: {supported}")

        session_dir = Path(session["upload_dir"])
        target_name = "job_description.docx" if kind == "job" else "candidates.json"
        target_path = session_dir / target_name
        target_path.write_bytes(file_bytes)

        session["uploads"][kind] = {
            "file_name": Path(file_name).name,
            "stored_path": str(target_path),
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "size_bytes": len(file_bytes),
            "sha256": hashlib.sha256(file_bytes).hexdigest(),
        }
        session["status"] = "ready" if set(session["uploads"].keys()) == {"job", "candidates"} else "uploaded"
        session["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._write_session_payload(session_id, session)
        return session["uploads"][kind]

    def process_job_upload(self, session_id: str, file_name: str, file_bytes: bytes) -> Dict[str, Any]:
        upload_info = self.save_upload(session_id, file_name, file_bytes, kind="job")
        stored_path = Path(upload_info["stored_path"])
        if not stored_path.exists():
            raise ValueError("Job file was not stored successfully")

        try:
            text = self.job_engine.read_docx(file_bytes)
            job_intel = self.job_engine.extract_intelligence(text)
        except BadZipFile as exc:
            raise ValueError(f"Invalid DOCX file: {exc}") from exc
        except Exception as exc:
            raise ValueError(f"Failed to parse DOCX content: {exc}") from exc

        self.output_dir.mkdir(parents=True, exist_ok=True)
        output_path = self.output_dir / "job_intelligence.json"
        output_path.write_text(job_intel.model_dump_json(indent=2), encoding="utf-8")

        session = self.get_session(session_id) or {}
        session["status"] = "job_parsed"
        session["updated_at"] = datetime.now(timezone.utc).isoformat()
        session["job_parsed_at"] = datetime.now(timezone.utc).isoformat()
        self._write_session_payload(session_id, session)

        return {
            "ok": True,
            "session_id": session_id,
            "job_intelligence": job_intel.model_dump(),
            "stored_path": str(stored_path),
        }

    def process_candidates_upload(self, session_id: str, file_name: str, file_bytes: bytes) -> Dict[str, Any]:
        upload_info = self.save_upload(session_id, file_name, file_bytes, kind="candidates")
        stored_path = Path(upload_info["stored_path"])
        if not stored_path.exists():
            raise ValueError("Candidate file was not stored successfully")

        try:
            raw_candidates = Loader.load_json_bytes(file_bytes)
        except Exception as exc:
            raise ValueError(f"Invalid JSON payload: {exc}") from exc

        if not isinstance(raw_candidates, list) or not raw_candidates:
            raise ValueError("Candidate dataset is empty or not a JSON array")

        validation_report = ValidationEngine.validate_candidate_dataset(raw_candidates)
        if validation_report.failures:
            return {
                "ok": False,
                "error": "Candidate dataset failed validation",
                "validation_report": validation_report.model_dump(),
                "candidate_count": len(raw_candidates),
                "session_id": session_id,
            }

        processed_candidates: List[Any] = []
        behavior_profiles: List[Any] = []
        for candidate in raw_candidates:
            candidate_intelligence = CandidateUnderstandingEngine.process_candidate(candidate)
            profile = BehaviorUnderstanding.generate_profile(candidate_intelligence, validation_report.status)
            processed_candidates.append(candidate_intelligence)
            behavior_profiles.append(profile)

        job_payload = None
        existing_job_path = self.output_dir / "job_intelligence.json"
        if existing_job_path.exists():
            with open(existing_job_path, "r", encoding="utf-8") as handle:
                job_payload = json.load(handle)

        manifest, parser_report, skill_taxonomy, role_taxonomy, dataset_statistics = ParserMetadataEngine.generate_artifacts(
            candidates=raw_candidates,
            processed_candidates=processed_candidates,
            behavior_profiles=behavior_profiles,
            validation_report=validation_report,
            dataset_path=stored_path,
            output_dir=self.output_dir,
            job_intelligence=job_payload,
            session_id=session_id,
        )

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

        with open(self.output_dir / "candidate_intelligence.json", "w", encoding="utf-8") as handle:
            json.dump(enhanced_candidates, handle, indent=2)

        with open(self.output_dir / "behavior_profiles.json", "w", encoding="utf-8") as handle:
            json.dump([profile.model_dump() for profile in behavior_profiles], handle, indent=2)

        session = self.get_session(session_id) or {}
        session["status"] = "candidates_parsed"
        session["updated_at"] = datetime.now(timezone.utc).isoformat()
        session["candidates_parsed_at"] = datetime.now(timezone.utc).isoformat()
        self._write_session_payload(session_id, session)

        return {
            "ok": True,
            "session_id": session_id,
            "candidate_count": len(raw_candidates),
            "validation_status": validation_report.status,
            "validation_report": validation_report.model_dump(),
            "manifest": manifest,
            "parser_report": parser_report,
            "dataset_statistics": dataset_statistics,
            "stored_path": str(stored_path),
        }

    def delete_session(self, session_id: str) -> Dict[str, Any]:
        session_dir = self.base_upload_dir / session_id
        if session_dir.exists():
            shutil.rmtree(session_dir, ignore_errors=True)
        session_file = self.base_upload_dir / f"{session_id}.json"
        if session_file.exists():
            session_file.unlink(missing_ok=True)
        return {"deleted": True, "session_id": session_id}

    def _write_session_payload(self, session_id: str, payload: Dict[str, Any]) -> None:
        session_file = self.base_upload_dir / f"{session_id}.json"
        with open(session_file, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)

    def _read_session_payload(self, session_id: str) -> Optional[Dict[str, Any]]:
        session_file = self.base_upload_dir / f"{session_id}.json"
        if not session_file.exists():
            return None
        with open(session_file, "r", encoding="utf-8") as handle:
            return json.load(handle)

    def _cleanup_expired_sessions(self, max_age_seconds: int = 86400) -> None:
        now = time.time()
        for session_file in self.base_upload_dir.glob("session_*.json"):
            try:
                with open(session_file, "r", encoding="utf-8") as handle:
                    payload = json.load(handle)
                updated_at = payload.get("updated_at")
                if not updated_at:
                    continue
                updated_dt = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                if (now - updated_dt.timestamp()) > max_age_seconds:
                    session_id = payload.get("session_id") or session_file.stem
                    self.delete_session(session_id)
            except Exception:
                continue
