import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_analyze_session():
    payload = {
        "session_id": "ab123",
        "tests": {
            "tremor": [{"x": 0.1, "timestamp": 1000}, {"x": -0.1, "timestamp": 1010}],
            "finger_tap": [{"timestamp": 1000}, {"timestamp": 1500}]
        },
        "files": ["voice"]
    }
    
    response = client.post("/ml/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "ab123"
    assert "composite_score" in data
    assert "risk_level" in data
    assert "per_test_scores" in data
    assert "tremor" in data["per_test_scores"]
    assert "voice" in data["per_test_scores"]
