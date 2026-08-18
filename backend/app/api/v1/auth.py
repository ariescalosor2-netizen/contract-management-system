from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordRequestForm,
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.auth import (
    LoginResponse,
)

from app.services.auth_service import (
    AuthService,
)

from app.core.security import (
    get_current_user,
)

from app.models.user import User


router = APIRouter()


# ============================================================
# CHANGE PASSWORD REQUEST
# ============================================================

class ChangePasswordRequest(
    BaseModel
):

    current_password: str

    new_password: str

    confirm_password: str


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm =
        Depends(),

    db: Session =
        Depends(get_db),
):

    token = AuthService.login(
        db=db,

        email=form_data.username,

        password=form_data.password,
    )

    if not token:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid email or password",

            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )

    return LoginResponse(
        access_token=token,
    )


# ============================================================
# CURRENT USER
# ============================================================

@router.get("/me")
def get_me(
    current_user: User =
        Depends(get_current_user),
):

    organization = (
        current_user.organization
    )

    return {

        "id":
            str(current_user.id),

        "first_name":
            current_user.first_name,

        "last_name":
            current_user.last_name,

        "email":
            current_user.email,

        "role":
            current_user.role.name,

        "is_active":
            current_user.is_active,

        "organization_id": (
            str(
                current_user.organization_id
            )
            if current_user.organization_id
            else None
        ),

        "organization_name": (
            organization.name
            if organization
            else None
        ),

        "organization_code": (
            organization.code
            if organization
            else None
        ),
    }


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.post(
    "/change-password"
)
def change_password(
    request: ChangePasswordRequest,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),
):

    # --------------------------------------------------------
    # REQUIRED PASSWORD CHECK
    # --------------------------------------------------------

    if not request.current_password:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Current password is required.",
        )

    if not request.new_password:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "New password is required.",
        )

    # --------------------------------------------------------
    # PASSWORD LENGTH
    # --------------------------------------------------------

    if len(request.new_password) < 8:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "New password must be at least 8 characters.",
        )

    # --------------------------------------------------------
    # CONFIRM PASSWORD
    # --------------------------------------------------------

    if (
        request.new_password
        != request.confirm_password
    ):

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "New password and confirmation do not match.",
        )

    # --------------------------------------------------------
    # CHANGE PASSWORD
    # --------------------------------------------------------

    try:

        AuthService.change_password(
            db=db,

            user=current_user,

            current_password=
                request.current_password,

            new_password=
                request.new_password,
        )

        return {
            "success": True,

            "message":
                "Password changed successfully.",
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )