from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.amendment import Amendment


class AmendmentRepository:

    # ============================================================
    # GET ALL AMENDMENTS
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(Amendment)
            .options(
                joinedload(
                    Amendment.contract
                ),
                joinedload(
                    Amendment.requester
                ),
            )
            .filter(
                Amendment.organization_id
                == organization_id
            )
            .order_by(
                Amendment.created_at.desc()
            )
            .all()
        )

    # ============================================================
    # GET SINGLE AMENDMENT
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        amendment_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Amendment)
            .options(
                joinedload(
                    Amendment.contract
                ),
                joinedload(
                    Amendment.requester
                ),
            )
            .filter(
                Amendment.id
                == amendment_id,

                Amendment.organization_id
                == organization_id,
            )
            .first()
        )

    # ============================================================
    # GET AMENDMENTS BY CONTRACT
    # ============================================================

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Amendment)
            .options(
                joinedload(
                    Amendment.contract
                ),
                joinedload(
                    Amendment.requester
                ),
            )
            .filter(
                Amendment.contract_id
                == contract_id,

                Amendment.organization_id
                == organization_id,
            )
            .order_by(
                Amendment.created_at.desc()
            )
            .all()
        )

    # ============================================================
    # GET LATEST AMENDMENT NUMBER
    # ============================================================

    @staticmethod
    def get_latest_number(
        db: Session,
        organization_id: UUID,
        prefix: str,
    ):
        return (
            db.query(
                Amendment.amendment_no
            )
            .filter(
                Amendment.organization_id
                == organization_id,

                Amendment.amendment_no.like(
                    f"{prefix}%"
                ),
            )
            .order_by(
                Amendment.amendment_no.desc()
            )
            .first()
        )

    # ============================================================
    # CREATE
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        amendment: Amendment,
    ):
        db.add(amendment)

        db.commit()

        db.refresh(amendment)

        return amendment

    # ============================================================
    # UPDATE
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        amendment: Amendment,
    ):
        db.commit()

        db.refresh(amendment)

        return amendment

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        amendment: Amendment,
    ):
        db.delete(amendment)

        db.commit()

        return True