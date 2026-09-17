"""Site API schemas."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SiteBase(BaseModel):
    """Base schema for Site."""

    name: str = Field(..., max_length=255)


class SiteCreate(SiteBase):
    """Schema for creating a new site."""

    project_id: uuid.UUID
    # GeoJSON geometry object
    geometry: dict[str, Any] = Field(
        ..., description="GeoJSON Geometry object (Polygon or MultiPolygon)"
    )


class SiteResponse(SiteBase):
    """Schema for a site response."""

    id: uuid.UUID
    project_id: uuid.UUID
    geometry: dict[str, Any] = Field(description="GeoJSON Geometry object")
    area_hectares: float | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
