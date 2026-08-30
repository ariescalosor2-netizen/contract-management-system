from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class AmendmentCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    contract_id: UUID
    title: str = Field(min_length=1, max_length=255)
    amendment_type: str = Field(min_length=1, max_length=100)
    reason: str = Field(min_length=1)
    description: str = Field(min_length=1)
    amended_value: Decimal | None = None
    new_start_date: date | None = None
    new_end_date: date | None = None
    scope_changes: str | None = None
    effective_date: date | None = None


class AmendmentUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str | None = Field(default=None, min_length=1, max_length=255)
    amendment_type: str | None = Field(default=None, min_length=1, max_length=100)
    reason: str | None = None
    description: str | None = None
    amended_value: Decimal | None = None
    new_start_date: date | None = None
    new_end_date: date | None = None
    scope_changes: str | None = None
    effective_date: date | None = None


class AmendmentDecision(BaseModel):
    remarks: str | None = None
    rejection_reason: str | None = None


class AmendmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    contract_id: UUID
    requested_by: UUID
    amendment_no: str
    title: str | None = None
    amendment_type: str
    reason: str | None = None
    description: str
    amended_value: Decimal | None = None
    new_start_date: date | None = None
    new_end_date: date | None = None
    scope_changes: str | None = None
    effective_date: date | None = None
    status: str
    request_date: date
    approved_date: date | None = None
    rejection_reason: str | None = None
    remarks: str | None = None
    created_at: datetime
    updated_at: datetime