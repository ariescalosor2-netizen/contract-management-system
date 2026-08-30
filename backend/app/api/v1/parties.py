from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.party import (
    CreateParty,
    UpdateParty,
)

from app.services.party_service import PartyService

from app.core.security import get_current_user
from app.models.user import User


router = APIRouter()


def serialize_party(party):
    return {
        "id": str(party.id),
        "organization_id": str(
            party.organization_id
        ),
        "name": party.name,
        "type": party.type,
        "email": party.email,
        "contact": party.contact,
        "status": party.status,
        "created_at": party.created_at,
        "updated_at": party.updated_at,
    }


@router.get("/")
def get_parties(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    parties = PartyService.get_all(
        db,
        current_user.organization_id,
    )

    return {
        "success": True,
        "message": "Parties retrieved successfully.",
        "data": [
            serialize_party(party)
            for party in parties
        ],
    }


@router.get("/{party_id}")
def get_party(
    party_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        party = PartyService.get_by_id(
            db,
            party_id,
            current_user.organization_id,
        )

        return {
            "success": True,
            "message": "Party retrieved successfully.",
            "data": serialize_party(party),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_party(
    request: CreateParty,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        party = PartyService.create(
            db=db,
            organization_id=(
                current_user.organization_id
            ),
            name=request.name,
            party_type=request.type,
            email=request.email,
            contact=request.contact,
            status=request.status,
        )

        return {
            "success": True,
            "message": "Party created successfully.",
            "data": serialize_party(party),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{party_id}")
def update_party(
    party_id: UUID,
    request: UpdateParty,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        party = PartyService.update(
            db=db,
            party_id=party_id,
            organization_id=(
                current_user.organization_id
            ),
            name=request.name,
            party_type=request.type,
            email=request.email,
            contact=request.contact,
            status=request.status,
        )

        return {
            "success": True,
            "message": "Party updated successfully.",
            "data": serialize_party(party),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.delete("/{party_id}")
def delete_party(
    party_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    try:
        PartyService.delete(
            db=db,
            party_id=party_id,
            organization_id=(
                current_user.organization_id
            ),
        )

        return {
            "success": True,
            "message": "Party deleted successfully.",
            "data": None,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )