from uuid import UUID

from sqlalchemy.orm import Session

from app.models.party import Party


class PartyRepository:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(Party)
            .filter(
                Party.organization_id == organization_id
            )
            .order_by(Party.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        party_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Party)
            .filter(
                Party.id == party_id,
                Party.organization_id == organization_id,
            )
            .first()
        )

    @staticmethod
    def get_by_name(
        db: Session,
        name: str,
        organization_id: UUID,
    ):
        return (
            db.query(Party)
            .filter(
                Party.name == name,
                Party.organization_id == organization_id,
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        party: Party,
    ):
        db.add(party)
        db.commit()
        db.refresh(party)

        return party

    @staticmethod
    def update(
        db: Session,
        party: Party,
    ):
        db.commit()
        db.refresh(party)

        return party

    @staticmethod
    def delete(
        db: Session,
        party: Party,
    ):
        db.delete(party)
        db.commit()

        return True