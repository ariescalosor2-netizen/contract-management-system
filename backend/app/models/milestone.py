import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Milestone(Base):
    __tablename__ = "milestones"

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

    milestone_no: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    due_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    # ============================================================
    # AUTOMATIC PROGRESS
    # ============================================================
    #
    # Progress is calculated from completed tasks.
    #
    # Example:
    # 2 completed / 4 tasks = 50%
    #
    # This should NOT be manually edited by the user.
    #
    # ============================================================

    progress: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # ============================================================
    # AUTOMATIC STATUS
    # ============================================================
    #
    # Status is calculated from task completion.
    #
    # 0%   -> Not Started
    # 1-99 -> In Progress
    # 100% -> Completed
    #
    # ============================================================

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Not Started",
    )

    # ============================================================
    # ARCHIVE
    # ============================================================

    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
        index=True,
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
    # ORGANIZATION
    # ============================================================

    organization = relationship(
        "Organization",
    )

    # ============================================================
    # CONTRACT
    # ============================================================

    contract = relationship(
        "Contract",
        backref="milestones",
    )

    # ============================================================
    # MILESTONE TASKS
    # ============================================================
    #
    # One Milestone can have many Tasks.
    #
    # Milestone
    #    ├── Task 1
    #    ├── Task 2
    #    └── Task 3
    #
    # Tasks are the source of truth for:
    # - progress
    # - status
    #
    # ============================================================

    tasks = relationship(
        "MilestoneTask",
        back_populates="milestone",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="MilestoneTask.created_at.asc()",
    )

    # ============================================================
    # REPRESENTATION
    # ============================================================

    def __repr__(self) -> str:
        return (
            f"<Milestone("
            f"milestone_no='{self.milestone_no}'"
            f")>"
        )