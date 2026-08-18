from uuid import UUID

from sqlalchemy.orm import Session

from app.models.payment import Payment


class PaymentRepository:

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return (
            db.query(Payment)
            .filter(
                Payment.organization_id
                == organization_id
            )
            .order_by(
                Payment.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        payment_id: UUID,
        organization_id: UUID,
    ):
        return (
            db.query(Payment)
            .filter(
                Payment.id == payment_id,
                Payment.organization_id
                == organization_id,
            )
            .first()
        )

    @staticmethod
    def get_by_payment_no(
        db: Session,
        payment_no: str,
        organization_id: UUID,
    ):
        return (
            db.query(Payment)
            .filter(
                Payment.payment_no
                == payment_no,
                Payment.organization_id
                == organization_id,
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
            db.query(Payment)
            .filter(
                Payment.contract_id
                == contract_id,
                Payment.organization_id
                == organization_id,
            )
            .order_by(
                Payment.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        payment: Payment,
    ):
        db.add(payment)
        db.commit()
        db.refresh(payment)

        return payment

    @staticmethod
    def update(
        db: Session,
        payment: Payment,
    ):
        db.commit()
        db.refresh(payment)

        return payment

    @staticmethod
    def delete(
        db: Session,
        payment: Payment,
    ):
        db.delete(payment)
        db.commit()

        return True