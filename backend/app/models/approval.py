import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base


class Approval(Base):
    __tablename__ = "approvals"

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

    contract_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contracts.id"),
        nullable=True,
        index=True,
    )

    contract = relationship(
        "Contract",
        foreign_keys=[contract_id],
        lazy="joined",
    )

    # ============================================================
    # AMENDMENT
    # ============================================================

    amendment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("amendments.id"),
        nullable=True,
        index=True,
    )

    amendment = relationship(
        "Amendment",
        foreign_keys=[amendment_id],
        lazy="joined",
    )

    # ============================================================
    # RENEWAL
    # ============================================================

    renewal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("renewals.id"),
        nullable=True,
        index=True,
    )

    renewal = relationship(
        "Renewal",
        foreign_keys=[renewal_id],
        lazy="joined",
    )

    # ============================================================
    # APPROVER
    # ============================================================

    approver_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )

    approver = relationship(
        "User",
        primaryjoin="Approval.approver_id == User.id",
        foreign_keys=[approver_id],
        viewonly=True,
        lazy="joined",
    )

    # ============================================================
    # DECISION
    # ============================================================

    decision: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Pending",
        index=True,
    )

    # ============================================================
    # REMARKS
    # ============================================================

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # APPROVED AT
    # ============================================================

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # CREATED / UPDATED
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