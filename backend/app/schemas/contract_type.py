from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ContractTypeBase(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    description: str | None = None

    icon: str | None = Field(
        default=None,
        max_length=20,
    )

    status: str = "Active"


class CreateContractType(ContractTypeBase):
    pass


class UpdateContractType(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    description: str | None = None

    icon: str | None = Field(
        default=None,
        max_length=20,
    )

    status: str | None = None


class ContractTypeResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    icon: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )