from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.contract_type import ContractType
from app.repositories.contract_type_repository import (
    ContractTypeRepository,
)


class ContractTypeService:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return ContractTypeRepository.get_all(
            db,
            organization_id,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        contract_type_id: UUID,
        organization_id: UUID,
    ):
        contract_type = (
            ContractTypeRepository.get_by_id(
                db,
                contract_type_id,
                organization_id,
            )
        )

        if not contract_type:
            raise ValueError(
                "Contract type not found."
            )

        return contract_type

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        name: str,
        description: str | None = None,
        icon: str | None = None,
        status: str = "Active",
    ):
        existing = (
            ContractTypeRepository.get_by_name(
                db,
                name,
                organization_id,
            )
        )

        if existing:
            raise ValueError(
                "Contract type name already exists."
            )

        contract_type = ContractType(
            id=uuid4(),
            organization_id=organization_id,
            name=name,
            description=description,
            icon=icon,
            status=status,
        )

        return ContractTypeRepository.create(
            db,
            contract_type,
        )

    @staticmethod
    def update(
        db: Session,
        contract_type_id: UUID,
        organization_id: UUID,
        name: str | None = None,
        description: str | None = None,
        icon: str | None = None,
        status: str | None = None,
    ):
        contract_type = (
            ContractTypeRepository.get_by_id(
                db,
                contract_type_id,
                organization_id,
            )
        )

        if not contract_type:
            raise ValueError(
                "Contract type not found."
            )

        if (
            name is not None
            and name != contract_type.name
        ):
            existing = (
                ContractTypeRepository.get_by_name(
                    db,
                    name,
                    organization_id,
                )
            )

            if existing:
                raise ValueError(
                    "Contract type name already exists."
                )

            contract_type.name = name

        if description is not None:
            contract_type.description = description

        if icon is not None:
            contract_type.icon = icon

        if status is not None:
            contract_type.status = status

        return ContractTypeRepository.update(
            db,
            contract_type,
        )

    @staticmethod
    def delete(
        db: Session,
        contract_type_id: UUID,
        organization_id: UUID,
    ):
        contract_type = (
            ContractTypeRepository.get_by_id(
                db,
                contract_type_id,
                organization_id,
            )
        )

        if not contract_type:
            raise ValueError(
                "Contract type not found."
            )

        return ContractTypeRepository.delete(
            db,
            contract_type,
        )