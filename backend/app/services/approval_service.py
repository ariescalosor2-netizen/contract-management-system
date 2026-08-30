from datetime import date, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.approval import Approval
from app.models.contract import Contract
from app.models.amendment import Amendment
from app.models.renewal import Renewal
from app.repositories.approval_repository import ApprovalRepository


class ApprovalService:

    # ============================================================
    # GET ALL APPROVALS
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return ApprovalRepository.get_all(
            db,
            organization_id,
        )

    # ============================================================
    # GET SINGLE APPROVAL
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        approval_id: UUID,
        organization_id: UUID,
    ):
        approval = ApprovalRepository.get_by_id(
            db,
            approval_id,
            organization_id,
        )

        if not approval:
            raise ValueError(
                "Approval not found."
            )

        return approval

    # ============================================================
    # GET CONTRACT APPROVALS
    # ============================================================

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return ApprovalRepository.get_by_contract(
            db,
            contract_id,
            organization_id,
        )

    # ============================================================
    # GET AMENDMENT APPROVALS
    # ============================================================

    @staticmethod
    def get_by_amendment(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
    ):
        return ApprovalRepository.get_by_amendment(
            db,
            amendment_id,
            organization_id,
        )

    # ============================================================
    # GET PENDING CONTRACT APPROVAL
    # ============================================================

    @staticmethod
    def get_pending_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return ApprovalRepository.get_pending_by_contract(
            db,
            contract_id,
            organization_id,
        )

    # ============================================================
    # GET PENDING AMENDMENT APPROVAL
    # ============================================================

    @staticmethod
    def get_pending_by_amendment(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
    ):
        return ApprovalRepository.get_pending_by_amendment(
            db,
            amendment_id,
            organization_id,
        )

    # ============================================================
    # CREATE CONTRACT APPROVAL
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        contract_id: UUID,
        approver_id: UUID,
        remarks: str | None = None,
    ):
        contract = (
            db.query(Contract)
            .filter(
                Contract.id == contract_id,
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
        # CONTRACT STATUS VALIDATION
        # --------------------------------------------------------

        allowed_statuses = {
            "Draft",
            "Pending Approval",
        }

        if contract.status not in allowed_statuses:
            raise ValueError(
                "Only Draft or Pending Approval contracts "
                "can be submitted for approval."
            )

        # --------------------------------------------------------
        # PREVENT DUPLICATE PENDING APPROVAL
        # --------------------------------------------------------

        existing = (
            ApprovalRepository.get_pending_by_contract(
                db,
                contract_id,
                organization_id,
            )
        )

        if existing:
            raise ValueError(
                "This contract already has a pending approval."
            )

        # --------------------------------------------------------
        # CREATE APPROVAL
        # --------------------------------------------------------

        approval = Approval(
            organization_id=organization_id,
            contract_id=contract_id,
            amendment_id=None,
            approver_id=approver_id,
            decision="Pending",
            remarks=remarks,
        )

        # --------------------------------------------------------
        # CONTRACT BECOMES PENDING APPROVAL
        # --------------------------------------------------------

        contract.status = "Pending Approval"

        return ApprovalRepository.create(
            db,
            approval,
        )

    # ============================================================
    # CREATE AMENDMENT APPROVAL
    # ============================================================

    @staticmethod
    def create_amendment_approval(
        db: Session,
        organization_id: UUID,
        amendment_id: UUID,
        approver_id: UUID,
        remarks: str | None = None,
    ):
        amendment = (
            db.query(Amendment)
            .filter(
                Amendment.id == amendment_id,
                Amendment.organization_id
                == organization_id,
            )
            .first()
        )

        if not amendment:
            raise ValueError(
                "Amendment not found."
            )

        # --------------------------------------------------------
        # AMENDMENT MUST BE PENDING
        # --------------------------------------------------------

        if amendment.status not in {
            "Pending",
            "Pending Approval",
        }:
            raise ValueError(
                "Only pending amendments can be submitted "
                "for approval."
            )

        # --------------------------------------------------------
        # PREVENT DUPLICATE PENDING APPROVAL
        # --------------------------------------------------------

        existing = (
            ApprovalRepository.get_pending_by_amendment(
                db,
                amendment_id,
                organization_id,
            )
        )

        if existing:
            raise ValueError(
                "This amendment already has a pending approval."
            )

        # --------------------------------------------------------
        # CREATE AMENDMENT APPROVAL
        # --------------------------------------------------------
        #
        # IMPORTANT:
        #
        # The original contract DOES NOT become
        # "Pending Approval".
        #
        # Only the amendment goes through approval.
        #

        approval = Approval(
            organization_id=organization_id,
            contract_id=None,
            amendment_id=amendment_id,
            approver_id=approver_id,
            decision="Pending",
            remarks=remarks,
        )

        amendment.status = "Pending Approval"

        return ApprovalRepository.create(
            db,
            approval,
        )

            # ============================================================
    # CREATE RENEWAL APPROVAL
    # ============================================================

    @staticmethod
    def create_renewal_approval(
        db: Session,
        organization_id: UUID,
        renewal_id: UUID,
        approver_id: UUID,
        remarks: str | None = None,
    ):
        renewal = (
            db.query(Renewal)
            .filter(
                Renewal.id == renewal_id,
                Renewal.organization_id == organization_id,
            )
            .first()
        )

        if not renewal:
            raise ValueError(
                "Renewal not found."
            )

        # --------------------------------------------------------
        # RENEWAL MUST BE PENDING APPROVAL
        # --------------------------------------------------------

        if renewal.status != "Pending Approval":
            raise ValueError(
                "Only renewals pending approval can be submitted "
                "for approval."
            )

        # --------------------------------------------------------
        # PREVENT DUPLICATE PENDING APPROVAL
        # --------------------------------------------------------

        existing = (
            db.query(Approval)
            .filter(
                Approval.organization_id == organization_id,
                Approval.renewal_id == renewal_id,
                Approval.decision == "Pending",
            )
            .first()
        )

        if existing:
            raise ValueError(
                "This renewal already has a pending approval."
            )

        # --------------------------------------------------------
        # CREATE RENEWAL APPROVAL
        # --------------------------------------------------------

        approval = Approval(
            organization_id=organization_id,
            contract_id=None,
            amendment_id=None,
            renewal_id=renewal_id,
            approver_id=approver_id,
            decision="Pending",
            remarks=remarks,
        )

        return ApprovalRepository.create(
            db,
            approval,
        )

    # ============================================================
    # APPROVE
    # ============================================================

    @staticmethod
    def approve(
        db: Session,
        approval_id: UUID,
        organization_id: UUID,
        approver_id: UUID,
        remarks: str | None = None,
    ):
        approval = ApprovalService.get_by_id(
            db,
            approval_id,
            organization_id,
        )

        # --------------------------------------------------------
        # ONLY PENDING APPROVALS CAN BE DECIDED
        # --------------------------------------------------------

        if approval.decision != "Pending":
            raise ValueError(
                "This approval has already been decided."
            )

        # --------------------------------------------------------
        # ENSURE CURRENT USER IS THE ASSIGNED APPROVER
        # --------------------------------------------------------

        if approval.approver_id != approver_id:
            raise ValueError(
                "You are not the assigned approver for this request."
            )

        # ========================================================
        # RENEWAL APPROVAL
        # ========================================================

        if approval.renewal_id:

            renewal = (
                db.query(Renewal)
                .filter(
                    Renewal.id == approval.renewal_id,
                    Renewal.organization_id == organization_id,
                )
                .first()
            )

            if not renewal:
                raise ValueError(
                    "Renewal not found."
                )

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id == renewal.contract_id,
                    Contract.organization_id == organization_id,
                )
                .first()
            )

            if not contract:
                raise ValueError(
                    "Contract associated with renewal not found."
                )

            if renewal.new_end_date is not None:
                contract.end_date = renewal.new_end_date

                # A successfully approved renewal makes
                # the contract active again.
                if contract.end_date >= date.today():
                    contract.status = "Active"

            renewal.status = "Active"

            approval.decision = "Approved"
            approval.remarks = remarks
            approval.approved_at = datetime.utcnow()

            return ApprovalRepository.update(
                db,
                approval,
            )

        # ========================================================
        # AMENDMENT APPROVAL
        # ========================================================

        if approval.amendment_id:

            amendment = (
                db.query(Amendment)
                .filter(
                    Amendment.id
                    == approval.amendment_id,
                    Amendment.organization_id
                    == organization_id,
                )
                .first()
            )

            if not amendment:
                raise ValueError(
                    "Amendment not found."
                )

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id
                    == amendment.contract_id,
                    Contract.organization_id
                    == organization_id,
                )
                .first()
            )

            if not contract:
                raise ValueError(
                    "Contract associated with amendment not found."
                )

            # ----------------------------------------------------
            # APPLY AMENDED CONTRACT VALUE
            # ----------------------------------------------------

            if amendment.amended_value is not None:
                contract.contract_value = (
                    amendment.amended_value
                )

            # ----------------------------------------------------
            # APPLY NEW START DATE
            # ----------------------------------------------------

            if amendment.new_start_date is not None:
                contract.start_date = (
                    amendment.new_start_date
                )

            # ----------------------------------------------------
            # APPLY NEW END DATE
            # ----------------------------------------------------

            if amendment.new_end_date is not None:
                contract.end_date = (
                    amendment.new_end_date
                )

            # ----------------------------------------------------
            # APPROVE AMENDMENT
            # ----------------------------------------------------

            amendment.status = "Approved"

            amendment.approved_by = approver_id

            amendment.approved_at = datetime.utcnow()

            approval.decision = "Approved"

            approval.remarks = remarks

            approval.approved_at = datetime.utcnow()

            return ApprovalRepository.update(
                db,
                approval,
            )

        # ========================================================
        # CONTRACT APPROVAL
        # ========================================================

        if approval.contract_id:

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id
                    == approval.contract_id,
                    Contract.organization_id
                    == organization_id,
                )
                .first()
            )

            if not contract:
                raise ValueError(
                    "Contract not found."
                )

            # ----------------------------------------------------
            # APPROVE CONTRACT
            # ----------------------------------------------------

            contract.status = "Approved"

            approval.decision = "Approved"

            approval.remarks = remarks

            approval.approved_at = datetime.utcnow()

            return ApprovalRepository.update(
                db,
                approval,
            )

        raise ValueError(
            "Approval is not associated with a contract "
            "or amendment."
        )

    # ============================================================
    # REJECT
    # ============================================================

    @staticmethod
    def reject(
        db: Session,
        approval_id: UUID,
        organization_id: UUID,
        approver_id: UUID,
        remarks: str,
    ):
        approval = ApprovalService.get_by_id(
            db,
            approval_id,
            organization_id,
        )

        # --------------------------------------------------------
        # ONLY PENDING APPROVALS CAN BE REJECTED
        # --------------------------------------------------------

        if approval.decision != "Pending":
            raise ValueError(
                "This approval has already been decided."
            )

        # --------------------------------------------------------
        # REJECTION REMARKS REQUIRED
        # --------------------------------------------------------

        if not remarks or not remarks.strip():
            raise ValueError(
                "Rejection remarks are required."
            )

        # --------------------------------------------------------
        # ENSURE CURRENT USER IS THE ASSIGNED APPROVER
        # --------------------------------------------------------

        if approval.approver_id != approver_id:
            raise ValueError(
                "You are not the assigned approver for this request."
            )

        # ========================================================
        # AMENDMENT REJECTION
        # ========================================================

        if approval.amendment_id:

            amendment = (
                db.query(Amendment)
                .filter(
                    Amendment.id
                    == approval.amendment_id,
                    Amendment.organization_id
                    == organization_id,
                )
                .first()
            )

            if not amendment:
                raise ValueError(
                    "Amendment not found."
                )

            # ----------------------------------------------------
            # REJECT AMENDMENT
            # ----------------------------------------------------

            amendment.status = "Rejected"

            amendment.rejection_reason = (
                remarks.strip()
            )

            approval.decision = "Rejected"

            approval.remarks = (
                remarks.strip()
            )

            return ApprovalRepository.update(
                db,
                approval,
            )

        # ========================================================
        # RENEWAL REJECTION
        # ========================================================

        if approval.renewal_id:

            renewal = (
                db.query(Renewal)
                .filter(
                    Renewal.id == approval.renewal_id,
                    Renewal.organization_id == organization_id,
                )
                .first()
            )

            if not renewal:
                raise ValueError(
                    "Renewal not found."
                )

            # "Rejected" belongs to Approval.decision.
            # Renewal.status only uses:
            # Active / Due Soon / Expired.

            if renewal.current_end_date is None:
                renewal.status = "Active"
            else:
                days_until_end = (
                    renewal.current_end_date - date.today()
                ).days

                if days_until_end < 0:
                    renewal.status = "Expired"
                elif days_until_end <= 30:
                    renewal.status = "Due Soon"
                else:
                    renewal.status = "Active"

            approval.decision = "Rejected"
            approval.remarks = remarks.strip()

            return ApprovalRepository.update(
                db,
                approval,
            )

        # ========================================================
        # CONTRACT REJECTION
        # ========================================================

        if approval.contract_id:

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id
                    == approval.contract_id,
                    Contract.organization_id
                    == organization_id,
                )
                .first()
            )

            if not contract:
                raise ValueError(
                    "Contract not found."
                )

            # ----------------------------------------------------
            # CONTRACT RETURNS TO DRAFT
            # ----------------------------------------------------

            contract.status = "Draft"

            approval.decision = "Rejected"

            approval.remarks = (
                remarks.strip()
            )

            return ApprovalRepository.update(
                db,
                approval,
            )

        raise ValueError(
            "Approval is not associated with a contract, "
            "amendment, or renewal."
        )