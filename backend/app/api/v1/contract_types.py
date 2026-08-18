from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.contract_type import (
    CreateContractType,
    UpdateContractType,
)

from app.services.contract_type_service import (
    ContractTypeService,
)

from app.core.security import get_current_user
from app.models.user import User


router = APIRouter()


# ============================================================
# SERIALIZER
# ============================================================

def serialize_contract_type(contract_type):
    return {
        "id": str(contract_type.id),

        "organization_id": str(
            contract_type.organization_id
        ),

        "name": contract_type.name,

        "description": contract_type.description,

        "icon": contract_type.icon,

        "status": contract_type.status,

        "created_at": contract_type.created_at,

        "updated_at": contract_type.updated_at,
    }


# ============================================================
# GET ALL
# ============================================================

@router.get("/")
def get_contract_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    contract_types = (
        ContractTypeService.get_all(
            db,
            current_user.organization_id,
        )
    )

    return {
        "success": True,
        "message": (
            "Contract types retrieved successfully."
        ),
        "data": [
            serialize_contract_type(
                contract_type
            )
            for contract_type in contract_types
        ],
    }


# ============================================================
# GET BY ID
# ============================================================

@router.get("/{contract_type_id}")
def get_contract_type(
    contract_type_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        contract_type = (
            ContractTypeService.get_by_id(
                db,
                contract_type_id,
                current_user.organization_id,
            )
        )

        return {
            "success": True,
            "message": (
                "Contract type retrieved successfully."
            ),
            "data": serialize_contract_type(
                contract_type
            ),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


# ============================================================
# CREATE
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_contract_type(
    request: CreateContractType,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        contract_type = (
            ContractTypeService.create(
                db=db,
                organization_id=(
                    current_user.organization_id
                ),
                name=request.name,
                description=request.description,
                icon=request.icon,
                status=request.status,
            )
        )

        return {
            "success": True,
            "message": (
                "Contract type created successfully."
            ),
            "data": serialize_contract_type(
                contract_type
            ),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# UPDATE
# ============================================================

@router.put("/{contract_type_id}")
def update_contract_type(
    contract_type_id: UUID,
    request: UpdateContractType,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        contract_type = (
            ContractTypeService.update(
                db=db,
                contract_type_id=contract_type_id,
                organization_id=(
                    current_user.organization_id
                ),
                **request.model_dump(
                    exclude_unset=True
                ),
            )
        )

        return {
            "success": True,
            "message": (
                "Contract type updated successfully."
            ),
            "data": serialize_contract_type(
                contract_type
            ),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# DELETE
# ============================================================

@router.delete("/{contract_type_id}")
def delete_contract_type(
    contract_type_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        ContractTypeService.delete(
            db=db,
            contract_type_id=contract_type_id,
            organization_id=(
                current_user.organization_id
            ),
        )

        return {
            "success": True,
            "message": (
                "Contract type deleted successfully."
            ),
            "data": None,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )