"""Tests for authentication API routes."""

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.auth import hash_password


def test_register_user_success(client: TestClient, db_session: Session):
    """Test successful user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "SecurePassword123!",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
    assert "password" not in data

    # Verify user exists in database
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    assert user is not None


def test_register_user_duplicate_email(client: TestClient, db_session: Session):
    """Test registration with an already used email fails with 409."""
    # Seed a user
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "full_name": "Another User",
            "password": "AnotherPassword123!",
        },
    )

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json()["detail"] == "Email already registered"


def test_login_success(client: TestClient, db_session: Session):
    """Test successful login returns a JWT token."""
    # Seed a user
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client: TestClient, db_session: Session):
    """Test login with incorrect password fails with 401."""
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"


def test_get_me_success(client: TestClient, db_session: Session):
    """Test fetching current user profile with valid JWT."""
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()

    # Login to get token
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )
    token = login_response.json()["access_token"]

    # Fetch profile
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"


def test_get_me_unauthorized(client: TestClient):
    """Test fetching current user profile without token fails with 401."""
    response = client.get("/api/auth/me")
    # HTTPBearer returns 403 or 401 (in newer versions) when no token is provided
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
