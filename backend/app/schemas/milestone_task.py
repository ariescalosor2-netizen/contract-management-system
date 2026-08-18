from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


# ============================================================
# CREATE TASK
# ============================================================

class MilestoneTaskCreate(BaseModel):

    title: str = Field(
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# UPDATE TASK
# ============================================================

class MilestoneTaskUpdate(BaseModel):

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# RESPONSE
# ============================================================

class MilestoneTaskResponse(BaseModel):

    id: UUID

    milestone_id: UUID

    title: str

    description: str | None = None

    is_completed: bool

    completed_at: datetime | None = None

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = {
        "from_attributes": True,
    }