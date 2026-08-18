from datetime import date
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.models.contract import Contract

from app.repositories.payment_repository import (
    PaymentRepository,
)


class PaymentService:

    # ============================================================
    # GET ALL PAYMENTS
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):
        return PaymentRepository.get_all(
            db,
            organization_id,
        )


    # ============================================================
    # GET PAYMENT BY ID
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        payment_id: UUID,
        organization_id: UUID,
    ):

        payment = PaymentRepository.get_by_id(
            db,
            payment_id,
            organization_id,
        )

        if not payment:
            raise ValueError(
                "Payment not found."
            )

        return payment


    # ============================================================
    # GET PAYMENTS BY CONTRACT
    # ============================================================

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):

        return PaymentRepository.get_by_contract(
            db,
            contract_id,
            organization_id,
        )


    # ============================================================
    # GENERATE PAYMENT NUMBER
    # ============================================================

    @staticmethod
    def generate_payment_number(
        db: Session,
        organization_id: UUID,
    ):

        year = date.today().year

        prefix = f"PAY-{year}-"


        existing = (
            db.query(
                Payment.payment_no
            )
            .filter(
                Payment.organization_id
                == organization_id,

                Payment.payment_no.like(
                    f"{prefix}%"
                ),
            )
            .all()
        )


        highest = 0


        for row in existing:

            payment_no = row[0]

            if not payment_no:
                continue

            try:

                number = int(
                    payment_no.replace(
                        prefix,
                        "",
                    )
                )

                highest = max(
                    highest,
                    number,
                )

            except ValueError:

                continue


        return (
            f"{prefix}"
            f"{highest + 1:04d}"
        )


    # ============================================================
    # PAYMENT SUMMARY
    # ============================================================

    @staticmethod
    def get_payment_summary(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
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
                == contract_id,

                Payment.organization_id
                == organization_id,

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

            progress = (
                total_paid
                / contract_value
            ) * Decimal("100")

        else:

            progress = Decimal("0")


        if progress > 100:
            progress = Decimal("100")


        return {

            "contract_value":
                contract_value,

            "total_paid":
                total_paid,

            "balance":
                balance,

            "payment_progress":
                progress,

            "fully_paid":
                balance <= 0,
        }


    # ============================================================
    # CREATE PAYMENT
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        contract_id: UUID,
        payment_no: str | None,
        payment_type: str,
        amount: Decimal,
        payment_date=None,
        due_date=None,
        status: str = "Pending",
        reference_no=None,
        remarks=None,
    ):

        # --------------------------------------------------------
        # CONTRACT
        # --------------------------------------------------------

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
        # PAYMENT TYPES
        # --------------------------------------------------------

        allowed_types = {

            "Advance Payment",

            "Progress Payment",

            "Partial Payment",

            "Final Payment",

        }


        if payment_type not in allowed_types:

            raise ValueError(
                "Invalid payment type."
            )


        # --------------------------------------------------------
        # AMOUNT
        # --------------------------------------------------------

        if amount <= 0:

            raise ValueError(
                "Payment amount must be greater than zero."
            )

                    # --------------------------------------------------------
        # PREVENT OVERPAYMENT
        # --------------------------------------------------------

        contract_value = Decimal(
            str(contract.value or 0)
        )

        paid_result = (
            db.query(
                func.coalesce(
                    func.sum(Payment.amount),
                    0,
                )
            )
            .filter(
                Payment.contract_id == contract_id,
                Payment.organization_id == organization_id,
                Payment.status == "Paid",
            )
            .scalar()
        )

        total_paid = Decimal(
            str(paid_result or 0)
        )

        remaining_balance = (
            contract_value - total_paid
        )

        if remaining_balance < 0:
            remaining_balance = Decimal("0")

        if amount > remaining_balance:
            raise ValueError(
                f"Payment amount exceeds the remaining "
                f"contract balance of {remaining_balance}."
            )

        # --------------------------------------------------------
        # CONTRACT PAYMENT LIMIT
        # --------------------------------------------------------
        contract_value = Decimal(str(contract.value or 0))
        if contract_value > 0:
            committed_result = (
                db.query(func.coalesce(func.sum(Payment.amount), 0))
                .filter(
                    Payment.contract_id == contract_id,
                    Payment.organization_id == organization_id,
                    Payment.status.in_(["Paid", "Pending", "For Review"]),
                )
                .scalar()
            )
            committed_amount = Decimal(str(committed_result or 0))
            if committed_amount + Decimal(str(amount)) > contract_value:
                remaining = max(contract_value - committed_amount, Decimal("0"))
                raise ValueError(
                    f"Payment amount exceeds the remaining contract balance of {remaining:.2f}."
                )


        # --------------------------------------------------------
        # PAYMENT DATE VALIDATION
        # --------------------------------------------------------

        if (
            payment_date
            and payment_date > date.today()
        ):

            raise ValueError(
                "Payment date cannot be in the future."
            )


        # --------------------------------------------------------
        # DUE DATE VALIDATION
        # --------------------------------------------------------

        if (
            payment_date
            and due_date
            and payment_date > due_date
        ):

            raise ValueError(
                "Payment date cannot be later than due date."
            )


        # --------------------------------------------------------
        # AUTO PAYMENT NUMBER
        # --------------------------------------------------------

        if not payment_no:

            payment_no = (
                PaymentService
                .generate_payment_number(
                    db,
                    organization_id,
                )
            )


        # --------------------------------------------------------
        # DUPLICATE PAYMENT NUMBER
        # --------------------------------------------------------

        existing = (
            PaymentRepository
            .get_by_payment_no(
                db,
                payment_no,
                organization_id,
            )
        )


        if existing:

            raise ValueError(
                "Payment number already exists."
            )


        # --------------------------------------------------------
        # NEW PAYMENTS ALWAYS START PENDING
        # --------------------------------------------------------

        status = "Pending"


        # --------------------------------------------------------
        # CREATE
        # --------------------------------------------------------

        payment = Payment(

            id=uuid4(),

            organization_id=
                organization_id,

            contract_id=
                contract_id,

            payment_no=
                payment_no,

            payment_type=
                payment_type,

            amount=
                amount,

            payment_date=
                payment_date,

            due_date=
                due_date,

            status=
                status,

            reference_no=
                reference_no,

            remarks=
                remarks,
        )


        return PaymentRepository.create(
            db,
            payment,
        )


    # ============================================================
    # UPDATE PAYMENT
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        payment_id: UUID,
        organization_id: UUID,
        contract_id=None,
        payment_no=None,
        payment_type=None,
        amount=None,
        payment_date=None,
        due_date=None,
        reference_no=None,
        remarks=None,
    ):

        payment = (
            PaymentRepository.get_by_id(
                db,
                payment_id,
                organization_id,
            )
        )


        if not payment:

            raise ValueError(
                "Payment not found."
            )


        # --------------------------------------------------------
        # CONTRACT
        # --------------------------------------------------------

        if contract_id is not None:

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id
                    == contract_id,

                    Contract.organization_id
                    == organization_id,
                )
                .first()
            )


            if not contract:

                raise ValueError(
                    "Contract not found."
                )


            payment.contract_id = (
                contract_id
            )


        # --------------------------------------------------------
        # PAYMENT NUMBER
        # --------------------------------------------------------

        if payment_no is not None:

            if payment_no != payment.payment_no:

                existing = (
                    PaymentRepository
                    .get_by_payment_no(
                        db,
                        payment_no,
                        organization_id,
                    )
                )


                if (
                    existing
                    and existing.id
                    != payment.id
                ):

                    raise ValueError(
                        "Payment number already exists."
                    )


                payment.payment_no = (
                    payment_no
                )


        # --------------------------------------------------------
        # PAYMENT TYPE
        # --------------------------------------------------------

        if payment_type is not None:

            allowed_types = {

                "Advance Payment",

                "Progress Payment",

                "Partial Payment",

                "Final Payment",

            }


            if (
                payment_type
                not in allowed_types
            ):

                raise ValueError(
                    "Invalid payment type."
                )


            payment.payment_type = (
                payment_type
            )


        # --------------------------------------------------------
        # AMOUNT
        # --------------------------------------------------------

        if amount is not None:

            if amount <= 0:

                raise ValueError(
                    "Payment amount must be greater than zero."
                )


            payment.amount = amount


        # --------------------------------------------------------
        # PAYMENT DATE
        # --------------------------------------------------------

        if payment_date is not None:

            if (
                payment_date
                > date.today()
            ):

                raise ValueError(
                    "Payment date cannot be in the future."
                )


            payment.payment_date = (
                payment_date
            )


        # --------------------------------------------------------
        # DUE DATE
        # --------------------------------------------------------

        if due_date is not None:

            payment.due_date = (
                due_date
            )


        if (
            payment.payment_date
            and payment.due_date
            and payment.payment_date
            > payment.due_date
        ):

            raise ValueError(
                "Payment date cannot be later than due date."
            )


        # --------------------------------------------------------
        # REFERENCE
        # --------------------------------------------------------

        if reference_no is not None:

            payment.reference_no = (
                reference_no
            )


        # --------------------------------------------------------
        # REMARKS
        # --------------------------------------------------------

        if remarks is not None:

            payment.remarks = remarks


        # --------------------------------------------------------
        # AUTO CONTRACT STATUS
        #
        # If payment becomes Paid:
        #
        # Total Paid >= Contract Value
        #
        # then:
        #
        # Approved -> Active
        # --------------------------------------------------------

        if payment.status == "Paid":

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id
                    == payment.contract_id,

                    Contract.organization_id
                    == organization_id,
                )
                .first()
            )


            if contract:

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
                        == payment.contract_id,

                        Payment.organization_id
                        == organization_id,

                        Payment.status
                        == "Paid",

                        Payment.id
                        != payment.id,
                    )
                    .scalar()
                )


                previous_paid = Decimal(
                    str(
                        paid_result or 0
                    )
                )


                total_paid = (
                    previous_paid
                    + Decimal(
                        str(
                            payment.amount
                            or 0
                        )
                    )
                )


                contract_value = Decimal(
                    str(
                        contract.value
                        or 0
                    )
                )


                if (
                    contract_value > 0
                    and total_paid
                    >= contract_value
                ):

                    contract.status = (
                        "Active"
                    )


        return PaymentRepository.update(
            db,
            payment,
        )


    # ============================================================
    # SUBMIT FOR VERIFICATION
    # Pending -> For Review
    # ============================================================
    @staticmethod
    def submit_for_verification(db: Session, payment_id: UUID, organization_id: UUID, reference_no=None, remarks=None):
        payment = PaymentRepository.get_by_id(db, payment_id, organization_id)
        if not payment:
            raise ValueError("Payment not found.")
        if payment.status != "Pending":
            raise ValueError("Only Pending payments can be submitted for verification.")
        if reference_no is not None:
            payment.reference_no = reference_no
        if remarks is not None:
            payment.remarks = remarks
        payment.status = "For Review"
        return PaymentRepository.update(db, payment)

    # ============================================================
    # CONFIRM RECEIVED
    # For Review -> Paid
    # ============================================================
    @staticmethod
    def confirm_received(db: Session, payment_id: UUID, organization_id: UUID, remarks=None):
        payment = PaymentRepository.get_by_id(db, payment_id, organization_id)
        if not payment:
            raise ValueError("Payment not found.")
        if payment.status != "For Review":
            raise ValueError("Only payments For Review can be confirmed.")
        contract = (db.query(Contract).filter(Contract.id == payment.contract_id, Contract.organization_id == organization_id).first())
        if not contract:
            raise ValueError("Contract not found.")
        contract_value = Decimal(str(contract.value or 0))
        paid_result = (db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(Payment.contract_id == payment.contract_id, Payment.organization_id == organization_id, Payment.status == "Paid", Payment.id != payment.id).scalar())
        total_paid_after = Decimal(str(paid_result or 0)) + Decimal(str(payment.amount or 0))
        if contract_value > 0 and total_paid_after > contract_value:
            raise ValueError("This payment would exceed the contract value.")
        if remarks is not None:
            payment.remarks = remarks
        if not payment.payment_date:
            payment.payment_date = date.today()
        payment.status = "Paid"
        if contract_value > 0 and total_paid_after >= contract_value:
            contract.status = "Active"
        return PaymentRepository.update(db, payment)

    # ============================================================
    # REJECT
    # For Review -> Rejected
    # ============================================================
    @staticmethod
    def reject(db: Session, payment_id: UUID, organization_id: UUID, remarks=None):
        payment = PaymentRepository.get_by_id(db, payment_id, organization_id)
        if not payment:
            raise ValueError("Payment not found.")
        if payment.status != "For Review":
            raise ValueError("Only payments For Review can be rejected.")
        if not remarks or not remarks.strip():
            raise ValueError("Rejection reason is required.")
        payment.remarks = remarks.strip()
        payment.status = "Rejected"
        return PaymentRepository.update(db, payment)

    # ============================================================
    # DELETE PAYMENT
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        payment_id: UUID,
        organization_id: UUID,
    ):

        payment = (
            PaymentRepository.get_by_id(
                db,
                payment_id,
                organization_id,
            )
        )


        if not payment:

            raise ValueError(
                "Payment not found."
            )


        return PaymentRepository.delete(
            db,
            payment,
        )
