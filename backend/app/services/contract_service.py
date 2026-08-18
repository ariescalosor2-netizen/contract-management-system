from uuid import UUID, uuid4
from datetime import date
from decimal import Decimal
import re

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.payment import Payment

from app.repositories.contract_repository import (
    ContractRepository,
)


class ContractService:

    # ========================================================
    # GENERATE CONTRACT NUMBER
    # ========================================================

    @staticmethod
    def generate_contract_number(
        db: Session,
        organization_id: UUID,
    ):

        year = date.today().year

        prefix = f"CTR-{year}-"


        existing_numbers = (
            db.query(
                Contract.contract_no
            )
            .filter(
                Contract.organization_id
                == organization_id,

                Contract.contract_no.isnot(None),

                Contract.contract_no.like(
                    f"{prefix}%"
                ),
            )
            .all()
        )


        highest_number = 0


        for row in existing_numbers:

            contract_no = row[0]

            if not contract_no:
                continue


            match = re.match(
                rf"^CTR-{year}-(\d+)$",
                contract_no,
            )


            if match:

                number = int(
                    match.group(1)
                )

                highest_number = max(
                    highest_number,
                    number,
                )


        return (
            f"{prefix}"
            f"{highest_number + 1:03d}"
        )


    # ========================================================
    # PAYMENT SUMMARY
    # ========================================================

    @staticmethod
    def get_payment_summary(
        db: Session,
        contract: Contract,
    ):

        contract_value = Decimal(
            str(
                contract.value or 0
            )
        )


        paid_result = (
            db.query(
                func.coalesce(
                    func.sum(
                        Payment.amount
                    ),
                    0,
                )
            )
            .filter(
                Payment.contract_id
                == contract.id,

                Payment.organization_id
                == contract.organization_id,

                Payment.status
                == "Paid",
            )
            .scalar()
        )


        total_paid = Decimal(
            str(
                paid_result or 0
            )
        )


        balance = (
            contract_value
            - total_paid
        )


        if balance < 0:
            balance = Decimal("0")


        if contract_value > 0:

            payment_progress = (
                total_paid
                / contract_value
            ) * Decimal("100")

        else:

            payment_progress = Decimal("0")


        if payment_progress > 100:
            payment_progress = Decimal("100")


        return {
            "contract_value":
                contract_value,

            "total_paid":
                total_paid,

            "balance":
                balance,

            "payment_progress":
                payment_progress,

            "fully_paid":
                balance <= 0,
        }


    # ========================================================
    # GET ALL
    # ========================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):

        return ContractRepository.get_all(
            db,
            organization_id,
        )


    # ========================================================
    # GET BY ID
    # ========================================================

    @staticmethod
    def get_by_id(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):

        contract = (
            ContractRepository.get_by_id(
                db,
                contract_id,
                organization_id,
            )
        )


        if not contract:

            raise ValueError(
                "Contract not found."
            )


        return contract


    # ========================================================
    # CREATE CONTRACT
    # ========================================================

    @staticmethod
    def create(
        db: Session,

        organization_id: UUID,

        title: str,

        contract_type_id: UUID,

        party_id: UUID,

        start_date: date,

        end_date: date,

        value: Decimal,

        description: str | None = None,

        # Optional backward compatibility.
        # Normally generated automatically.

        contract_no: str | None = None,

        # New contracts start as Draft.

        status: str = "Draft",
    ):

        # ----------------------------------------------------
        # AUTO-GENERATE CONTRACT NUMBER
        # ----------------------------------------------------

        if not contract_no:

            contract_no = (
                ContractService
                .generate_contract_number(
                    db,
                    organization_id,
                )
            )


        # ----------------------------------------------------
        # CHECK DUPLICATE
        # ----------------------------------------------------

        existing = (
            ContractRepository
            .get_by_contract_no(
                db,
                contract_no,
                organization_id,
            )
        )


        if existing:

            raise ValueError(
                "Contract number already exists."
            )


        # ----------------------------------------------------
        # DATE VALIDATION
        # ----------------------------------------------------

        if end_date < start_date:

            raise ValueError(
                "End date cannot be earlier "
                "than start date."
            )


        # ----------------------------------------------------
        # VALUE VALIDATION
        # ----------------------------------------------------

        if value < 0:

            raise ValueError(
                "Contract value cannot be negative."
            )


        # ----------------------------------------------------
        # CREATE CONTRACT
        # ----------------------------------------------------

        contract = Contract(

            id=uuid4(),

            organization_id=
                organization_id,

            contract_no=
                contract_no,

            title=
                title,

            contract_type_id=
                contract_type_id,

            party_id=
                party_id,

            status=
                status,

            start_date=
                start_date,

            end_date=
                end_date,

            value=
                value,

            description=
                description,
        )


        return ContractRepository.create(
            db,
            contract,
        )


    # ========================================================
    # UPDATE
    # ========================================================

    @staticmethod
    def update(
        db: Session,

        contract_id: UUID,

        organization_id: UUID,

        contract_no: str | None = None,

        title: str | None = None,

        contract_type_id: UUID | None = None,

        party_id: UUID | None = None,

        status: str | None = None,

        start_date: date | None = None,

        end_date: date | None = None,

        value: Decimal | None = None,

        description: str | None = None,
    ):

        contract = (
            ContractRepository.get_by_id(
                db,
                contract_id,
                organization_id,
            )
        )


        if not contract:

            raise ValueError(
                "Contract not found."
            )


        # ----------------------------------------------------
        # CONTRACT NUMBER
        # ----------------------------------------------------

        if (
            contract_no is not None
            and contract_no
            != contract.contract_no
        ):

            existing = (
                ContractRepository
                .get_by_contract_no(
                    db,
                    contract_no,
                    organization_id,
                )
            )


            if (
                existing
                and existing.id
                != contract.id
            ):

                raise ValueError(
                    "Contract number already exists."
                )


            contract.contract_no = (
                contract_no
            )


        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        if title is not None:

            contract.title = title


        # ----------------------------------------------------
        # CONTRACT TYPE
        # ----------------------------------------------------

        if contract_type_id is not None:

            contract.contract_type_id = (
                contract_type_id
            )


        # ----------------------------------------------------
        # PARTY
        # ----------------------------------------------------

        if party_id is not None:

            contract.party_id = (
                party_id
            )


        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        if status is not None:

            contract.status = status


        # ----------------------------------------------------
        # START DATE
        # ----------------------------------------------------

        if start_date is not None:

            contract.start_date = (
                start_date
            )


        # ----------------------------------------------------
        # END DATE
        # ----------------------------------------------------

        if end_date is not None:

            contract.end_date = (
                end_date
            )


        # ----------------------------------------------------
        # DATE VALIDATION
        # ----------------------------------------------------

        if (
            contract.start_date
            and contract.end_date
            and contract.end_date
            < contract.start_date
        ):

            raise ValueError(
                "End date cannot be earlier "
                "than start date."
            )


        # ----------------------------------------------------
        # VALUE
        # ----------------------------------------------------

        if value is not None:

            if value < 0:

                raise ValueError(
                    "Contract value cannot be negative."
                )


            contract.value = value


        # ----------------------------------------------------
        # DESCRIPTION
        # ----------------------------------------------------

        if description is not None:

            contract.description = (
                description
            )


        return ContractRepository.update(
            db,
            contract,
        )


    # ========================================================
    # DELETE
    # ========================================================

    @staticmethod
    def delete(
        db: Session,

        contract_id: UUID,

        organization_id: UUID,
    ):

        contract = (
            ContractRepository.get_by_id(
                db,
                contract_id,
                organization_id,
            )
        )


        if not contract:

            raise ValueError(
                "Contract not found."
            )


        return ContractRepository.delete(
            db,
            contract,
        )