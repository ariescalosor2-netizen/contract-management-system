from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository

from app.utils.hashing import (
    verify_password,
    hash_password,
)

from app.utils.jwt import create_access_token


class AuthService:

    # ============================================================
    # LOGIN
    # ============================================================

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
    ):
        user = UserRepository.get_by_email(
            db,
            email,
        )

        if not user:
            return None

        if not user.is_active:
            return None

        if not verify_password(
            password,
            user.password,
        ):
            return None

        access_token = create_access_token(
            {
                "sub": user.email,

                "user_id":
                    str(user.id),

                "organization_id": (
                    str(
                        user.organization_id
                    )
                    if user.organization_id
                    else None
                ),

                "role":
                    user.role.name,
            }
        )

        return access_token

    # ============================================================
    # CHANGE PASSWORD
    # ============================================================

    @staticmethod
    def change_password(
        db: Session,
        user,
        current_password: str,
        new_password: str,
    ):

        # --------------------------------------------------------
        # VERIFY CURRENT PASSWORD
        # --------------------------------------------------------

        if not verify_password(
            current_password,
            user.password,
        ):
            raise ValueError(
                "Current password is incorrect."
            )

        # --------------------------------------------------------
        # PREVENT SAME PASSWORD
        # --------------------------------------------------------

        if verify_password(
            new_password,
            user.password,
        ):
            raise ValueError(
                "New password must be different from the current password."
            )

        # --------------------------------------------------------
        # HASH NEW PASSWORD
        # --------------------------------------------------------

        user.password = hash_password(
            new_password
        )

        db.commit()

        db.refresh(user)

        return user