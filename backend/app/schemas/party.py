from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PartyBase(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=255,
    )

    type: str = Field(
        min_length=1,
        max_length=50,
    )

    email: str | None = Field(
        default=None,
        max_length=255,
    )

    contact: str | None = Field(
        default=None,
        max_length=50,
    )

    status: str = "Active"


class CreateParty(PartyBase):
    pass


class UpdateParty(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    email: str | None = Field(
        default=None,
        max_length=255,
    )

    contact: str | None = Field(
        default=None,
        max_length=50,
    )

    status: str | None = None


class PartyResponse(BaseModel):
    id: UUID
    name: str
    type: str
    email: str | None
    contact: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )