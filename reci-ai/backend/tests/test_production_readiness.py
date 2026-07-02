import json

from fastapi.testclient import TestClient

from app.main import app
from app.understanding.upload_service import UploadService


client = TestClient(app)


def test_system_health_endpoint_reports_components():
    response = client.get("/api/v1/system/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] in {"healthy", "degraded"}
    assert "components" in payload
    assert payload["components"]["backend"]["status"] in {"healthy", "degraded"}


def test_upload_service_rejects_invalid_filename_and_oversized_payload(tmp_path):
    service = UploadService(base_upload_dir=tmp_path / "uploads", output_dir=tmp_path / "outputs")
    session = service.create_session()

    try:
        service.save_upload(session["session_id"], "../evil.docx", b"bad-content", kind="job")
    except ValueError as exc:
        assert "Invalid filename" in str(exc)
    else:
        raise AssertionError("Expected invalid filename to be rejected")

    try:
        service.save_upload(session["session_id"], "large.docx", b"x" * 20_000_000, kind="job")
    except ValueError as exc:
        assert "too large" in str(exc).lower()
    else:
        raise AssertionError("Expected oversized upload to be rejected")


def test_demo_endpoint_creates_demo_session():
    response = client.post("/api/v1/system/demo")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "demo_ready"
    assert payload["session_id"].startswith("session_")
