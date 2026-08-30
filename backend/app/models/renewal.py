import uuid

from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    String,
    func,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base


class Renewal(Base):
    __tablename__ = "renewals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False,
        index=True,
    )

    contract_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contracts.id"),
        nullable=False,
        index=True,
    )

    renewal_no: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    renewal_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    current_end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    new_end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Active",
    )

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

    organization = relationship(
        "Organization",
    )

    contract = relationship(
        "Contract",
        backref="renewals",
    )

    def __repr__(self) -> str:
        return (
            f"<Renewal("
            f"renewal_no='{self.renewal_no}'"
            f")>"
        )