"""Analytics API schemas."""

import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict


class SiteAnalyticsResponse(BaseModel):
    """Schema for site analytics response."""

    id: uuid.UUID
    site_id: uuid.UUID
    recorded_date: date
    carbon_sequestration_tons: float | None
    biodiversity_index: float | None
    ndvi: float | None
    soil_moisture_pct: float | None
    canopy_cover_pct: float | None

    model_config = ConfigDict(from_attributes=True)
