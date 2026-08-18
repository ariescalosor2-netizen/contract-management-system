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
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Document(Base):

    __tablename__ = "documents"

    # ============================================================
    # ID
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
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # DOCUMENT INFORMATION
    # ============================================================

    document_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    document_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Other",
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    content_type: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    file_size: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # UPLOADED BY
    # ============================================================

    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
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
        backref="documents",
    )

    uploader = relationship(
        "User",
    )

    def __repr__(self) -> str:

        return (
            f"<Document("
            f"name='{self.document_name}', "
            f"file='{self.file_name}'"
            f")>"
        )