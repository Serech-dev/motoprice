import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, init_db
from app.services.seed_data import seed_database
from app.models.shop import Shop
from app.models.user import User

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()
    db = SessionLocal()
    seed_database(db)
    db.close()

client = TestClient(app)

def test_login_success():
    response = client.post("/api/auth/login", json={
        "email": "demo@motoprice.com",
        "password": "demo123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert len(data["token"]) == 64
    assert data["user"]["email"] == "demo@motoprice.com"
    assert data["user"]["role"] == "mostrador"
    assert data["license"]["is_valid"] is True
    assert data["license"]["license_status"] == "trial"
    assert data["license"]["days_remaining"] >= 29

def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "email": "demo@motoprice.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "incorrectos" in response.json()["detail"].lower()

def test_auth_me_and_logout():
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": "admin@motoprice.com",
        "password": "admin123"
    })
    token = login_res.json()["token"]

    # 2. Get profile with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user"]["email"] == "admin@motoprice.com"
    assert me_data["user"]["role"] == "admin"
    assert me_data["shop"]["name"] == "Moto Repuestos Demo"

    # 3. Check License endpoint
    lic_res = client.get("/api/auth/license", headers={"Authorization": f"Bearer {token}"})
    assert lic_res.status_code == 200
    lic_data = lic_res.json()
    assert lic_data["monthly_fee_ars"] == 30000.0

    # 4. Logout
    logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200

    # 5. Subsequent request should be 401
    me_after_logout = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_after_logout.status_code == 401

