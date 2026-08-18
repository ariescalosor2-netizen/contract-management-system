from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RenewalCreate(BaseModel):
    contract_id: UUID

    renewal_type: str = Field(
        min_length=1,
        max_length=100,
    )

    new_end_date: date

    status: str | None = None


class RenewalUpdate(BaseModel):
    renewal_type: str | None = Field(
        default=None,
        max_length=100,
    )

    new_end_date: date | None = None

    status: str | None = None


class RenewalResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    organization_id: UUID
    contract_id: UUID

    renewal_no: str

    contract_no: str | None = None
    title: str | None = None
    party: str | None = None

    renewal_type: str

    current_end_date: date
    new_end_date: date

    status: str

    created_at: datetime
    updated_at: datetime