import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database()

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["service"] == "FraudGuard AI"

def test_auth_login(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "analyst@fraudguard.ai", "password": "Analyst@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "analyst"

def test_predict_legitimate_transaction(client):
    payload = {
        "TransactionAmt": 45.00,
        "ProductCD": "W",
        "card4": "visa",
        "card6": "debit",
        "P_emaildomain": "gmail.com",
        "C1": 1.0,
        "dist1": 5.0
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] in ["ALLOW", "REVIEW"]
    assert data["risk_score"] < 0.50
    assert len(data["top_risk_factors"]) > 0

def test_predict_fraud_transaction(client):
    payload = {
        "TransactionAmt": 4850.00,
        "ProductCD": "C",
        "card4": "mastercard",
        "card6": "credit",
        "P_emaildomain": "protonmail.com",
        "C1": 18.0,
        "dist1": 1200.0
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "BLOCK"
    assert data["risk_score"] >= 0.70
    assert len(data["rules_triggered"]) > 0

def test_get_benchmarks(client):
    response = client.get("/api/v1/models/benchmarks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8
    methods = [b["method_name"] for b in data]
    assert "Baseline LightGBM" in methods
    assert "Class-weighted LightGBM" in methods
    assert "SMOTENC (50% Pilot)" in methods
    assert "Random Undersampling" in methods

def test_rules_and_thresholds(client):
    response = client.get("/api/v1/rules")
    assert response.status_code == 200
    assert len(response.json()) >= 6

    threshold_res = client.get("/api/v1/rules/thresholds")
    assert threshold_res.status_code == 200
    t_data = threshold_res.json()
    assert t_data["allow_threshold"] == 0.35
    assert t_data["review_threshold"] == 0.70

def test_analytics_kpis(client):
    response = client.get("/api/v1/analytics/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_scanned" in data
    assert "fraud_rate" in data
    assert "blocked_count" in data

def test_system_status(client):
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["verification_checklist"]["notebook_copied"]["verified"] is True
