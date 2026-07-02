import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import settings

REQUIRED_OUTPUT_FILES = [
    "job_intelligence.json",
    "candidate_intelligence.json",
    "behavior_profiles.json",
    "manifest.json",
    "parser_report.json",
    "dataset_statistics.json",
]


class SessionManager:
    def __init__(self, base_upload_dir: Optional[str] = None):
        root_dir = Path(base_upload_dir) if base_upload_dir else Path(__file__).resolve().parents[3] / "uploads"
        self.base_upload_dir = root_dir
        self.base_upload_dir.mkdir(parents=True, exist_ok=True)

    def session_dir(self, session_id: str) -> Path:
        return self.base_upload_dir / session_id

    def outputs_dir(self, session_id: str) -> Path:
        return self.session_dir(session_id) / "outputs"

    def validate_session(self, session_id: str) -> Path:
        outputs_dir = self.outputs_dir(session_id)
        if not outputs_dir.exists() or not outputs_dir.is_dir():
            raise FileNotFoundError(
                f"Session outputs not found for '{session_id}'. Expected path: {outputs_dir}"
            )

        missing_files = [name for name in REQUIRED_OUTPUT_FILES if not (outputs_dir / name).exists()]
        if missing_files:
            raise FileNotFoundError(
                f"Session '{session_id}' is missing required decision outputs: {', '.join(missing_files)}"
            )
        return outputs_dir

    def list_sessions(self) -> List[str]:
        return [p.name for p in self.base_upload_dir.iterdir() if p.is_dir()]

    def load_json(self, file_path: Path) -> Any:
        with open(file_path, "r", encoding="utf-8") as handle:
            return json.load(handle)

    def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        session_dir = self.session_dir(session_id)
        outputs_dir = session_dir / "outputs"
        summary = {
            "session_id": session_id,
            "path": str(session_dir),
            "outputs_path": str(outputs_dir),
            "exists": session_dir.exists(),
            "output_files": [],
        }
        if outputs_dir.exists():
            summary["output_files"] = [p.name for p in outputs_dir.iterdir() if p.is_file()]
        return summary
