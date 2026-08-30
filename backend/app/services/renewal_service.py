import re

from datetime import date
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.renewal import Renewal

from app.repositories.renewal_repository import (
    RenewalRepository,
)

from app.services.approval_service import (
    ApprovalService,
)


class RenewalService:

    # ============================================================
    # GENERATE RENEWAL NUMBER
    # ============================================================

    @staticmethod
    def generate_renewal_number(
        db: Session,
        organization_id: UUID,
    ):
        year = date.today().year

        prefix = f"REN-{year}-"

        existing = (
            db.query(Renewal.renewal_no)
            .filter(
                Renewal.organization_id == organization_id,
                Renewal.renewal_no.like(
                    f"{prefix}%"
                ),
            )
            .all()
        )

        highest = 0

        for row in existing:
            renewal_no = row[0]

            match = re.match(
                rf"^REN-{year}-(\d+)$",
                renewal_no,
            )

            if match:
                highest = max(
                    highest,
                    int(match.group(1)),
                )

        return f"{prefix}{highest + 1:03d}"

    # ============================================================
    # CALCULATE STATUS
    # ============================================================

    @staticmethod
    def calculate_status(
        current_end_date: date,
    ):
        today = date.today()

        if current_end_date < today:
            return "Expired"

        days = (
            current_end_date - today
        ).days

        if days <= 30:
            return f"Due in {days} days"

        return "Active"

    # ============================================================
    # GET ALL
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return RenewalRepository.get_all(
            db,
            organization_id,
        )

    # ============================================================
    # GET BY ID
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        renewal_id: UUID,
        organization_id: UUID,
    ):
        renewal = (
            RenewalRepository.get_by_id(
                db,
                renewal_id,
                organization_id,
            )
        )

        if not renewal:
            raise ValueError(
                "Renewal not found."
            )

        return renewal

    # ============================================================
    # CREATE RENEWAL
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        contract_id: UUID,
        renewal_type: str,
        new_end_date: date,
        approver_id: UUID,
    ):
        # --------------------------------------------------------
        # GET CONTRACT
        # --------------------------------------------------------

        contract = (
            db.query(Contract)
            .filter(
                Contract.id == contract_id,
                Contract.organization_id == organization_id,
            )
            .first()
        )

        if not contract:
            raise ValueError(
                "Contract not found."
            )

        # --------------------------------------------------------
        # CURRENT END DATE REQUIRED
        # --------------------------------------------------------

        if not contract.end_date:
            raise ValueError(
                "Contract has no current end date."
            )

        # --------------------------------------------------------
        # NEW END DATE VALIDATION
        # --------------------------------------------------------

        if new_end_date <= contract.end_date:
            raise ValueError(
                "New end date must be later than the current contract end date."
            )

        # --------------------------------------------------------
        # GENERATE RENEWAL NUMBER
        # --------------------------------------------------------

        renewal_no = (
            RenewalService.generate_renewal_number(
                db,
                organization_id,
            )
        )

        # --------------------------------------------------------
        # CREATE RENEWAL
        # --------------------------------------------------------

        renewal = Renewal(
            id=uuid4(),

            organization_id=organization_id,

            contract_id=contract_id,

            renewal_no=renewal_no,

            renewal_type=renewal_type,

            current_end_date=contract.end_date,

            new_end_date=new_end_date,

            # IMPORTANT:
            # A newly created renewal must go through approval.
            status="Pending Approval",
        )

        # --------------------------------------------------------
        # ADD TO CURRENT TRANSACTION
        # --------------------------------------------------------

        db.add(renewal)

        # We need the renewal ID available before
        # creating the approval.
        db.flush()

        try:

            # ----------------------------------------------------
            # CREATE RENEWAL APPROVAL
            # ----------------------------------------------------

            ApprovalService.create_renewal_approval(
                db=db,

                organization_id=organization_id,

                renewal_id=renewal.id,

                approver_id=approver_id,

                remarks="Renewal submitted for approval.",
            )

            # ----------------------------------------------------
            # ApprovalRepository.create()
            # already commits the transaction.
            # ----------------------------------------------------

            db.refresh(renewal)

            return renewal

        except Exception:
            db.rollback()
            raise

    # ============================================================
    # UPDATE
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        renewal_id: UUID,
        organization_id: UUID,
        renewal_type=None,
        new_end_date=None,
        status=None,
    ):
        renewal = (
            RenewalRepository.get_by_id(
                db,
                renewal_id,
                organization_id,
            )
        )

        if not renewal:
            raise ValueError(
                "Renewal not found."
            )

        if renewal_type is not None:
            renewal.renewal_type = (
                renewal_type
            )

        if new_end_date is not None:

            if (
                new_end_date
                <= renewal.current_end_date
            ):
                raise ValueError(
                    "New end date must be later than the current end date."
                )

            renewal.new_end_date = (
                new_end_date
            )

        # --------------------------------------------------------
        # STATUS UPDATE
        # --------------------------------------------------------

        if status is not None:
            renewal.status = status

        return RenewalRepository.update(
            db,
            renewal,
        )

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        renewal_id: UUID,
        organization_id: UUID,
    ):
        renewal = (
            RenewalRepository.get_by_id(
                db,
                renewal_id,
                organization_id,
            )
        )

        if not renewal:
            raise ValueError(
                "Renewal not found."
            )

        return RenewalRepository.delete(
            db,
            renewal,
        )

    # ============================================================
    # GET STATS
    # ============================================================

    @staticmethod
    def get_stats(
        db: Session,
        organization_id: UUID,
    ):
        renewals = (
            RenewalRepository.get_all(
                db,
                organization_id,
            )
        )

        total = len(renewals)

        active = sum(
            1
            for renewal in renewals
            if renewal.status == "Active"
        )

        due_soon = sum(
            1
            for renewal in renewals
            if renewal.status.lower().startswith(
                "due"
            )
        )

        expired = sum(
            1
            for renewal in renewals
            if renewal.status == "Expired"
        )

        return {
            "total": total,
            "active": active,
            "due_soon": due_soon,
            "expired": expired,
        }