from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ============================================================
# OAUTH2
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


# ============================================================
# PASSWORD FUNCTIONS
# ============================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ============================================================
# JWT
# ============================================================

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update(
        {
            "exp": expire,
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return encoded_jwt


def decode_token(token: str):
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        payload = decode_token(token)

        email = payload.get("sub")

        if not email:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = (
        db.query(User)
        .filter(
            User.email == email,
        )
        .first()
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    # Super Admin is a system-level account and may intentionally
    # have no organization assignment. All organization-scoped
    # roles keep the existing requirement.
    role_name = (
        str(user.role.name).strip().lower()
        if user.role
        else ""
    )

    if user.organization_id is None and role_name != "super admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not assigned to an organization.",
        )

    return user

# ============================================================
# SUPER ADMIN AUTHORIZATION
# ============================================================

def require_super_admin(
    current_user: User = Depends(get_current_user),
):
    role_name = ""

    if current_user.role:
        role_name = str(
            current_user.role.name
        ).strip().lower()

    if role_name != "super admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access is required.",
        )

    return current_user