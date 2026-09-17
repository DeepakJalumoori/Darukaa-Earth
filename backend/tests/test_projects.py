"""Tests for the projects API."""

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.project import Project


def test_create_project(client: TestClient, db_session: Session):
    """Test project creation."""
    # Register and login first
    client.post(
        "/api/auth/register",
        json={
            "email": "proj_user@example.com",
            "password": "password",
            "full_name": "Project User",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "proj_user@example.com", "password": "password"},
    )
    token = login_response.json()["access_token"]

    # Create project
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/projects",
        headers=headers,
        json={
            "name": "Test Carbon Project",
            "description": "A test project",
            "project_type": "carbon",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Carbon Project"
    assert "id" in data

    # Verify in DB
    db_project = db_session.query(Project).filter(Project.id == data["id"]).first()
    assert db_project is not None
    assert db_project.project_type == "carbon"


def test_list_projects(client: TestClient):
    """Test listing projects."""
    client.post(
        "/api/auth/register",
        json={
            "email": "list_user@example.com",
            "password": "password",
            "full_name": "List User",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "list_user@example.com", "password": "password"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Empty list initially
    response = client.get("/api/projects", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []

    # Create a project
    client.post(
        "/api/projects",
        headers=headers,
        json={"name": "Project 1", "project_type": "biodiversity"},
    )

    # List again
    response = client.get("/api/projects", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Project 1"


def test_project_cross_user_authorization(client: TestClient):
    """Test that users cannot access other users' projects."""
    # Setup User A
    client.post(
        "/api/auth/register",
        json={"email": "pa@ex.com", "password": "password123", "full_name": "A"},
    )
    token_a = client.post(
        "/api/auth/login", json={"email": "pa@ex.com", "password": "password123"}
    ).json()["access_token"]

    # User A creates project
    proj_a = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"name": "A", "project_type": "carbon"},
    ).json()
    proj_id = proj_a["id"]

    # Setup User B
    client.post(
        "/api/auth/register",
        json={"email": "pb@ex.com", "password": "password123", "full_name": "B"},
    )
    token_b = client.post(
        "/api/auth/login", json={"email": "pb@ex.com", "password": "password123"}
    ).json()["access_token"]

    # User B tries to get User A's project
    res = client.get(
        f"/api/projects/{proj_id}", headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res.status_code == status.HTTP_404_NOT_FOUND
