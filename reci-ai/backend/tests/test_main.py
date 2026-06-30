from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """
    Test that the root endpoint returns 200 and a welcome message.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_read_health():
    """
    Test that the base health endpoint returns status healthy.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "RECI Backend",
        "version": "1.0"
    }

def test_read_v1_health():
    """
    Test that the api/v1/health endpoint returns status healthy.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
