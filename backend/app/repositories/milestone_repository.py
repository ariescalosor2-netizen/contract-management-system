from uuid import UUID

from sqlalchemy.orm import Session

from app.models.milestone import Milestone


class MilestoneRepository:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(Milestone)
            .filter(
                Milestone.organization_id == organization_id
            )
            .order_by(
                Milestone.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        milestone_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Milestone)
            .filter(
                Milestone.id == milestone_id,
                Milestone.organization_id == organization_id,
            )
            .first()
        )

    @staticmethod
    def get_by_milestone_no(
        db: Session,
        milestone_no: str,
        organization_id: UUID,
    ):
        return (
            db.query(Milestone)
            .filter(
                Milestone.milestone_no == milestone_no,
                Milestone.organization_id == organization_id,
            )
            .first()
        )

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Milestone)
            .filter(
                Milestone.contract_id == contract_id,
                Milestone.organization_id == organization_id,
            )
            .order_by(
                Milestone.due_date.asc()
            )
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        milestone: Milestone,
    ):
        db.add(milestone)
        db.commit()
        db.refresh(milestone)

        return milestone

    @staticmethod
    def update(
        db: Session,
        milestone: Milestone,
    ):
        db.commit()
        db.refresh(milestone)

        return milestone

    @staticmethod
    def delete(
        db: Session,
        milestone: Milestone,
    ):
        db.delete(milestone)
        db.commit()

        return True