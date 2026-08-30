from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session, joinedload

from app.core.security import require_super_admin
from app.database.session import get_db
from app.models.contract import Contract
from app.models.organization import Organization
from app.models.role import Role
from app.models.user import User
from app.schemas.super_admin import (
    OrganizationCreate,
    OrganizationUpdate,
    SuperAdminUserCreate,
    SuperAdminUserUpdate,
)
from app.utils.hashing import hash_password


router = APIRouter()


def serialize_organization(org: Organization):
    return {
        "id": str(org.id),
        "name": org.name,
        "code": org.code,
        "status": org.status,
        "user_count": len(org.users) if org.users is not None else 0,
        "created_at": org.created_at,
        "updated_at": org.updated_at,
    }


def serialize_user(user: User):
    return {
        "id": str(user.id),
        "organization_id": str(user.organization_id) if user.organization_id else None,
        "organization_name": user.organization.name if user.organization else None,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role.name if user.role else None,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


@router.get("/dashboard")
def get_super_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    total_organizations = db.query(Organization).count()
    active_organizations = db.query(Organization).filter(Organization.status == "Active").count()
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()
    total_contracts = db.query(Contract).count()
    active_contracts = db.query(Contract).filter(Contract.status == "Active").count()

    recent_users = (
        db.query(User)
        .options(joinedload(User.organization), joinedload(User.role))
        .order_by(desc(User.created_at))
        .limit(5)
        .all()
    )

    recent_contracts = (
        db.query(Contract)
        .order_by(desc(Contract.created_at))
        .limit(5)
        .all()
    )

    activity = []
    for user in recent_users:
        activity.append({
            "type": "User",
            "title": f"{user.first_name} {user.last_name} account created",
            "description": user.organization.name if user.organization else "System level",
            "timestamp": user.created_at,
        })
    for contract in recent_contracts:
        activity.append({
            "type": "Contract",
            "title": f"{contract.contract_no} created",
            "description": contract.title,
            "timestamp": contract.created_at,
        })
    activity.sort(key=lambda item: item["timestamp"] or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

    return {
        "success": True,
        "message": "Super Admin dashboard retrieved successfully.",
        "data": {
            "total_organizations": total_organizations,
            "active_organizations": active_organizations,
            "total_users": total_users,
            "active_users": active_users,
            "total_contracts": total_contracts,
            "active_contracts": active_contracts,
            "recent_activity": activity[:8],
        },
    }


@router.get("/organizations")
def get_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    organizations = (
        db.query(Organization)
        .options(joinedload(Organization.users))
        .order_by(Organization.created_at.desc())
        .all()
    )
    return {"success": True, "data": [serialize_organization(org) for org in organizations]}


@router.post("/organizations", status_code=status.HTTP_201_CREATED)
def create_organization(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if db.query(Organization).filter(Organization.code == data.code.strip()).first():
        raise HTTPException(status_code=400, detail="Organization code already exists.")

    status_value = data.status.strip()
    if status_value not in {"Active", "Inactive"}:
        raise HTTPException(status_code=400, detail="Organization status must be Active or Inactive.")

    admin_fields = [
        data.admin_first_name,
        data.admin_last_name,
        data.admin_email,
        data.admin_password,
    ]
    has_any_admin_field = any(value is not None and str(value).strip() for value in admin_fields)
    if has_any_admin_field and not all(value is not None and str(value).strip() for value in admin_fields):
        raise HTTPException(
            status_code=400,
            detail="Complete initial Administrator information is required.",
        )

    if data.admin_email and db.query(User).filter(User.email == str(data.admin_email)).first():
        raise HTTPException(status_code=400, detail="Administrator email already exists.")

    admin_role = None
    if data.admin_email:
        admin_role = db.query(Role).filter(Role.name == "Administrator").first()
        if not admin_role:
            raise HTTPException(status_code=500, detail="Administrator role is not configured.")
        if status_value != "Active":
            raise HTTPException(status_code=400, detail="An initial Administrator can only be created for an active organization.")

    org = Organization(
        id=uuid4(),
        name=data.name.strip(),
        code=data.code.strip(),
        status=status_value,
    )
    db.add(org)
    db.flush()

    initial_admin = None
    if admin_role:
        initial_admin = User(
            id=uuid4(),
            organization_id=org.id,
            role_id=admin_role.id,
            first_name=data.admin_first_name.strip(),
            last_name=data.admin_last_name.strip(),
            email=str(data.admin_email),
            password=hash_password(data.admin_password),
            is_active=True,
        )
        db.add(initial_admin)

    db.commit()
    db.refresh(org)

    payload = serialize_organization(org)
    payload["initial_admin"] = (
        {
            "id": str(initial_admin.id),
            "name": f"{initial_admin.first_name} {initial_admin.last_name}",
            "email": initial_admin.email,
            "role": "Administrator",
        }
        if initial_admin
        else None
    )

    return {
        "success": True,
        "message": "Organization and initial Administrator created successfully." if initial_admin else "Organization created successfully.",
        "data": payload,
    }


@router.put("/organizations/{organization_id}")
def update_organization(
    organization_id: UUID,
    data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    if data.code is not None and data.code.strip() != org.code:
        existing = db.query(Organization).filter(Organization.code == data.code.strip()).first()
        if existing and existing.id != org.id:
            raise HTTPException(status_code=400, detail="Organization code already exists.")
        org.code = data.code.strip()
    if data.name is not None:
        org.name = data.name.strip()
    if data.status is not None:
        org.status = data.status.strip()

    db.commit()
    db.refresh(org)
    return {"success": True, "message": "Organization updated successfully.", "data": serialize_organization(org)}


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    users = (
        db.query(User)
        .options(joinedload(User.role), joinedload(User.organization))
        .order_by(User.created_at.desc())
        .all()
    )
    return {"success": True, "data": [serialize_user(user) for user in users]}


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    data: SuperAdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists.")

    role = db.query(Role).filter(Role.name == data.role.strip()).first()
    if not role:
        raise HTTPException(status_code=400, detail="Role does not exist.")
    if role.name.strip().lower() == "super admin":
        raise HTTPException(status_code=400, detail="Super Admin accounts must be provisioned through the system administration process.")

    if data.organization_id is not None:
        org = db.query(Organization).filter(Organization.id == data.organization_id).first()
        if not org:
            raise HTTPException(status_code=400, detail="Organization not found.")
    elif role.name.strip().lower() != "super admin":
        raise HTTPException(status_code=400, detail="Organization is required for organization-scoped users.")

    user = User(
        id=uuid4(),
        organization_id=data.organization_id,
        role_id=role.id,
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        email=str(data.email),
        password=hash_password(data.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user = (
        db.query(User)
        .options(joinedload(User.role), joinedload(User.organization))
        .filter(User.id == user.id)
        .first()
    )
    return {"success": True, "message": "User created successfully.", "data": serialize_user(user)}


@router.put("/users/{user_id}")
def update_user(
    user_id: UUID,
    data: SuperAdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if data.email is not None and str(data.email) != user.email:
        existing = db.query(User).filter(User.email == str(data.email)).first()
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Email already exists.")
        user.email = str(data.email)
    if data.first_name is not None:
        user.first_name = data.first_name.strip()
    if data.last_name is not None:
        user.last_name = data.last_name.strip()
    if data.password is not None:
        user.password = hash_password(data.password)
    if data.role is not None:
        role = db.query(Role).filter(Role.name == data.role.strip()).first()
        if not role:
            raise HTTPException(status_code=400, detail="Role does not exist.")
        if role.name.strip().lower() == "super admin":
            raise HTTPException(status_code=400, detail="Super Admin accounts must be provisioned through the system administration process.")
        user.role_id = role.id
    if "organization_id" in data.model_fields_set:
        if data.organization_id is None:
            user.organization_id = None
        else:
            org = db.query(Organization).filter(Organization.id == data.organization_id).first()
            if not org:
                raise HTTPException(status_code=400, detail="Organization not found.")
            user.organization_id = org.id
    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    user = (
        db.query(User)
        .options(joinedload(User.role), joinedload(User.organization))
        .filter(User.id == user.id)
        .first()
    )
    return {"success": True, "message": "User updated successfully.", "data": serialize_user(user)}


@router.get("/roles")
def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    roles = db.query(Role).order_by(Role.name.asc()).all()
    return {
        "success": True,
        "data": [
            {
                "id": str(role.id),
                "name": role.name,
                "description": role.description,
            }
            for role in roles
        ],
    }
