from uuid import UUID
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pydantic import BaseModel, Field

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
)

from app.services.payment_service import (
    PaymentService,
)

from app.core.security import (
    get_current_user,
)

from app.models.user import User


router = APIRouter()


# ============================================================
# REQUEST SCHEMAS
# ============================================================
# These are defined here because the current
# app.schemas.payment does not contain them.
#
# PaymentCreate / PaymentUpdate remain in:
# app.schemas.payment
# ============================================================


class PaymentSubmitRequest(BaseModel):
    reference_no: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    remarks: Optional[str] = Field(
        default=None,
        max_length=2000,
    )


class PaymentDecisionRequest(BaseModel):
    remarks: Optional[str] = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# SERIALIZER
# ============================================================

def serialize_payment(payment):

    contract = getattr(
        payment,
        "contract",
        None,
    )

    return {

        "id":
            str(payment.id),

        "organization_id":
            str(
                payment.organization_id
            ),

        "contract_id":
            str(
                payment.contract_id
            ),

        "payment_no":
            payment.payment_no,

        "payment_type":
            payment.payment_type,

        "amount":
            payment.amount,

        "payment_date":
            payment.payment_date,

        "due_date":
            payment.due_date,

        "status":
            payment.status,

        "reference_no":
            payment.reference_no,

        "remarks":
            payment.remarks,

        "created_at":
            payment.created_at,

        "updated_at":
            payment.updated_at,

        "contract_no":
            (
                contract.contract_no
                if contract
                else None
            ),

        "contract_title":
            (
                contract.title
                if contract
                else None
            ),
    }


# ============================================================
# GET ALL PAYMENTS
# ============================================================

@router.get("/")
def get_payments(

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    payments = (
        PaymentService.get_all(
            db,
            current_user.organization_id,
        )
    )

    return {

        "success":
            True,

        "message":
            "Payments retrieved successfully.",

        "data": [

            serialize_payment(
                payment
            )

            for payment in payments

        ],
    }


# ============================================================
# GET PAYMENTS BY CONTRACT
# ============================================================

@router.get(
    "/contract/{contract_id}"
)
def get_contract_payments(

    contract_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        payments = (
            PaymentService.get_by_contract(
                db,
                contract_id,
                current_user.organization_id,
            )
        )

        summary = (
            PaymentService.get_payment_summary(
                db,
                contract_id,
                current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Contract payments retrieved successfully.",

            "data": [

                serialize_payment(
                    payment
                )

                for payment in payments

            ],

            "summary":
                summary,
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# GET SINGLE PAYMENT
# ============================================================

@router.get(
    "/{payment_id}"
)
def get_payment(

    payment_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        payment = (
            PaymentService.get_by_id(
                db,
                payment_id,
                current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Payment retrieved successfully.",

            "data":
                serialize_payment(
                    payment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# CREATE PAYMENT
#
# New Payment
#       ↓
# Pending
# ============================================================

@router.post(
    "/",
    status_code=
        status.HTTP_201_CREATED,
)
def create_payment(

    data: PaymentCreate,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        payment = (
            PaymentService.create(

                db=db,

                organization_id=(
                    current_user.organization_id
                ),

                contract_id=
                    data.contract_id,

                payment_no=
                    data.payment_no,

                payment_type=
                    data.payment_type,

                amount=
                    data.amount,

                payment_date=
                    data.payment_date,

                due_date=
                    data.due_date,

                reference_no=
                    data.reference_no,

                remarks=
                    data.remarks,
            )
        )

        return {

            "success":
                True,

            "message":
                "Payment created successfully.",

            "data":
                serialize_payment(
                    payment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# SUBMIT PAYMENT FOR VERIFICATION
#
# Pending
#    ↓
# For Review
# ============================================================

@router.put(
    "/{payment_id}/submit"
)
def submit_payment_for_verification(

    payment_id: UUID,

    data: PaymentSubmitRequest,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        payment = (
            PaymentService.submit_for_verification(

                db=db,

                payment_id=
                    payment_id,

                organization_id=(
                    current_user.organization_id
                ),

                reference_no=
                    data.reference_no,

                remarks=
                    data.remarks,
            )
        )

        return {

            "success":
                True,

            "message":
                (
                    "Payment submitted for "
                    "verification successfully."
                ),

            "data":
                serialize_payment(
                    payment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# CONFIRM PAYMENT
#
# For Review
#      ↓
# Paid
# ============================================================

@router.put(
    "/{payment_id}/confirm"
)
def confirm_payment(

    payment_id: UUID,

    data: PaymentDecisionRequest,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        payment = (
            PaymentService.confirm_received(

                db=db,

                payment_id=
                    payment_id,

                organization_id=(
                    current_user.organization_id
                ),

                remarks=
                    data.remarks,
            )
        )

        return {

            "success":
                True,

            "message":
                "Payment confirmed successfully.",

            "data":
                serialize_payment(
                    payment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# REJECT PAYMENT
#
# For Review
#      ↓
# Rejected
# ============================================================

@router.put(
    "/{payment_id}/reject"
)
def reject_payment(

    payment_id: UUID,

    data: PaymentDecisionRequest,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        payment = (
            PaymentService.reject(

                db=db,

                payment_id=
                    payment_id,

                organization_id=(
                    current_user.organization_id
                ),

                remarks=
                    data.remarks,
            )
        )

        return {

            "success":
                True,

            "message":
                "Payment rejected successfully.",

            "data":
                serialize_payment(
                    payment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# UPDATE PAYMENT
#
# IMPORTANT:
# This does NOT change payment status.
#
# Status transitions use:
# /submit
# /confirm
# /reject
# ============================================================

@router.put(
    "/{payment_id}"
)
def update_payment(

    payment_id: UUID,

    data: PaymentUpdate,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        payment = (
            PaymentService.update(

                db=db,

                payment_id=
                    payment_id,

                organization_id=(
                    current_user.organization_id
                ),

                contract_id=
                    data.contract_id,

                payment_no=
                    data.payment_no,

                payment_type=
                    data.payment_type,

                amount=
                    data.amount,

                payment_date=
                    data.payment_date,

                due_date=
                    data.due_date,

                reference_no=
                    data.reference_no,

                remarks=
                    data.remarks,
            )
        )

        return {

            "success":
                True,

            "message":
                "Payment updated successfully.",

            "data":
                serialize_payment(
                    payment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# DELETE PAYMENT
# ============================================================

@router.delete(
    "/{payment_id}"
)
def delete_payment(

    payment_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(
            get_current_user
        ),

):

    try:

        PaymentService.delete(

            db=db,

            payment_id=
                payment_id,

            organization_id=(
                current_user.organization_id
            ),
        )

        return {

            "success":
                True,

            "message":
                "Payment deleted successfully.",
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )