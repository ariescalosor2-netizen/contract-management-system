from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ApprovalCreate(BaseModel):
    contract_id: UUID

    approver_id: UUID | None = None

    remarks: str | None = Field(
        default=None,
        max_length=2000,
    )


class ApprovalDecision(BaseModel):
    remarks: str | None = Field(
        default=None,
        max_length=2000,
    )


class ApprovalResponse(BaseModel):
    id: UUID
    organization_id: UUID
    contract_id: UUID
    approver_id: UUID
    decision: str
    remarks: str | None
    approved_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )