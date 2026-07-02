import csv
import hashlib
import io
import json
import shutil
import time
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4
from zipfile import BadZipFile

from app.core.config import settings
from app.core.logging_config import app_logger
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
        session_id = f"session_{uuid4().hex[:8]}"
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
        app_logger.info("session_created", extra={"event": "session_create", "session_id": session_id})
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

        safe_name = self._validate_filename(file_name)
        self._validate_upload_size(file_bytes)

        suffix = Path(safe_name).suffix.lower()
        allowed = {"job": set(settings.ALLOWED_JOB_EXTENSIONS), "candidates": set(settings.ALLOWED_CANDIDATE_EXTENSIONS)}
        if kind not in allowed or suffix not in allowed[kind]:
            supported = ", ".join(sorted(allowed[kind]))
            raise ValueError(f"Unsupported file type for {kind}. Supported types: {supported}")

        if kind == "job":
            self._validate_docx_bytes(file_bytes)
        else:
            if suffix == ".json":
                self._validate_json_bytes(file_bytes)
            elif suffix == ".csv":
                self._validate_csv_bytes(file_bytes)
            elif suffix in [".xlsx"]:
                self._validate_excel_bytes(file_bytes)

        session_dir = Path(session["upload_dir"])
        target_name = "job_description.docx" if kind == "job" else "candidates.json"
        target_path = session_dir / target_name
        target_path.write_bytes(file_bytes)

        session["uploads"][kind] = {
            "file_name": Path(safe_name).name,
            "stored_path": str(target_path),
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "size_bytes": len(file_bytes),
            "sha256": hashlib.sha256(file_bytes).hexdigest(),
        }
        session["status"] = "ready" if set(session["uploads"].keys()) == {"job", "candidates"} else "uploaded"
        session["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._write_session_payload(session_id, session)
        app_logger.info("upload_saved", extra={"event": "upload", "session_id": session_id, "kind": kind, "size_bytes": len(file_bytes)})
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
        app_logger.info("job_processed", extra={"event": "parser", "session_id": session_id})

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

        suffix = Path(file_name).suffix.lower()
        try:
            if suffix == ".json":
                raw_candidates = Loader.load_json_bytes(file_bytes)
            elif suffix == ".csv":
                raw_candidates = Loader.load_csv_bytes(file_bytes)
            elif suffix in [".xlsx"]:
                raw_candidates = Loader.load_excel_bytes(file_bytes)
            else:
                raise ValueError(f"Unsupported candidate file type: {suffix}")
        except Exception as exc:
            raise ValueError(f"Failed to parse candidate dataset: {exc}") from exc

        if not isinstance(raw_candidates, list) or not raw_candidates:
            raise ValueError("Candidate dataset is empty or not formatted correctly")

        validation_report = ValidationEngine.validate_candidate_dataset(raw_candidates)
        if validation_report.failures:
            app_logger.warning("candidate_validation_failed", extra={"event": "validation", "session_id": session_id, "failures": len(validation_report.failures)})
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
        app_logger.info("candidates_processed", extra={"event": "parser", "session_id": session_id, "candidate_count": len(raw_candidates)})

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

    def _validate_filename(self, file_name: str) -> str:
        if not file_name or not isinstance(file_name, str):
            raise ValueError("Invalid filename")
        candidate = Path(file_name).name
        if candidate != file_name or "/" in file_name or "\\" in file_name or file_name.startswith("."):
            raise ValueError("Invalid filename")
        if any(char in file_name for char in ['..', '(', ')', ':', '*', '?', '"', '<', '>', '|']):
            raise ValueError("Invalid filename")
        return candidate

    def _validate_upload_size(self, file_bytes: bytes) -> None:
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise ValueError(f"Upload too large: maximum {settings.MAX_UPLOAD_SIZE_BYTES} bytes allowed")

    def _validate_docx_bytes(self, file_bytes: bytes) -> None:
        try:
            with zipfile.ZipFile(Path("/tmp") if False else None):
                pass
        except Exception:
            pass
        try:
            with zipfile.ZipFile(file_bytes if False else None):
                pass
        except Exception:
            pass
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as archive:
                if "word/document.xml" not in archive.namelist():
                    raise ValueError("Invalid DOCX package")
        except Exception as exc:
            raise ValueError("Invalid DOCX package") from exc

    def _validate_json_bytes(self, file_bytes: bytes) -> None:
        try:
            payload = json.loads(file_bytes.decode("utf-8"))
        except Exception as exc:
            raise ValueError("Invalid JSON payload") from exc
        if not isinstance(payload, list):
            raise ValueError("Candidate dataset must be a JSON array")

    def _validate_csv_bytes(self, file_bytes: bytes) -> None:
        try:
            content = file_bytes.decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(content))
            rows = list(reader)
            if not rows:
                raise ValueError("CSV file is empty")
        except Exception as exc:
            raise ValueError(f"Invalid CSV payload: {exc}") from exc

    def _validate_excel_bytes(self, file_bytes: bytes) -> None:
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True)
            sheet = wb.active
            # check if there is data beyond header
            if sheet.max_row <= 1:
                raise ValueError("Excel sheet is empty or contains only headers")
        except Exception as exc:
            raise ValueError(f"Invalid Excel payload: {exc}") from exc

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

    def _cleanup_expired_sessions(self, max_age_seconds: Optional[int] = None) -> None:
        now = time.time()
        max_age_seconds = max_age_seconds or settings.SESSION_TIMEOUT_SECONDS
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
