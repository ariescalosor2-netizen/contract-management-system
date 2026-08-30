from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.renewal import Renewal


class RenewalRepository:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(Renewal)
            .options(
                joinedload(Renewal.contract)
            )
            .filter(
                Renewal.organization_id
                == organization_id
            )
            .order_by(
                Renewal.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        renewal_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Renewal)
            .options(
                joinedload(Renewal.contract)
            )
            .filter(
                Renewal.id == renewal_id,
                Renewal.organization_id
                == organization_id,
            )
            .first()
        )

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Renewal)
            .options(
                joinedload(Renewal.contract)
            )
            .filter(
                Renewal.contract_id
                == contract_id,
                Renewal.organization_id
                == organization_id,
            )
            .order_by(
                Renewal.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        renewal: Renewal,
    ):
        db.add(renewal)
        db.commit()
        db.refresh(renewal)

        return renewal

    @staticmethod
    def update(
        db: Session,
        renewal: Renewal,
    ):
        db.commit()
        db.refresh(renewal)

        return renewal

    @staticmethod
    def delete(
        db: Session,
        renewal: Renewal,
    ):
        db.delete(renewal)
        db.commit()

        return True