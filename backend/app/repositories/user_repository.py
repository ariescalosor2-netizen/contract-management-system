from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.models.role import Role


class UserRepository:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(User)
            .options(
                joinedload(User.role),
            )
            .filter(
                User.organization_id == organization_id
            )
            .order_by(
                User.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        user_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(User)
            .options(
                joinedload(User.role),
            )
            .filter(
                User.id == user_id,
                User.organization_id == organization_id,
            )
            .first()
        )

    @staticmethod
    def get_by_email(
        db: Session,
        email: str,
        organization_id: UUID | None = None,
    ):
        query = db.query(User).filter(
            User.email == email
        )

        if organization_id is not None:
            query = query.filter(
                User.organization_id
                == organization_id
            )

        return query.first()

    @staticmethod
    def create(
        db: Session,
        user: User,
    ):
        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def update(
        db: Session,
        user: User,
    ):
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def delete(
        db: Session,
        user: User,
    ):
        db.delete(user)
        db.commit()

        return True

    @staticmethod
    def get_role(
        db: Session,
        role_name: str,
    ):
        return (
            db.query(Role)
            .filter(
                Role.name == role_name
            )
            .first()
        )