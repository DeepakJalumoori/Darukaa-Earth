"""Tests for the sites API."""

from fastapi import status
from fastapi.testclient import TestClient


def test_create_site(client: TestClient):
    """Test site creation and GeoJSON handling."""
    # Register and login
    client.post(
        "/api/auth/register",
        json={
            "email": "site_user@example.com",
            "password": "password",
            "full_name": "Site User",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "site_user@example.com", "password": "password"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create project
    proj_response = client.post(
        "/api/projects",
        headers=headers,
        json={"name": "Site Project", "project_type": "mixed"},
    )
    project_id = proj_response.json()["id"]

    # Create site with GeoJSON Polygon
    # A simple 10x10 degree box roughly near equator
    geojson_polygon = {
        "type": "Polygon",
        "coordinates": [
            [[0.0, 0.0], [10.0, 0.0], [10.0, 10.0], [0.0, 10.0], [0.0, 0.0]]
        ],
    }

    response = client.post(
        "/api/sites",
        headers=headers,
        json={
            "project_id": project_id,
            "name": "Test Site Polygon",
            "geometry": geojson_polygon,
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Site Polygon"
    assert "id" in data
    assert data["project_id"] == project_id
    assert "area_hectares" in data
    assert data["area_hectares"] > 0
    assert data["geometry"]["type"] == "Polygon"


def test_list_sites_for_project(client: TestClient):
    """Test listing sites for a specific project."""
    client.post(
        "/api/auth/register",
        json={
            "email": "sitelist_user@example.com",
            "password": "password",
            "full_name": "Site List User",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "sitelist_user@example.com", "password": "password"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    proj_response = client.post(
        "/api/projects",
        headers=headers,
        json={"name": "Project for List", "project_type": "carbon"},
    )
    project_id = proj_response.json()["id"]

    # Empty initially
    response = client.get(f"/api/sites/project/{project_id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []

    # Add site
    client.post(
        "/api/sites",
        headers=headers,
        json={
            "project_id": project_id,
            "name": "Site 1",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            },
        },
    )

    response = client.get(f"/api/sites/project/{project_id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Site 1"


def test_site_cross_user_authorization(client: TestClient):
    """Test that users cannot access or modify other users' sites."""
    # Setup User A
    client.post(
        "/api/auth/register",
        json={"email": "sa@ex.com", "password": "password123", "full_name": "A"},
    )
    token_a = client.post(
        "/api/auth/login", json={"email": "sa@ex.com", "password": "password123"}
    ).json()["access_token"]

    # User A creates project and site
    proj_a = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"name": "A", "project_type": "carbon"},
    ).json()
    site_a = client.post(
        "/api/sites",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "project_id": proj_a["id"],
            "name": "A",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            },
        },
    ).json()

    # Setup User B
    client.post(
        "/api/auth/register",
        json={"email": "sb@ex.com", "password": "password123", "full_name": "B"},
    )
    token_b = client.post(
        "/api/auth/login", json={"email": "sb@ex.com", "password": "password123"}
    ).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B tries to create site in User A's project
    res = client.post(
        "/api/sites",
        headers=headers_b,
        json={
            "project_id": proj_a["id"],
            "name": "B",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            },
        },
    )
    assert res.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to list sites for User A's project
    res = client.get(f"/api/sites/project/{proj_a['id']}", headers=headers_b)
    assert res.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to get User A's site directly
    res = client.get(f"/api/sites/{site_a['id']}", headers=headers_b)
    assert res.status_code == status.HTTP_404_NOT_FOUND
