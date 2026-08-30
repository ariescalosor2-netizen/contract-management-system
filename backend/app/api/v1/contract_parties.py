from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.contract import Contract
from app.models.contract_party import ContractParty
from app.models.party import Party
from app.models.user import User
from app.schemas.contract_party import ContractPartyCreate, ContractPartyUpdate


router = APIRouter()

PARTY_ROLES = [
    "Client",
    "Contractor",
    "Supplier",
    "Service Provider",
    "Vendor",
    "Partner",
    "Consultant",
    "Government Agency",
    "Insurer",
    "Other",
]


def get_contract(db: Session, contract_id: UUID, organization_id: UUID):
    contract = (
        db.query(Contract)
        .filter(
            Contract.id == contract_id,
            Contract.organization_id == organization_id,
        )
        .first()
    )
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found.",
        )
    return contract


def serialize(row: ContractParty):
    return {
        "id": str(row.id),
        "contract_id": str(row.contract_id),
        "party_id": str(row.party_id),
        "party_name": row.party.name if row.party else None,
        "party_type": row.party.type if row.party else None,
        "party_email": row.party.email if row.party else None,
        "party_contact": row.party.contact if row.party else None,
        "role": row.role,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }


@router.get("/{contract_id}/parties")
def get_contract_parties(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_contract(db, contract_id, current_user.organization_id)
    rows = (
        db.query(ContractParty)
        .join(Party, ContractParty.party_id == Party.id)
        .filter(
            ContractParty.contract_id == contract_id,
            Party.organization_id == current_user.organization_id,
        )
        .order_by(ContractParty.created_at.asc())
        .all()
    )
    return {
        "success": True,
        "message": "Contract parties retrieved successfully.",
        "data": [serialize(row) for row in rows],
    }


@router.get("/{contract_id}/party-roles")
def get_party_roles(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_contract(db, contract_id, current_user.organization_id)
    return {"success": True, "data": PARTY_ROLES}


@router.post("/{contract_id}/parties", status_code=status.HTTP_201_CREATED)
def add_contract_party(
    contract_id: UUID,
    data: ContractPartyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_contract(db, contract_id, current_user.organization_id)

    party = (
        db.query(Party)
        .filter(
            Party.id == data.party_id,
            Party.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not party:
        raise HTTPException(status_code=404, detail="Party not found.")

    existing = (
        db.query(ContractParty)
        .filter(
            ContractParty.contract_id == contract_id,
            ContractParty.party_id == data.party_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This party is already assigned to the contract.",
        )

    row = ContractParty(
        contract_id=contract_id,
        party_id=data.party_id,
        role=data.role.strip(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return {
        "success": True,
        "message": "Party added to contract successfully.",
        "data": serialize(row),
    }


@router.put("/{contract_id}/parties/{contract_party_id}")
def update_contract_party(
    contract_id: UUID,
    contract_party_id: UUID,
    data: ContractPartyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_contract(db, contract_id, current_user.organization_id)

    row = (
        db.query(ContractParty)
        .join(Party, ContractParty.party_id == Party.id)
        .filter(
            ContractParty.id == contract_party_id,
            ContractParty.contract_id == contract_id,
            Party.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Contract party not found.")

    row.role = data.role.strip()
    db.commit()
    db.refresh(row)

    return {
        "success": True,
        "message": "Party role updated successfully.",
        "data": serialize(row),
    }


@router.delete("/{contract_id}/parties/{contract_party_id}")
def remove_contract_party(
    contract_id: UUID,
    contract_party_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_contract(db, contract_id, current_user.organization_id)

    row = (
        db.query(ContractParty)
        .join(Party, ContractParty.party_id == Party.id)
        .filter(
            ContractParty.id == contract_party_id,
            ContractParty.contract_id == contract_id,
            Party.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Contract party not found.")

    db.delete(row)
    db.commit()

    return {
        "success": True,
        "message": "Party removed from contract successfully.",
    }
