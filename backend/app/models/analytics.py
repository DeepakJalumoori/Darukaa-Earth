"""Site analytics time-series model."""

import uuid
from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SiteAnalytics(Base):
    """Monthly environmental monitoring data for a site."""

    __tablename__ = "site_analytics"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recorded_date: Mapped[date] = mapped_column(Date, nullable=False)
    carbon_sequestration_tons: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    biodiversity_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    ndvi: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_moisture_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    canopy_cover_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    # Relationships
    site: Mapped["Site"] = relationship(back_populates="analytics")  # noqa: F821

    # One record per site per date
    __table_args__ = (
        UniqueConstraint("site_id", "recorded_date", name="uq_site_date"),
    )

    def __repr__(self) -> str:
        return f"<SiteAnalytics site={self.site_id} date={self.recorded_date}>"
