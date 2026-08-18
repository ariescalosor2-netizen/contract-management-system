from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.amendment import Amendment
from app.models.renewal import Renewal

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
    db: Session | None = None,
):

    # Relationships are normally eager-loaded by
    # ApprovalRepository.
    #
    # The fallback queries below make the serializer
    # resilient when an approval row points to an
    # existing contract, amendment, or renewal but
    # the relationship is not populated.

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

    renewal = getattr(
        approval,
        "renewal",
        None,
    )

    # --------------------------------------------------------
    # FALLBACK: CONTRACT
    # --------------------------------------------------------

    if db is not None and not contract and approval.contract_id:

        contract = (
            db.query(Contract)
            .filter(
                Contract.id == approval.contract_id,
                Contract.organization_id == approval.organization_id,
            )
            .first()
        )

    # --------------------------------------------------------
    # FALLBACK: AMENDMENT
    # --------------------------------------------------------

    if db is not None and not amendment and approval.amendment_id:

        amendment = (
            db.query(Amendment)
            .filter(
                Amendment.id == approval.amendment_id,
                Amendment.organization_id == approval.organization_id,
            )
            .first()
        )

    # --------------------------------------------------------
    # FALLBACK: RENEWAL
    # --------------------------------------------------------

    if db is not None and not renewal and approval.renewal_id:

        renewal = (
            db.query(Renewal)
            .filter(
                Renewal.id == approval.renewal_id,
                Renewal.organization_id == approval.organization_id,
            )
            .first()
        )

    # --------------------------------------------------------
    # RESOLVE CONTRACT FROM AMENDMENT
    # --------------------------------------------------------

    # An amendment belongs to a contract.
    # If the approval itself does not carry contract_id,
    # resolve the related contract from the amendment.

    if db is not None and amendment and not contract:

        amendment_contract_id = getattr(
            amendment,
            "contract_id",
            None,
        )

        if amendment_contract_id:

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id == amendment_contract_id,
                    Contract.organization_id == approval.organization_id,
                )
                .first()
            )

    # --------------------------------------------------------
    # RESOLVE CONTRACT FROM RENEWAL
    # --------------------------------------------------------

    # A renewal also belongs to a contract.
    # Renewal approvals may have renewal_id but
    # contract_id can be NULL in the approval record.

    if db is not None and renewal and not contract:

        renewal_contract_id = getattr(
            renewal,
            "contract_id",
            None,
        )

        if renewal_contract_id:

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id == renewal_contract_id,
                    Contract.organization_id == approval.organization_id,
                )
                .first()
            )

    # --------------------------------------------------------
    # REQUESTER
    # --------------------------------------------------------

    requester = None

    if amendment:

        requester = getattr(
            amendment,
            "requester",
            None,
        )

    # --------------------------------------------------------
    # APPROVER
    # --------------------------------------------------------

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

    elif approval.renewal_id:

        approval_type = "Renewal"

    elif approval.contract_id:

        approval_type = "Contract"

    else:

        approval_type = "Unknown"

    # ========================================================
    # CONTRACT DETAILS
    # ========================================================

    contract_type = getattr(
        contract,
        "contract_type",
        None,
    ) if contract else None

    party = getattr(
        contract,
        "party",
        None,
    ) if contract else None

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

        # Contract has a relationship to ContractType;
        # there is no contract_type_name column on Contract.

        "contract_type": (
            getattr(
                contract_type,
                "name",
                None,
            )
            if contract_type
            else None
        ),

        # Party name comes from the related Party model.

        "party_name": (
            getattr(
                party,
                "name",
                None,
            )
            if party
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

        "contract_value": (
            getattr(
                contract,
                "value",
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

        # Compatibility with older model/database versions.

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
    # RENEWAL DETAILS
    # ========================================================

    renewal_data = {

    "renewal_id": (
        str(
            renewal.id
        )
        if renewal
        else (
            str(
                approval.renewal_id
            )
            if approval.renewal_id
            else None
        )
    ),

    "renewal_contract_id": (
        str(
            renewal.contract_id
        )
        if renewal
        and getattr(
            renewal,
            "contract_id",
            None,
        )
        else None
    ),

    "renewal_no": (
        getattr(
            renewal,
            "renewal_no",
            None,
        )
        if renewal
        else None
    ),

    "renewal_type": (
        getattr(
            renewal,
            "renewal_type",
            None,
        )
        if renewal
        else None
    ),

    "renewal_current_end_date": (
        getattr(
            renewal,
            "current_end_date",
            None,
        )
        if renewal
        else None
    ),

    "renewal_new_end_date": (
        getattr(
            renewal,
            "new_end_date",
            None,
        )
        if renewal
        else None
    ),

    # ADD THESE
    "current_end_date": (
        getattr(
            renewal,
            "current_end_date",
            None,
        )
        if renewal
        else None
    ),

    "new_end_date": (
        getattr(
            renewal,
            "new_end_date",
            None,
        )
        if renewal
        else None
    ),

    "renewal_status": (
        getattr(
            renewal,
            "status",
            None,
        )
        if renewal
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

        "renewal_id":
            (
                str(
                    approval.renewal_id
                )
                if approval.renewal_id
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

        **renewal_data,
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
                    approval,
                    db,
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
                approval,
                db,
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
                approval,
                db,
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
                    approval,
                    db,
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
                    approval,
                    db,
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

        # ----------------------------------------------------
        # APPROVAL TYPE
        # ----------------------------------------------------

        if approval.amendment_id:

            approval_type = "Amendment"

        elif approval.renewal_id:

            approval_type = "Renewal"

        elif approval.contract_id:

            approval_type = "Contract"

        else:

            approval_type = "Approval"

        # ----------------------------------------------------
        # SUCCESS MESSAGE
        # ----------------------------------------------------

        if approval_type == "Amendment":

            message = (
                "Amendment approved successfully."
            )

        elif approval_type == "Renewal":

            message = (
                "Renewal approved successfully."
            )

        elif approval_type == "Contract":

            message = (
                "Contract approved successfully."
            )

        else:

            message = (
                "Approval approved successfully."
            )

        return {

            "success":
                True,

            "message":
                message,

            "data":
                serialize_approval(
                    approval,
                    db,
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

    # Rejection remarks are required.

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

        # ----------------------------------------------------
        # APPROVAL TYPE
        # ----------------------------------------------------

        if approval.amendment_id:

            approval_type = "Amendment"

        elif approval.renewal_id:

            approval_type = "Renewal"

        elif approval.contract_id:

            approval_type = "Contract"

        else:

            approval_type = "Approval"

        # ----------------------------------------------------
        # SUCCESS MESSAGE
        # ----------------------------------------------------

        if approval_type == "Amendment":

            message = (
                "Amendment rejected successfully."
            )

        elif approval_type == "Renewal":

            message = (
                "Renewal rejected successfully."
            )

        elif approval_type == "Contract":

            message = (
                "Contract rejected successfully."
            )

        else:

            message = (
                "Approval rejected successfully."
            )

        return {

            "success":
                True,

            "message":
                message,

            "data":
                serialize_approval(
                    approval,
                    db,
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                str(error),
        )