"""Analytics API endpoints."""

import uuid
from collections.abc import Sequence

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.analytics import SiteAnalytics
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.analytics import SiteAnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/site/{site_id}", response_model=list[SiteAnalyticsResponse])
def get_site_analytics(
    site_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Sequence[SiteAnalytics]:
    """Get time-series analytics data for a specific site."""
    # Verify site belongs to user's project
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.user_id == current_user.id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    # Retrieve analytics ordered by timestamp
    analytics = (
        db.query(SiteAnalytics)
        .filter(SiteAnalytics.site_id == site_id)
        .order_by(SiteAnalytics.recorded_date.asc())
        .all()
    )

    return analytics
