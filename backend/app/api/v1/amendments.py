from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db

from app.models.user import User

from app.schemas.amendment import (
    AmendmentCreate,
    AmendmentUpdate,
)

from app.services.amendment_service import (
    AmendmentService,
)

from app.services.approval_service import (
    ApprovalService,
)


router = APIRouter()


# ============================================================
# SERIALIZER
# ============================================================

def serialize_amendment(amendment):

    contract = getattr(
        amendment,
        "contract",
        None,
    )

    requester = getattr(
        amendment,
        "requester",
        None,
    )

    requester_name = None

    if requester:

        first_name = (
            getattr(
                requester,
                "first_name",
                "",
            )
            or ""
        )

        last_name = (
            getattr(
                requester,
                "last_name",
                "",
            )
            or ""
        )

        requester_name = (
            f"{first_name} {last_name}"
        ).strip()

    return {

        "id":
            str(amendment.id),

        "organization_id":
            str(
                amendment.organization_id
            ),

        "contract_id":
            str(
                amendment.contract_id
            ),

        "amendment_no":
            amendment.amendment_no,

        "title":
            amendment.title,

        "amendment_type":
            amendment.amendment_type,

        "description":
            amendment.description,

        "reason":
            amendment.reason,

        "original_value":
            amendment.original_value,

        "amended_value":
            amendment.amended_value,

        "original_start_date":
            amendment.original_start_date,

        "original_end_date":
            amendment.original_end_date,

        "new_start_date":
            amendment.new_start_date,

        "new_end_date":
            amendment.new_end_date,

        "scope_changes":
            amendment.scope_changes,

        "requested_by":
            str(
                amendment.requested_by
            ),

        "status":
            amendment.status,

        "request_date":
            amendment.request_date,

        "effective_date":
            amendment.effective_date,

        "rejection_reason":
            amendment.rejection_reason,

        "approved_date":
            amendment.approved_at,

        "remarks":
            getattr(
                amendment,
                "remarks",
                None,
            ),

        "created_at":
            amendment.created_at,

        "updated_at":
            amendment.updated_at,

        # ----------------------------------------------------
        # CONTRACT DISPLAY DATA
        # ----------------------------------------------------

        "contract_no":
            (
                getattr(
                    contract,
                    "contract_no",
                    None,
                )
                if contract
                else None
            ),

        "contract_title":
            (
                getattr(
                    contract,
                    "title",
                    None,
                )
                if contract
                else None
            ),

        # ----------------------------------------------------
        # REQUESTER DISPLAY DATA
        # ----------------------------------------------------

        "requester_name":
            requester_name,
    }


# ============================================================
# GET ALL AMENDMENTS
# ============================================================

@router.get("/")
def get_amendments(

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        amendments = (
            AmendmentService.get_all(
                db,
                current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Amendments retrieved successfully.",

            "data": [

                serialize_amendment(
                    amendment
                )

                for amendment in amendments

            ],
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# GET AMENDMENT SUMMARY
# ============================================================

@router.get("/summary")
def get_amendment_summary(

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        amendments = (
            AmendmentService.get_all(
                db,
                current_user.organization_id,
            )
        )

        total = len(
            amendments
        )

        approved = sum(
            1
            for item in amendments
            if str(
                item.status or ""
            ).strip().lower()
            == "approved"
        )

        pending = sum(
            1
            for item in amendments
            if str(
                item.status or ""
            ).strip().lower()
            in {
                "pending",
                "pending approval",
            }
        )

        rejected = sum(
            1
            for item in amendments
            if str(
                item.status or ""
            ).strip().lower()
            == "rejected"
        )

        return {

            "success":
                True,

            "message":
                "Amendment summary retrieved successfully.",

            "data": {

                "total":
                    total,

                "approved":
                    approved,

                "pending":
                    pending,

                "rejected":
                    rejected,
            },
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# GET AMENDMENTS FOR CONTRACT
# ============================================================

@router.get(
    "/contract/{contract_id}"
)
def get_contract_amendments(

    contract_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        amendments = (
            AmendmentService.get_by_contract(
                db,
                contract_id,
                current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Contract amendments retrieved successfully.",

            "data": [

                serialize_amendment(
                    amendment
                )

                for amendment in amendments

            ],
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# GET SINGLE AMENDMENT
# ============================================================

@router.get(
    "/{amendment_id}"
)
def get_amendment(

    amendment_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        amendment = (
            AmendmentService.get_by_id(
                db,
                amendment_id,
                current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Amendment retrieved successfully.",

            "data":
                serialize_amendment(
                    amendment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# CREATE AMENDMENT
# ============================================================
#
# Flow:
#
# Existing Contract
#        ↓
# Create Amendment
#        ↓
# Amendment = Pending
#        ↓
# Create Amendment Approval
#
# IMPORTANT:
#
# This does NOT use ApprovalService.create()
# because that method belongs to contract approvals.
#
# ============================================================

@router.post(
    "/",
    status_code=
        status.HTTP_201_CREATED,
)
def create_amendment(

    data: AmendmentCreate,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        # ----------------------------------------------------
        # CREATE AMENDMENT
        # ----------------------------------------------------

        amendment = (
            AmendmentService.create(

                db=db,

                organization_id=
                    current_user.organization_id,

                requested_by=
                    current_user.id,

                contract_id=
                    data.contract_id,

                title=
                    data.title,

                amendment_type=
                    data.amendment_type,

                description=
                    data.description,

                reason=
                    data.reason,

                amended_value=
                    data.amended_value,

                new_start_date=
                    data.new_start_date,

                new_end_date=
                    data.new_end_date,

                scope_changes=
                    data.scope_changes,

                effective_date=
                    data.effective_date,
            )
        )

        # ----------------------------------------------------
        # CREATE AMENDMENT APPROVAL
        # ----------------------------------------------------

        ApprovalService.create_amendment_approval(

            db=db,

            organization_id=
                current_user.organization_id,

            amendment_id=
                amendment.id,

            approver_id=
                current_user.id,

            remarks=
                "Amendment submitted for approval.",
        )

        return {

            "success":
                True,

            "message":
                "Amendment created and submitted for approval successfully.",

            "data":
                serialize_amendment(
                    amendment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# UPDATE AMENDMENT
# ============================================================

@router.put(
    "/{amendment_id}"
)
def update_amendment(

    amendment_id: UUID,

    data: AmendmentUpdate,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        update_data = (
            data.model_dump(
                exclude_unset=True
            )
        )

        amendment = (
            AmendmentService.update(

                db=db,

                amendment_id=
                    amendment_id,

                organization_id=
                    current_user.organization_id,

                **update_data,
            )
        )

        return {

            "success":
                True,

            "message":
                "Amendment updated successfully.",

            "data":
                serialize_amendment(
                    amendment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# DELETE / CANCEL AMENDMENT
# ============================================================

@router.delete(
    "/{amendment_id}"
)
def delete_amendment(

    amendment_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        amendment = (
            AmendmentService.delete(

                db=db,

                amendment_id=
                    amendment_id,

                organization_id=
                    current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Amendment deleted successfully.",

            "data":
                serialize_amendment(
                    amendment
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )