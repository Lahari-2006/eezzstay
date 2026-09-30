import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app.database import init_db
from app.services.seed_data import seed_database

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()
    await seed_database()

@pytest.mark.asyncio
async def test_demo_mode_gating_disabled():
    """
    Ensure that when settings.DEMO_MODE is False (the default),
    calling /api/auth/demo-login returns 403 Forbidden.
    """
    settings.DEMO_MODE = False
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/demo-login", json={"role": "admin"})
        assert response.status_code == 403
        data = response.json()
        assert "strictly disabled" in data["detail"]

@pytest.mark.asyncio
async def test_demo_status_endpoint():
    """
    Ensure /api/auth/demo-status reports current DEMO_MODE accurately.
    """
    settings.DEMO_MODE = False
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/auth/demo-status")
        assert response.status_code == 200
        assert response.json()["demo_mode_enabled"] is False

@pytest.mark.asyncio
async def test_demo_mode_enabled_login():
    """
    Ensure that when DEMO_MODE is True, demo login works and issues a valid token.
    """
    settings.DEMO_MODE = True
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/demo-login", json={"role": "student"})
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "student@ezeestayy.com"
        assert data["user"]["role"] == "student"

    # Reset back to False for security test isolation
    settings.DEMO_MODE = False

@pytest.mark.asyncio
async def test_real_login_bcrypt_student_and_admin():
    """
    Ensure real credentials login with bcrypt verification functions correctly
    for both student and admin roles.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Test student login
        res_student = await ac.post("/api/auth/login", json={
            "email": "student@ezeestayy.com",
            "password": "password123"
        })
        assert res_student.status_code == 200
        data_student = res_student.json()
        assert "access_token" in data_student
        assert data_student["user"]["role"] == "student"

        # Test partner login
        res_partner = await ac.post("/api/auth/login", json={
            "email": "partner@ezeestayy.com",
            "password": "password123"
        })
        assert res_partner.status_code == 200
        data_partner = res_partner.json()
        assert data_partner["user"]["role"] == "hostel_owner"

        # Test admin login
        res_admin = await ac.post("/api/auth/login", json={
            "email": "admin@ezeestayy.com",
            "password": "password123"
        })
        assert res_admin.status_code == 200
        data_admin = res_admin.json()
        assert data_admin["user"]["role"] == "admin"

        # Test wrong password fails with 401
        res_wrong = await ac.post("/api/auth/login", json={
            "email": "admin@ezeestayy.com",
            "password": "wrongpassword"
        })
        assert res_wrong.status_code == 401

