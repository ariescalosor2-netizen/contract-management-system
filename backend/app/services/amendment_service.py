import re

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.amendment import Amendment
from app.models.contract import Contract
from app.repositories.amendment_repository import AmendmentRepository


class AmendmentService:

    # ============================================================
    # GET ALL
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return AmendmentRepository.get_all(
            db,
            organization_id,
        )

    # ============================================================
    # GET ONE
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
    ):
        item = AmendmentRepository.get_by_id(
            db,
            amendment_id,
            organization_id,
        )

        if not item:
            raise ValueError(
                "Amendment not found."
            )

        return item

    # ============================================================
    # GET BY CONTRACT
    # ============================================================

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return AmendmentRepository.get_by_contract(
            db,
            contract_id,
            organization_id,
        )

    # ============================================================
    # GENERATE AMENDMENT NUMBER
    # ============================================================

    @staticmethod
    def generate_amendment_number(
        db: Session,
        organization_id: UUID,
    ):
        year = date.today().year

        prefix = f"AMD-{year}-"

        row = AmendmentRepository.get_latest_number(
            db,
            organization_id,
            prefix,
        )

        highest = 0

        if row and row[0]:
            match = re.match(
                rf"^AMD-{year}-(\d+)$",
                row[0],
            )

            if match:
                highest = int(
                    match.group(1)
                )

        return f"{prefix}{highest + 1:03d}"

    # ============================================================
    # CREATE AMENDMENT
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        requested_by: UUID,
        **data,
    ):

        # --------------------------------------------------------
        # FIND CONTRACT
        # --------------------------------------------------------

        contract = (
            db.query(Contract)
            .filter(
                Contract.id
                == data["contract_id"],

                Contract.organization_id
                == organization_id,
            )
            .first()
        )

        if not contract:
            raise ValueError(
                "Contract not found."
            )

        # --------------------------------------------------------
        # CONTRACT STATUS CHECK
        # --------------------------------------------------------

        allowed_statuses = {
            "active",
            "approved",
            "in progress",
            "in_progress",
        }

        contract_status = (
            str(
                contract.status or ""
            )
            .strip()
            .lower()
        )

        if contract_status not in allowed_statuses:
            raise ValueError(
                "Only Active or Approved contracts can be amended."
            )

        # --------------------------------------------------------
        # AMENDED VALUE VALIDATION
        # --------------------------------------------------------

        amended_value = data.get(
            "amended_value"
        )

        if amended_value is not None:

            amended_value = Decimal(
                str(amended_value)
            )

            if amended_value < 0:
                raise ValueError(
                    "Contract value cannot be negative."
                )

        # --------------------------------------------------------
        # DATE VALIDATION
        # --------------------------------------------------------

        new_start_date = data.get(
            "new_start_date"
        )

        new_end_date = data.get(
            "new_end_date"
        )

        if (
            new_start_date
            and new_end_date
            and new_end_date < new_start_date
        ):
            raise ValueError(
                "New end date cannot be earlier than the new start date."
            )

        # --------------------------------------------------------
        # EFFECTIVE DATE
        # --------------------------------------------------------

        effective_date = data.get(
            "effective_date"
        )

        # --------------------------------------------------------
        # CREATE AMENDMENT
        # --------------------------------------------------------
        #
        # IMPORTANT:
        #
        # Do NOT use:
        # - approved_date
        # - remarks
        #
        # Those fields no longer exist in Amendment model.
        #
        # Approval information is stored using:
        # - approved_by
        # - approved_at
        # - rejection_reason
        #
        # --------------------------------------------------------

        amendment = Amendment(
            id=uuid4(),

            organization_id=organization_id,

            contract_id=data[
                "contract_id"
            ],

            requested_by=requested_by,

            amendment_no=(
                AmendmentService
                .generate_amendment_number(
                    db,
                    organization_id,
                )
            ),

            title=data.get(
                "title"
            ),

            amendment_type=data[
                "amendment_type"
            ],

            reason=data.get(
                "reason"
            ),

            description=data[
                "description"
            ],

            # ----------------------------------------------------
            # ORIGINAL VALUES
            # ----------------------------------------------------

            original_value=(
                contract.value
            ),

            original_start_date=(
                contract.start_date
            ),

            original_end_date=(
                contract.end_date
            ),

            # ----------------------------------------------------
            # PROPOSED VALUES
            # ----------------------------------------------------

            amended_value=amended_value,

            new_start_date=(
                new_start_date
            ),

            new_end_date=(
                new_end_date
            ),

            scope_changes=data.get(
                "scope_changes"
            ),

            effective_date=(
                effective_date
            ),

            # ----------------------------------------------------
            # APPROVAL STATE
            # ----------------------------------------------------

            status="Pending",

            request_date=date.today(),

            approved_by=None,

            approved_at=None,

            rejection_reason=None,
        )

        return AmendmentRepository.create(
            db,
            amendment,
        )

    # ============================================================
    # UPDATE AMENDMENT
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
        **data,
    ):

        item = AmendmentService.get_by_id(
            db,
            amendment_id,
            organization_id,
        )

        if item.status not in (
            "Pending",
            "Draft",
        ):
            raise ValueError(
                "Only pending amendments can be edited."
            )

        # --------------------------------------------------------
        # VALUE VALIDATION
        # --------------------------------------------------------

        amended_value = data.get(
            "amended_value"
        )

        if amended_value is not None:

            amended_value = Decimal(
                str(amended_value)
            )

            if amended_value < 0:
                raise ValueError(
                    "Contract value cannot be negative."
                )

        # --------------------------------------------------------
        # DATE VALIDATION
        # --------------------------------------------------------

        new_start_date = data.get(
            "new_start_date"
        )

        new_end_date = data.get(
            "new_end_date"
        )

        if (
            new_start_date
            and new_end_date
            and new_end_date < new_start_date
        ):
            raise ValueError(
                "New end date cannot be earlier than the new start date."
            )

        # --------------------------------------------------------
        # UPDATE PROVIDED FIELDS
        # --------------------------------------------------------

        for key, value in data.items():

            if value is not None:

                setattr(
                    item,
                    key,
                    value,
                )

        return AmendmentRepository.update(
            db,
            item,
        )

    # ============================================================
    # APPROVE AMENDMENT
    # ============================================================

    @staticmethod
    def approve(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
        approver_id: UUID,
        remarks: str | None = None,
    ):

        item = AmendmentService.get_by_id(
            db,
            amendment_id,
            organization_id,
        )

        if item.status != "Pending":
            raise ValueError(
                "This amendment has already been decided."
            )

        # --------------------------------------------------------
        # APPROVAL DATA
        # --------------------------------------------------------

        item.status = "Approved"

        item.approved_by = approver_id

        item.approved_at = datetime.now()

        item.rejection_reason = None

        # --------------------------------------------------------
        # APPLY APPROVED CHANGES TO CONTRACT
        # --------------------------------------------------------

        contract = (
            db.query(Contract)
            .filter(
                Contract.id
                == item.contract_id,

                Contract.organization_id
                == organization_id,
            )
            .first()
        )

        if not contract:
            raise ValueError(
                "Contract associated with this amendment was not found."
            )

        # --------------------------------------------------------
        # CONTRACT VALUE
        # --------------------------------------------------------

        if item.amended_value is not None:

            contract.value = (
                item.amended_value
            )

        # --------------------------------------------------------
        # CONTRACT START DATE
        # --------------------------------------------------------

        if item.new_start_date is not None:

            contract.start_date = (
                item.new_start_date
            )

        # --------------------------------------------------------
        # CONTRACT END DATE
        # --------------------------------------------------------

        if item.new_end_date is not None:

            contract.end_date = (
                item.new_end_date
            )

        # --------------------------------------------------------
        # SAVE
        # --------------------------------------------------------

        db.add(contract)

        return AmendmentRepository.update(
            db,
            item,
        )

    # ============================================================
    # REJECT AMENDMENT
    # ============================================================

    @staticmethod
    def reject(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
        approver_id: UUID,
        reason: str,
    ):

        item = AmendmentService.get_by_id(
            db,
            amendment_id,
            organization_id,
        )

        if item.status != "Pending":
            raise ValueError(
                "This amendment has already been decided."
            )

        # --------------------------------------------------------
        # REQUIRE REJECTION REASON
        # --------------------------------------------------------

        if (
            not reason
            or not reason.strip()
        ):
            raise ValueError(
                "Rejection reason is required."
            )

        # --------------------------------------------------------
        # REJECT
        # --------------------------------------------------------

        item.status = "Rejected"

        item.approved_by = approver_id

        item.approved_at = None

        item.rejection_reason = (
            reason.strip()
        )

        return AmendmentRepository.update(
            db,
            item,
        )

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
    ):

        item = AmendmentService.get_by_id(
            db,
            amendment_id,
            organization_id,
        )

        if item.status == "Approved":
            raise ValueError(
                "Approved amendments should not be deleted."
            )

        return AmendmentRepository.delete(
            db,
            item,
        )