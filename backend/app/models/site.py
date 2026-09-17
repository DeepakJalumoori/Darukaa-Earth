"""Site database model with PostGIS geometry."""

import uuid
from datetime import UTC, datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Site(Base):
    """Geographic site within a project, stored as a PostGIS polygon."""

    __tablename__ = "sites"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    geometry: Mapped[str] = mapped_column(
        Geometry(geometry_type="POLYGON", srid=4326), nullable=False
    )
    area_hectares: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    # Relationships
    project: Mapped["Project"] = relationship(back_populates="sites")  # noqa: F821
    analytics: Mapped[list["SiteAnalytics"]] = relationship(  # noqa: F821
        back_populates="site", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Site {self.name}>"
