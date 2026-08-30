from uuid import UUID
from datetime import date
from decimal import Decimal

from pydantic import BaseModel


# ============================================================
# CREATE CONTRACT
# ============================================================

class ContractCreate(BaseModel):

    title: str

    contract_type_id: UUID

    party_id: UUID

    start_date: date

    end_date: date

    value: Decimal

    description: str | None = None


# ============================================================
# UPDATE CONTRACT
# ============================================================

class ContractUpdate(BaseModel):

    contract_no: str | None = None

    title: str | None = None

    contract_type_id: UUID | None = None

    party_id: UUID | None = None

    status: str | None = None

    start_date: date | None = None

    end_date: date | None = None

    value: Decimal | None = None

    description: str | None = None


# ============================================================
# RESPONSE
# ============================================================

class ContractResponse(BaseModel):

    id: UUID

    organization_id: UUID | None = None

    contract_no: str

    title: str

    contract_type_id: UUID

    party_id: UUID

    status: str

    start_date: date

    end_date: date

    value: Decimal

    description: str | None = None

    class Config:
        from_attributes = True