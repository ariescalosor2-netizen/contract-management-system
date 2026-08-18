from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.contract import (
    ContractCreate,
    ContractResponse,
    ContractUpdate,
)

from app.services.contract_service import (
    ContractService,
)

from app.services.approval_service import (
    ApprovalService,
)

from app.core.security import (
    get_current_user,
)

from app.models.user import User
from app.models.role import Role


router = APIRouter()


# ============================================================
# SERIALIZER
# ============================================================

def serialize_contract(contract):
    return {
        "id": str(contract.id),

        "organization_id": (
            str(contract.organization_id)
            if contract.organization_id
            else None
        ),

        "contract_no": contract.contract_no,

        "title": contract.title,

        "contract_type_id": (
            str(contract.contract_type_id)
            if contract.contract_type_id
            else None
        ),

        "contract_type_name": (
            contract.contract_type.name
            if contract.contract_type
            else None
        ),

        "party_id": (
            str(contract.party_id)
            if contract.party_id
            else None
        ),

        "party_name": (
            contract.party.name
            if contract.party
            else None
        ),

        "status": contract.status,

        "start_date": contract.start_date,

        "end_date": contract.end_date,

        "value": contract.value,

        "description": contract.description,

        "created_at": contract.created_at,

        "updated_at": contract.updated_at,
    }


# ============================================================
# FIND AUTHORIZED APPROVER
# ============================================================

def find_authorized_approver(
    db: Session,
    organization_id: UUID,
    current_user: User,
):
    """
    Finds an active user who is authorized to approve contracts.

    Priority:
        1. Approver
        2. Administrator
        3. Current user if current user is already
           an Administrator or Approver

    The approver must belong to the same organization.
    """

    # --------------------------------------------------------
    # 1. LOOK FOR AN APPROVER
    # --------------------------------------------------------

    approver = (
        db.query(User)
        .join(
            Role,
            User.role_id == Role.id,
        )
        .filter(
            User.organization_id == organization_id,
            User.is_active.is_(True),
            Role.name == "Approver",
            User.id != current_user.id,
        )
        .first()
    )

    if approver:
        return approver


    # --------------------------------------------------------
    # 2. IF NO APPROVER, LOOK FOR ADMINISTRATOR
    # --------------------------------------------------------

    administrator = (
        db.query(User)
        .join(
            Role,
            User.role_id == Role.id,
        )
        .filter(
            User.organization_id == organization_id,
            User.is_active.is_(True),
            Role.name == "Administrator",
            User.id != current_user.id,
        )
        .first()
    )

    if administrator:
        return administrator


    # --------------------------------------------------------
    # 3. FALLBACK
    #
    # If the current user is already an authorized approver,
    # allow the current user to be assigned.
    # --------------------------------------------------------

    current_role = (
        db.query(Role)
        .filter(
            Role.id == current_user.role_id
        )
        .first()
    )

    if (
        current_role
        and current_role.name
        in ("Approver", "Administrator")
    ):
        return current_user


    # --------------------------------------------------------
    # 4. NO AUTHORIZED APPROVER FOUND
    # --------------------------------------------------------

    raise ValueError(
        "No active Approver or Administrator is available "
        "to review this contract."
    )


# ============================================================
# GET ALL CONTRACTS
# ============================================================

@router.get("/")
def get_contracts(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    contracts = ContractService.get_all(
        db,
        current_user.organization_id,
    )

    return {
        "success": True,

        "message":
            "Contracts retrieved successfully.",

        "data": [
            serialize_contract(contract)
            for contract in contracts
        ],
    }


# ============================================================
# GET SINGLE CONTRACT
# ============================================================

@router.get("/{contract_id}")
def get_contract(
    contract_id: UUID,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        contract = ContractService.get_by_id(
            db,
            contract_id,
            current_user.organization_id,
        )

        return {
            "success": True,

            "message":
                "Contract retrieved successfully.",

            "data":
                serialize_contract(contract),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# CREATE CONTRACT
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_contract(
    data: ContractCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        # ----------------------------------------------------
        # FIND AUTHORIZED APPROVER FIRST
        # ----------------------------------------------------

        approver = find_authorized_approver(
            db=db,

            organization_id=
                current_user.organization_id,

            current_user=current_user,
        )


        # ----------------------------------------------------
        # CREATE CONTRACT
        #
        # Contract number is generated automatically.
        # Initial status is Draft.
        # ----------------------------------------------------

        contract = ContractService.create(

            db=db,

            # IMPORTANT:
            # Organization is ALWAYS taken from
            # the authenticated user.

            organization_id=
                current_user.organization_id,

            title=data.title,

            contract_type_id=
                data.contract_type_id,

            party_id=
                data.party_id,

            start_date=
                data.start_date,

            end_date=
                data.end_date,

            value=data.value,

            description=
                data.description,

            status="Draft",
        )


        # ----------------------------------------------------
        # AUTOMATIC SUBMISSION FOR APPROVAL
        #
        # The frontend does NOT choose the approver.
        #
        # Backend assigns an authorized Approver/Admin.
        # ----------------------------------------------------

        ApprovalService.create(

            db=db,

            organization_id=
                current_user.organization_id,

            contract_id=
                contract.id,

            approver_id=
                approver.id,

            remarks=(
                "Automatically submitted for approval "
                "upon contract creation."
            ),
        )


        # ----------------------------------------------------
        # REFRESH CONTRACT
        #
        # ApprovalService changes:
        #
        # Draft
        #   ↓
        # Pending Approval
        # ----------------------------------------------------

        db.refresh(contract)


        return {
            "success": True,

            "message": (
                "Contract created and "
                "automatically submitted "
                "for approval successfully."
            ),

            "data":
                serialize_contract(contract),
        }


    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# UPDATE CONTRACT
# ============================================================

@router.put("/{contract_id}")
def update_contract(
    contract_id: UUID,

    data: ContractUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        contract = ContractService.update(

            db=db,

            contract_id=contract_id,

            organization_id=
                current_user.organization_id,

            **data.model_dump(
                exclude_unset=True
            ),
        )


        return {
            "success": True,

            "message":
                "Contract updated successfully.",

            "data":
                serialize_contract(contract),
        }


    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# DELETE CONTRACT
# ============================================================

@router.delete("/{contract_id}")
def delete_contract(
    contract_id: UUID,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        ContractService.delete(

            db=db,

            contract_id=contract_id,

            organization_id=
                current_user.organization_id,
        )


        return {
            "success": True,

            "message":
                "Contract deleted successfully.",
        }


    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )