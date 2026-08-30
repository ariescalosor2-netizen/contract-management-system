from uuid import UUID

from sqlalchemy.orm import Session

from app.models.approval import Approval


class ApprovalRepository:

    # ============================================================
    # GET ALL APPROVALS
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(Approval)
            .filter(
                Approval.organization_id
                == organization_id
            )
            .order_by(
                Approval.created_at.desc()
            )
            .all()
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
        return (
            db.query(Approval)
            .filter(
                Approval.id == approval_id,
                Approval.organization_id
                == organization_id,
            )
            .first()
        )

    # ============================================================
    # GET CONTRACT APPROVALS
    # ============================================================

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Approval)
            .filter(
                Approval.contract_id
                == contract_id,
                Approval.organization_id
                == organization_id,
            )
            .order_by(
                Approval.created_at.desc()
            )
            .all()
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
        return (
            db.query(Approval)
            .filter(
                Approval.amendment_id
                == amendment_id,
                Approval.organization_id
                == organization_id,
            )
            .order_by(
                Approval.created_at.desc()
            )
            .all()
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
        return (
            db.query(Approval)
            .filter(
                Approval.contract_id
                == contract_id,
                Approval.organization_id
                == organization_id,
                Approval.decision
                == "Pending",
            )
            .first()
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
        return (
            db.query(Approval)
            .filter(
                Approval.amendment_id
                == amendment_id,
                Approval.organization_id
                == organization_id,
                Approval.decision
                == "Pending",
            )
            .first()
        )

    # ============================================================
    # CREATE
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        approval: Approval,
    ):
        db.add(approval)

        db.commit()

        db.refresh(approval)

        return approval

    # ============================================================
    # UPDATE
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        approval: Approval,
    ):
        db.commit()

        db.refresh(approval)

        return approval

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        approval: Approval,
    ):
        db.delete(approval)

        db.commit()

        return approval