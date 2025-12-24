import pytest
from httpx import AsyncClient
from app.main import app
from app.core.database import get_db
from sqlalchemy.orm import Session
import os

# Override database URL for testing if needed
os.environ["DATABASE_URL"] = "postgresql://postgres:password@localhost:5432/test_feeds_db"

@pytest.fixture
def db():
    from app.core.database import SessionLocal, Base, engine
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.mark.asyncio
async def test_login():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post("/api/v1/auth/login", data={"username": "ADMIN001", "password": "admin123"})
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_get_users():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # Login first
        login_response = await client.post("/api/v1/auth/login", data={"username": "ADMIN001", "password": "admin123"})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/api/v1/users/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.asyncio
async def test_get_categories():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.get("/api/v1/categories/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

@pytest.mark.asyncio
async def test_get_feedbacks():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # Login
        login_response = await client.post("/api/v1/auth/login", data={"username": "ADMIN001", "password": "admin123"})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/api/v1/feedbacks/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.asyncio
async def test_get_statistics():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # Login
        login_response = await client.post("/api/v1/auth/login", data={"username": "ADMIN001", "password": "admin123"})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/api/v1/statistics/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_feedbacks" in data