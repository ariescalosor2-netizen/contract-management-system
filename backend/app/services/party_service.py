from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.party import Party
from app.repositories.party_repository import PartyRepository


class PartyService:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return PartyRepository.get_all(
            db,
            organization_id,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        party_id: UUID,
        organization_id: UUID,
    ):
        party = PartyRepository.get_by_id(
            db,
            party_id,
            organization_id,
        )

        if not party:
            raise ValueError("Party not found.")

        return party

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        name: str,
        party_type: str,
        email: str | None = None,
        contact: str | None = None,
        status: str = "Active",
    ):
        existing = PartyRepository.get_by_name(
            db,
            name,
            organization_id,
        )

        if existing:
            raise ValueError(
                "Party name already exists."
            )

        party = Party(
            id=uuid4(),
            organization_id=organization_id,
            name=name,
            type=party_type,
            email=email,
            contact=contact,
            status=status,
        )

        return PartyRepository.create(
            db,
            party,
        )

    @staticmethod
    def update(
        db: Session,
        party_id: UUID,
        organization_id: UUID,
        name: str | None = None,
        party_type: str | None = None,
        email: str | None = None,
        contact: str | None = None,
        status: str | None = None,
    ):
        party = PartyRepository.get_by_id(
            db,
            party_id,
            organization_id,
        )

        if not party:
            raise ValueError("Party not found.")

        if (
            name is not None
            and name != party.name
        ):
            existing = PartyRepository.get_by_name(
                db,
                name,
                organization_id,
            )

            if existing and existing.id != party.id:
                raise ValueError(
                    "Party name already exists."
                )

            party.name = name

        if party_type is not None:
            party.type = party_type

        if email is not None:
            party.email = email

        if contact is not None:
            party.contact = contact

        if status is not None:
            party.status = status

        return PartyRepository.update(
            db,
            party,
        )

    @staticmethod
    def delete(
        db: Session,
        party_id: UUID,
        organization_id: UUID,
    ):
        party = PartyRepository.get_by_id(
            db,
            party_id,
            organization_id,
        )

        if not party:
            raise ValueError("Party not found.")

        return PartyRepository.delete(
            db,
            party,
        )