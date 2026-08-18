import uuid

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Amendment(Base):
    __tablename__ = "amendments"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ============================================================
    # ORGANIZATION
    # ============================================================

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # CONTRACT
    # ============================================================

    contract_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contracts.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # AMENDMENT NUMBER
    # ============================================================

    amendment_no: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    # ============================================================
    # AMENDMENT DETAILS
    # ============================================================

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    amendment_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # ============================================================
    # CONTRACT VALUE CHANGES
    # ============================================================

    original_value: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    amended_value: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    # ============================================================
    # CONTRACT DATE CHANGES
    # ============================================================

    original_start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    original_end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    new_start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    new_end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    # ============================================================
    # SCOPE
    # ============================================================

    scope_changes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # REQUESTER
    # ============================================================

    requested_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # STATUS
    # ============================================================

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Pending",
        index=True,
    )

    # ============================================================
    # REQUEST DATE
    # ============================================================

    request_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )

    # ============================================================
    # EFFECTIVE DATE
    # ============================================================

    effective_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    # ============================================================
    # REJECTION
    # ============================================================

    rejection_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # APPROVAL
    # ============================================================

    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    organization = relationship(
        "Organization",
    )

    contract = relationship(
        "Contract",
        backref="amendments",
    )

    requester = relationship(
        "User",
        foreign_keys=[requested_by],
    )

    approver = relationship(
        "User",
        foreign_keys=[approved_by],
    )

    # ============================================================
    # REPRESENTATION
    # ============================================================

    def __repr__(self) -> str:
        return (
            f"<Amendment("
            f"amendment_no='{self.amendment_no}'"
            f")>"
        )