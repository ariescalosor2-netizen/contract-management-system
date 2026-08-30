from uuid import UUID

from pydantic import BaseModel, Field


class ContractPartyCreate(BaseModel):
    party_id: UUID
    role: str = Field(default="Party", min_length=1, max_length=100)


class ContractPartyUpdate(BaseModel):
    role: str = Field(min_length=1, max_length=100)
