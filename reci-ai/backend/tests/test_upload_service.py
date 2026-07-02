import json
from pathlib import Path

from app.understanding.upload_service import UploadService


def test_upload_service_creates_session_and_rejects_unsupported_types(tmp_path):
    upload_root = tmp_path / "uploads"
    service = UploadService(base_upload_dir=upload_root, output_dir=tmp_path / "outputs")

    session = service.create_session()
    assert session["session_id"]
    assert (upload_root / session["session_id"]).exists()

    try:
        service.save_upload(session["session_id"], "notes.txt", b"hello", kind="job")
    except ValueError as exc:
        assert "Unsupported file type" in str(exc)
    else:
        raise AssertionError("Expected unsupported file type error")


def test_process_candidates_upload_generates_manifest_and_outputs(tmp_path):
    upload_root = tmp_path / "uploads"
    output_dir = tmp_path / "outputs"
    service = UploadService(base_upload_dir=upload_root, output_dir=output_dir)

    session = service.create_session()
    payload = [
        {
            "candidate_id": "cand-001",
            "name": "Alice Example",
            "skills": ["Python"],
            "work_history": [{"company": "Acme", "role": "Engineer", "start_date": "2020-01"}],
            "projects": [],
            "education": [],
            "certifications": [],
            "languages": ["English"],
        }
    ]

    result = service.process_candidates_upload(
        session_id=session["session_id"],
        file_name="candidates.json",
        file_bytes=json.dumps(payload).encode("utf-8"),
    )

    assert result["candidate_count"] == 1
    manifest_path = output_dir / "manifest.json"
    assert manifest_path.exists()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest["session_id"] == session["session_id"]
    assert manifest["candidate_count"] == 1
