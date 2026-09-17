"""Tests for the analytics API."""

from fastapi import status
from fastapi.testclient import TestClient


def test_site_analytics_generation_and_retrieval(client: TestClient):
    """Test that creating a site automatically generates analytics and they can be retrieved."""
    # Setup user and project
    client.post(
        "/api/auth/register",
        json={
            "email": "analytics_user@example.com",
            "password": "password",
            "full_name": "Analytics User",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "analytics_user@example.com", "password": "password"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    proj_response = client.post(
        "/api/projects",
        headers=headers,
        json={"name": "Analytics Project", "project_type": "carbon"},
    )
    project_id = proj_response.json()["id"]

    # Create site
    site_response = client.post(
        "/api/sites",
        headers=headers,
        json={
            "project_id": project_id,
            "name": "Analytics Site",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            },
        },
    )
    site_id = site_response.json()["id"]

    # Retrieve analytics
    analytics_response = client.get(f"/api/analytics/site/{site_id}", headers=headers)
    assert analytics_response.status_code == status.HTTP_200_OK

    data = analytics_response.json()
    # Should have generated 12 months of synthetic data
    assert len(data) == 12

    # Verify records have the correct fields
    first_record = data[0]
    assert "carbon_sequestration_tons" in first_record
    assert "biodiversity_index" in first_record
    assert "ndvi" in first_record
    assert "recorded_date" in first_record


def test_analytics_cross_user_authorization(client: TestClient):
    """Test that users cannot access other users' analytics."""
    # Setup User A
    client.post(
        "/api/auth/register",
        json={"email": "aa@ex.com", "password": "password123", "full_name": "A"},
    )
    token_a = client.post(
        "/api/auth/login", json={"email": "aa@ex.com", "password": "password123"}
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
        json={"email": "ab@ex.com", "password": "password123", "full_name": "B"},
    )
    token_b = client.post(
        "/api/auth/login", json={"email": "ab@ex.com", "password": "password123"}
    ).json()["access_token"]

    # User B tries to get User A's site analytics
    res = client.get(
        f"/api/analytics/site/{site_a['id']}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == status.HTTP_404_NOT_FOUND
