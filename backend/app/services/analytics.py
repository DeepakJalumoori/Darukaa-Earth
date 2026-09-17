"""Analytics service for generating and retrieving data."""

import math
import random
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.models.analytics import SiteAnalytics


def generate_synthetic_analytics(
    db: Session, site_id: uuid.UUID, project_type: str
) -> None:
    """Generate 12 months of synthetic analytics data for a new site."""
    now = datetime.now(UTC)

    analytics_records = []

    for month in range(12):
        # Go back in time up to 12 months, starting from 11 months ago to now
        record_date = now - timedelta(days=30 * (11 - month))

        # Base values depend on project type
        if project_type == "carbon":
            base_carbon = 10.0 + (month * 1.5)  # Increasing trend
            base_bio = 0.5 + (month * 0.01)
            base_ndvi = 0.6 + (math.sin(month) * 0.1)  # Seasonal fluctuation
        elif project_type == "biodiversity":
            base_carbon = 5.0 + (month * 0.2)
            base_bio = 0.4 + (month * 0.05)  # Increasing trend
            base_ndvi = 0.7 + (month * 0.02)
        else:  # mixed
            base_carbon = 7.0 + (month * 0.8)
            base_bio = 0.45 + (month * 0.03)
            base_ndvi = 0.65 + (math.sin(month) * 0.05)

        # Add some random noise
        carbon = max(0.0, base_carbon + random.uniform(-1.0, 1.0))
        bio = max(0.0, min(1.0, base_bio + random.uniform(-0.05, 0.05)))
        ndvi = max(0.0, min(1.0, base_ndvi + random.uniform(-0.05, 0.05)))

        analytics_records.append(
            SiteAnalytics(
                site_id=site_id,
                recorded_date=record_date.date(),
                carbon_sequestration_tons=round(carbon, 2),
                biodiversity_index=round(bio, 3),
                ndvi=round(ndvi, 3),
                soil_moisture_pct=round(random.uniform(20.0, 60.0), 1),
                canopy_cover_pct=round(random.uniform(10.0, 90.0), 1),
            )
        )

    db.add_all(analytics_records)
    db.commit()
