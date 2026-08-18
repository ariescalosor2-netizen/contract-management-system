from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import (
    UserRepository,
)
from app.core.security import hash_password


class UserService:

    @staticmethod
    def get_all_users(
        db: Session,
        organization_id: UUID,
    ):
        return UserRepository.get_all(
            db,
            organization_id,
        )

    @staticmethod
    def get_user(
        db: Session,
        user_id: UUID,
        organization_id: UUID,
    ):
        return UserRepository.get_by_id(
            db,
            user_id,
            organization_id,
        )

    @staticmethod
    def create_user(
        db: Session,
        data,
        organization_id: UUID,
    ):
        # Email must remain globally unique
        existing = UserRepository.get_by_email(
            db,
            data.email,
        )

        if existing:
            raise ValueError(
                "Email already exists."
            )

        role = UserRepository.get_role(
            db,
            data.role,
        )

        if role is None:
            raise ValueError(
                "Role does not exist."
            )

        user = User(
            id=uuid4(),
            organization_id=organization_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            password=hash_password(
                data.password
            ),
            role_id=role.id,
            is_active=True,
        )

        return UserRepository.create(
            db,
            user,
        )

    @staticmethod
    def update_user(
        db: Session,
        user_id: UUID,
        data,
        organization_id: UUID,
    ):
        user = UserRepository.get_by_id(
            db,
            user_id,
            organization_id,
        )

        if not user:
            raise ValueError(
                "User not found."
            )

        if data.first_name is not None:
            user.first_name = data.first_name

        if data.last_name is not None:
            user.last_name = data.last_name

        if data.email is not None:
            if data.email != user.email:
                existing = (
                    UserRepository.get_by_email(
                        db,
                        data.email,
                    )
                )

                if (
                    existing
                    and existing.id != user.id
                ):
                    raise ValueError(
                        "Email already exists."
                    )

                user.email = data.email

        if data.password is not None:
            user.password = hash_password(
                data.password
            )

        if data.role is not None:
            role = UserRepository.get_role(
                db,
                data.role,
            )

            if role is None:
                raise ValueError(
                    "Role does not exist."
                )

            user.role_id = role.id

        if data.is_active is not None:
            user.is_active = data.is_active

        return UserRepository.update(
            db,
            user,
        )

    @staticmethod
    def delete_user(
        db: Session,
        user_id: UUID,
        organization_id: UUID,
    ):
        user = UserRepository.get_by_id(
            db,
            user_id,
            organization_id,
        )

        if not user:
            raise ValueError(
                "User not found."
            )

        UserRepository.delete(
            db,
            user,
        )

        return True