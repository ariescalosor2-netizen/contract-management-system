from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.user import (
    CreateUser,
    UpdateUser,
)

from app.services.user_service import (
    UserService,
)

from app.core.security import (
    get_current_user,
    require_super_admin,
)

from app.core.response import ApiResponse

from app.core.exceptions import (
    BadRequestException,
    NotFoundException,
)

from app.models.user import User


router = APIRouter()


def serialize_user(user):
    return {
        "id": str(user.id),
        "organization_id": (
            str(user.organization_id)
            if user.organization_id
            else None
        ),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": (
            user.role.name
            if user.role
            else None
        ),
        "is_active": user.is_active,
    }


# ============================================================
# GET ALL USERS
# ============================================================

@router.get(
    "/",
    response_model=ApiResponse,
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    users = UserService.get_all_users(
        db,
        current_user.organization_id,
    )

    return ApiResponse(
        message="Users retrieved successfully.",
        data=[
            serialize_user(user)
            for user in users
        ],
    )


# ============================================================
# GET USER
# ============================================================

@router.get(
    "/{user_id}",
    response_model=ApiResponse,
)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    user = UserService.get_user(
        db,
        user_id,
        current_user.organization_id,
    )

    if not user:
        raise NotFoundException(
            "User not found."
        )

    return ApiResponse(
        message="User retrieved successfully.",
        data=serialize_user(user),
    )


# ============================================================
# CREATE USER
# ============================================================

@router.post(
    "/",
    response_model=ApiResponse,
)
def create_user(
    request: CreateUser,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_super_admin
    ),
):
    try:
        user = UserService.create_user(
            db=db,
            data=request,
            organization_id=(
                current_user.organization_id
            ),
        )

        return ApiResponse(
            message="User created successfully.",
            data=serialize_user(user),
        )

    except ValueError as error:
        raise BadRequestException(
            str(error)
        )


# ============================================================
# UPDATE USER
# ============================================================

@router.put(
    "/{user_id}",
    response_model=ApiResponse,
)
def update_user(
    user_id: UUID,
    request: UpdateUser,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_super_admin
    ),
):
    try:
        user = UserService.update_user(
            db=db,
            user_id=user_id,
            data=request,
            organization_id=(
                current_user.organization_id
            ),
        )

        return ApiResponse(
            message="User updated successfully.",
            data=serialize_user(user),
        )

    except ValueError as error:
        raise NotFoundException(
            str(error)
        )


# ============================================================
# DELETE USER
# ============================================================

@router.delete(
    "/{user_id}",
    response_model=ApiResponse,
)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_super_admin
    ),
):
    try:
        UserService.delete_user(
            db=db,
            user_id=user_id,
            organization_id=(
                current_user.organization_id
            ),
        )

        return ApiResponse(
            message="User deleted successfully.",
        )

    except ValueError as error:
        raise NotFoundException(
            str(error)
        )