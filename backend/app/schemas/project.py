"""Project API schemas."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    """Base schema for Project."""

    name: str = Field(..., max_length=255)
    description: str | None = None
    project_type: Literal["carbon", "biodiversity", "mixed"]


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""

    pass


class ProjectResponse(ProjectBase):
    """Schema for a project response."""

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
