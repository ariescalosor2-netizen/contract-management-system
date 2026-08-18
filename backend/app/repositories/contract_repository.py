from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.contract import Contract


class ContractRepository:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(Contract)
            .options(
                joinedload(Contract.contract_type),
                joinedload(Contract.party),
            )
            .filter(
                Contract.organization_id == organization_id,
            )
            .order_by(
                Contract.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Contract)
            .options(
                joinedload(Contract.contract_type),
                joinedload(Contract.party),
            )
            .filter(
                Contract.id == contract_id,
                Contract.organization_id == organization_id,
            )
            .first()
        )

    @staticmethod
    def get_by_contract_no(
        db: Session,
        contract_no: str,
        organization_id: UUID,
    ):
        return (
            db.query(Contract)
            .filter(
                Contract.contract_no == contract_no,
                Contract.organization_id == organization_id,
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        contract: Contract,
    ):
        db.add(contract)
        db.commit()
        db.refresh(contract)

        return contract

    @staticmethod
    def update(
        db: Session,
        contract: Contract,
    ):
        db.commit()
        db.refresh(contract)

        return contract

    @staticmethod
    def delete(
        db: Session,
        contract: Contract,
    ):
        db.delete(contract)
        db.commit()

        return True