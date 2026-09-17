"""Site API endpoints."""

import json
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteResponse
from app.services.analytics import generate_synthetic_analytics

router = APIRouter(prefix="/sites", tags=["sites"])


@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new site within a project."""
    # Verify project exists and belongs to user
    project = (
        db.query(Project)
        .filter(Project.id == data.project_id, Project.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    geojson_str = json.dumps(data.geometry)

    # We use ST_GeomFromGeoJSON to parse the geometry
    # We calculate area in hectares using ST_Area on the geography cast (meters^2) / 10000
    geom_expr = func.ST_SetSRID(func.ST_GeomFromGeoJSON(geojson_str), 4326)
    from geoalchemy2.types import Geography
    from sqlalchemy import cast

    area_expr = func.ST_Area(cast(geom_expr, Geography)) / 10000.0

    # We need to execute the area calculation to store it, or store it in a single insert
    # An easier way is to create the site with the geometry expression, flush to get the DB to evaluate it
    # But wait, area_hectares is a standard column. Let's compute it during insert.
    site = Site(
        project_id=data.project_id,
        name=data.name,
        geometry=geom_expr,
        area_hectares=area_expr,
    )

    db.add(site)
    db.commit()
    db.refresh(site)

    # After creation, generate synthetic analytics data for this site
    generate_synthetic_analytics(db, site.id, project.project_type)

    # We need to return the site in a way that matches SiteResponse (geometry as dict)
    # Since we can't easily read back the WKBElement into a dict automatically in Pydantic,
    # we'll query it back with ST_AsGeoJSON.
    return get_site(site.id, db, current_user)


@router.get("/project/{project_id}", response_model=list[SiteResponse])
def list_sites_for_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List all sites for a specific project."""
    # Verify project
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Query sites with GeoJSON
    sites_query = (
        db.query(Site, func.ST_AsGeoJSON(Site.geometry).label("geojson"))
        .filter(Site.project_id == project_id)
        .all()
    )

    results = []
    for site_obj, geojson_str in sites_query:
        # Construct response dict mapping
        site_dict = {
            "id": site_obj.id,
            "project_id": site_obj.project_id,
            "name": site_obj.name,
            "geometry": json.loads(geojson_str),
            "area_hectares": site_obj.area_hectares,
            "created_at": site_obj.created_at,
            "updated_at": site_obj.updated_at,
        }
        results.append(site_dict)

    return results


@router.get("/{site_id}", response_model=SiteResponse)
def get_site(
    site_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific site by ID."""
    site_query = (
        db.query(Site, func.ST_AsGeoJSON(Site.geometry).label("geojson"))
        .join(Project)
        .filter(Site.id == site_id, Project.user_id == current_user.id)
        .first()
    )

    if not site_query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    site_obj, geojson_str = site_query
    return {
        "id": site_obj.id,
        "project_id": site_obj.project_id,
        "name": site_obj.name,
        "geometry": json.loads(geojson_str),
        "area_hectares": site_obj.area_hectares,
        "created_at": site_obj.created_at,
        "updated_at": site_obj.updated_at,
    }
