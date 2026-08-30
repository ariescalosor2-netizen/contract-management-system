from uuid import UUID

from sqlalchemy.orm import Session

from app.models.contract_type import ContractType


class ContractTypeRepository:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(ContractType)
            .filter(
                ContractType.organization_id
                == organization_id
            )
            .order_by(
                ContractType.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        contract_type_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(ContractType)
            .filter(
                ContractType.id == contract_type_id,
                ContractType.organization_id
                == organization_id,
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
            db.query(ContractType)
            .filter(
                ContractType.name == name,
                ContractType.organization_id
                == organization_id,
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        contract_type: ContractType,
    ):
        db.add(contract_type)
        db.commit()
        db.refresh(contract_type)

        return contract_type

    @staticmethod
    def update(
        db: Session,
        contract_type: ContractType,
    ):
        db.commit()
        db.refresh(contract_type)

        return contract_type

    @staticmethod
    def delete(
        db: Session,
        contract_type: ContractType,
    ):
        db.delete(contract_type)
        db.commit()

        return True