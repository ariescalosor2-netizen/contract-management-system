from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


# ============================================================
# PAYMENT BASE
# ============================================================

class PaymentBase(BaseModel):

    payment_no: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    payment_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    amount: Decimal = Field(
        ...,
        gt=0,
    )

    payment_date: date | None = None

    due_date: date | None = None

    status: str = Field(
        default="Pending",
        min_length=1,
        max_length=50,
    )

    reference_no: str | None = Field(
        default=None,
        max_length=100,
    )

    remarks: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# CREATE PAYMENT
# ============================================================
#
# payment_no is OPTIONAL because the backend
# automatically generates it.
#
# Example:
# PAY-2026-0001
#
# ============================================================

class PaymentCreate(BaseModel):

    contract_id: UUID

    payment_no: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    payment_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    amount: Decimal = Field(
        ...,
        gt=0,
    )

    payment_date: date | None = None

    due_date: date | None = None

    reference_no: str | None = Field(
        default=None,
        max_length=100,
    )

    remarks: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# UPDATE PAYMENT
# ============================================================

class PaymentUpdate(BaseModel):

    contract_id: UUID | None = None

    payment_no: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    payment_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    amount: Decimal | None = Field(
        default=None,
        gt=0,
    )

    payment_date: date | None = None

    due_date: date | None = None

    status: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    reference_no: str | None = Field(
        default=None,
        max_length=100,
    )

    remarks: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# SUBMIT PAYMENT FOR VERIFICATION
# ============================================================

class PaymentSubmitRequest(BaseModel):

    reference_no: str | None = Field(
        default=None,
        max_length=100,
    )

    remarks: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# PAYMENT DECISION
# ============================================================
#
# Used for:
#
# For Review -> Paid
# For Review -> Rejected
#
# ============================================================

class PaymentDecisionRequest(BaseModel):

    remarks: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# PAYMENT RESPONSE
# ============================================================

class PaymentResponse(BaseModel):

    id: UUID

    organization_id: UUID

    contract_id: UUID

    payment_no: str

    payment_type: str

    amount: Decimal

    payment_date: date | None = None

    due_date: date | None = None

    status: str

    reference_no: str | None = None

    remarks: str | None = None

    created_at: datetime | None = None

    updated_at: datetime | None = None

    contract_no: str | None = None

    contract_title: str | None = None

    model_config = {
        "from_attributes": True
    }