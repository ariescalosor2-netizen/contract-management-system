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

from app.schemas.approval import (
    ApprovalCreate,
    ApprovalDecision,
)

from app.services.approval_service import (
    ApprovalService,
)


router = APIRouter()


# ============================================================
# ADMIN CHECK
# ============================================================

def require_admin(
    current_user: User,
):
    role_name = ""

    if current_user.role:
        role_name = str(
            current_user.role.name
        ).strip().lower()

    allowed_roles = {
        "admin",
        "administrator",
    }

    if role_name not in allowed_roles:
        raise HTTPException(
            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "Administrator access is required for approvals.",
        )

    return current_user


# ============================================================
# USER NAME
# ============================================================

def get_user_name(user):

    if not user:
        return None

    first_name = getattr(
        user,
        "first_name",
        None,
    )

    last_name = getattr(
        user,
        "last_name",
        None,
    )

    full_name = " ".join(
        part
        for part in [
            first_name,
            last_name,
        ]
        if part
    ).strip()

    if full_name:
        return full_name

    name = getattr(
        user,
        "name",
        None,
    )

    if name:
        return name

    username = getattr(
        user,
        "username",
        None,
    )

    if username:
        return username

    return getattr(
        user,
        "email",
        None,
    )


# ============================================================
# SERIALIZER
# ============================================================

def serialize_approval(
    approval,
):

    contract = getattr(
        approval,
        "contract",
        None,
    )

    amendment = getattr(
        approval,
        "amendment",
        None,
    )

    requester = None

    if amendment:
        requester = getattr(
            amendment,
            "requester",
            None,
        )

    approver = getattr(
        approval,
        "approver",
        None,
    )

    # ========================================================
    # TYPE
    # ========================================================

    if approval.amendment_id:
        approval_type = "Amendment"
    elif approval.contract_id:
        approval_type = "Contract"
    else:
        approval_type = "Unknown"

    # ========================================================
    # CONTRACT DETAILS
    # ========================================================

    contract_data = {
        "contract_no": (
            getattr(
                contract,
                "contract_no",
                None,
            )
            if contract
            else None
        ),

        "contract_title": (
            getattr(
                contract,
                "title",
                None,
            )
            if contract
            else None
        ),

        "contract_type": (
            getattr(
                contract,
                "contract_type_name",
                None,
            )
            if contract
            else None
        ),

        "party_name": (
            getattr(
                contract,
                "party_name",
                None,
            )
            if contract
            else None
        ),

        "contract_status": (
            getattr(
                contract,
                "status",
                None,
            )
            if contract
            else None
        ),

        "contract_start_date": (
            getattr(
                contract,
                "start_date",
                None,
            )
            if contract
            else None
        ),

        "contract_end_date": (
            getattr(
                contract,
                "end_date",
                None,
            )
            if contract
            else None
        ),

        "contract_description": (
            getattr(
                contract,
                "description",
                None,
            )
            if contract
            else None
        ),
    }

    # ========================================================
    # AMENDMENT DETAILS
    # ========================================================

    amendment_data = {
        "amendment_id": (
            str(
                amendment.id
            )
            if amendment
            else (
                str(
                    approval.amendment_id
                )
                if approval.amendment_id
                else None
            )
        ),

        "amendment_no": (
            getattr(
                amendment,
                "amendment_no",
                None,
            )
            if amendment
            else None
        ),

        "amendment_title": (
            getattr(
                amendment,
                "title",
                None,
            )
            if amendment
            else None
        ),

        "amendment_type": (
            getattr(
                amendment,
                "amendment_type",
                None,
            )
            if amendment
            else None
        ),

        "amendment_description": (
            getattr(
                amendment,
                "description",
                None,
            )
            if amendment
            else None
        ),

        "amendment_reason": (
            getattr(
                amendment,
                "reason",
                None,
            )
            if amendment
            else None
        ),

        "original_value": (
            getattr(
                amendment,
                "original_value",
                None,
            )
            if amendment
            else None
        ),

        "amended_value": (
            getattr(
                amendment,
                "amended_value",
                None,
            )
            if amendment
            else None
        ),

        "original_start_date": (
            getattr(
                amendment,
                "original_start_date",
                None,
            )
            if amendment
            else None
        ),

        "original_end_date": (
            getattr(
                amendment,
                "original_end_date",
                None,
            )
            if amendment
            else None
        ),

        "new_start_date": (
            getattr(
                amendment,
                "new_start_date",
                None,
            )
            if amendment
            else None
        ),

        "new_end_date": (
            getattr(
                amendment,
                "new_end_date",
                None,
            )
            if amendment
            else None
        ),

        "scope_changes": (
            getattr(
                amendment,
                "scope_changes",
                None,
            )
            if amendment
            else None
        ),

        "effective_date": (
            getattr(
                amendment,
                "effective_date",
                None,
            )
            if amendment
            else None
        ),

        "amendment_status": (
            getattr(
                amendment,
                "status",
                None,
            )
            if amendment
            else None
        ),

        "request_date": (
            getattr(
                amendment,
                "request_date",
                None,
            )
            if amendment
            else None
        ),

        "rejection_reason": (
            getattr(
                amendment,
                "rejection_reason",
                None,
            )
            if amendment
            else None
        ),

        "requested_by": (
            str(
                amendment.requested_by
            )
            if amendment
            and getattr(
                amendment,
                "requested_by",
                None,
            )
            else None
        ),

        "requester_name": (
            get_user_name(
                requester
            )
            if requester
            else None
        ),
    }

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "id":
            str(
                approval.id
            ),

        "organization_id":
            str(
                approval.organization_id
            ),

        "contract_id":
            (
                str(
                    approval.contract_id
                )
                if approval.contract_id
                else None
            ),

        "amendment_id":
            (
                str(
                    approval.amendment_id
                )
                if approval.amendment_id
                else None
            ),

        "approval_type":
            approval_type,

        "approver_id":
            str(
                approval.approver_id
            ),

        "approver_name":
            get_user_name(
                approver
            ),

        "decision":
            approval.decision,

        "remarks":
            approval.remarks,

        "approved_at":
            approval.approved_at,

        "created_at":
            approval.created_at,

        "updated_at":
            approval.updated_at,

        **contract_data,

        **amendment_data,
    }


# ============================================================
# GET ALL APPROVALS
# ============================================================

@router.get("/")
def get_approvals(

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    require_admin(
        current_user
    )

    try:

        approvals = (
            ApprovalService.get_all(
                db,
                current_user.organization_id,
            )
        )

        return {
            "success":
                True,

            "message":
                "Approvals retrieved successfully.",

            "data": [
                serialize_approval(
                    approval
                )
                for approval in approvals
            ],
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                str(error),
        )


# ============================================================
# GET CONTRACT APPROVALS
# ============================================================

@router.get(
    "/contract/{contract_id}"
)
def get_contract_approvals(

    contract_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    require_admin(
        current_user
    )

    approvals = (
        ApprovalService.get_by_contract(
            db,
            contract_id,
            current_user.organization_id,
        )
    )

    return {
        "success":
            True,

        "message":
            "Contract approvals retrieved successfully.",

        "data": [
            serialize_approval(
                approval
            )
            for approval in approvals
        ],
    }


# ============================================================
# GET AMENDMENT APPROVALS
# ============================================================

@router.get(
    "/amendment/{amendment_id}"
)
def get_amendment_approvals(

    amendment_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    require_admin(
        current_user
    )

    approvals = (
        ApprovalService.get_by_amendment(
            db,
            amendment_id,
            current_user.organization_id,
        )
    )

    return {
        "success":
            True,

        "message":
            "Amendment approvals retrieved successfully.",

        "data": [
            serialize_approval(
                approval
            )
            for approval in approvals
        ],
    }


# ============================================================
# GET SINGLE APPROVAL
# ============================================================

@router.get(
    "/{approval_id}"
)
def get_approval(

    approval_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    require_admin(
        current_user
    )

    try:

        approval = (
            ApprovalService.get_by_id(
                db,
                approval_id,
                current_user.organization_id,
            )
        )

        return {
            "success":
                True,

            "message":
                "Approval retrieved successfully.",

            "data":
                serialize_approval(
                    approval
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                str(error),
        )


# ============================================================
# CREATE CONTRACT APPROVAL
# ============================================================

@router.post(
    "/",
    status_code=
        status.HTTP_201_CREATED,
)
def create_approval(

    data: ApprovalCreate,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    require_admin(
        current_user
    )

    try:

        approval = (
            ApprovalService.create(
                db=db,

                organization_id=
                    current_user.organization_id,

                contract_id=
                    data.contract_id,

                approver_id=
                    current_user.id,

                remarks=
                    data.remarks,
            )
        )

        return {
            "success":
                True,

            "message":
                "Contract submitted for approval successfully.",

            "data":
                serialize_approval(
                    approval
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                str(error),
        )


# ============================================================
# APPROVE
# ============================================================

@router.put(
    "/{approval_id}/approve"
)
def approve_approval(

    approval_id: UUID,

    data: ApprovalDecision,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    require_admin(
        current_user
    )

    try:

        approval = (
            ApprovalService.approve(
                db=db,

                approval_id=
                    approval_id,

                organization_id=
                    current_user.organization_id,

                approver_id=
                    current_user.id,

                remarks=
                    data.remarks,
            )
        )

        approval_type = (
            "Amendment"
            if approval.amendment_id
            else "Contract"
        )

        message = (
            "Amendment approved successfully."
            if approval_type == "Amendment"
            else
            "Contract approved successfully."
        )

        return {
            "success":
                True,

            "message":
                message,

            "data":
                serialize_approval(
                    approval
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                str(error),
        )


# ============================================================
# REJECT
# ============================================================

@router.put(
    "/{approval_id}/reject"
)
def reject_approval(

    approval_id: UUID,

    data: ApprovalDecision,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    require_admin(
        current_user
    )

    if (
        not data.remarks
        or not data.remarks.strip()
    ):

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Rejection remarks are required.",
        )

    try:

        approval = (
            ApprovalService.reject(
                db=db,

                approval_id=
                    approval_id,

                organization_id=
                    current_user.organization_id,

                approver_id=
                    current_user.id,

                remarks=
                    data.remarks.strip(),
            )
        )

        approval_type = (
            "Amendment"
            if approval.amendment_id
            else "Contract"
        )

        message = (
            "Amendment rejected successfully."
            if approval_type == "Amendment"
            else
            "Contract rejected successfully."
        )

        return {
            "success":
                True,

            "message":
                message,

            "data":
                serialize_approval(
                    approval
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                str(error),
        )