import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers():
    token = create_access_token(subject="user-test-investigator", role="investigator")
    return {"Authorization": f"Bearer {token}"}


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_login_flow(client):
    # Test invalid login
    bad_res = client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "wrong"})
    assert bad_res.status_code == 401

    # Test valid seeded investigator login
    good_res = client.post("/api/auth/login", json={"email": "investigator@cybercrime.gov.in", "password": "Investigator@123"})
    assert good_res.status_code == 200
    data = good_res.json()["data"]
    assert "access_token" in data
    assert data["user"]["role"] == "investigator"


def test_investigation_creation_and_tracing(client):
    # Login to get real token
    login_res = client.post("/api/auth/login", json={"email": "investigator@cybercrime.gov.in", "password": "Investigator@123"})
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create new investigation
    payload = {
        "case_name": "Test Cyber Incident",
        "case_id": "CASE-TEST-999",
        "wallet_address": "0x71c2b5368a4114299b821430c6e11894d3a011a1",
        "blockchain": "ethereum",
        "max_hops": 3,
        "min_value": 0.5
    }
    create_res = client.post("/api/investigations", json=payload, headers=headers)
    assert create_res.status_code == 200
    inv = create_res.json()["data"]
    assert inv["case_number"] == "CASE-TEST-999"
    assert inv["status"] == "completed"
    inv_id = inv["id"]

    # Check graph
    graph_res = client.get(f"/api/investigations/{inv_id}/graph", headers=headers)
    assert graph_res.status_code == 200
    g_data = graph_res.json()["data"]
    assert len(g_data["nodes"]) > 0

    # Check evidence
    ev_res = client.get(f"/api/investigations/{inv_id}/evidence", headers=headers)
    assert ev_res.status_code == 200
    assert len(ev_res.json()["data"]) > 0

    # Check PDF report generation
    pdf_res = client.post(f"/api/investigations/{inv_id}/report", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # Check SAHYOG request draft preparation
    sahyog_res = client.post(f"/api/sahyog/draft", json={"investigation_id": inv_id}, headers=headers)
    assert sahyog_res.status_code == 200
    s_data = sahyog_res.json()["data"]
    assert s_data["human_review_required"] is True
    assert s_data["status"] == "DRAFT_ONLY"
