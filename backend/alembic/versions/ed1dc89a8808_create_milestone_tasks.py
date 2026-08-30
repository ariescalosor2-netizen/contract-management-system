"""create milestone tasks

Revision ID: ed1dc89a8808
Revises: 015307234b83
Create Date: 2026-08-19

Creates the milestone_tasks table for
checklist-based milestone progress.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# ============================================================
# REVISION IDENTIFIERS
# ============================================================

revision: str = "ed1dc89a8808"

down_revision: Union[
    str,
    Sequence[str],
    None
] = "015307234b83"

branch_labels: Union[
    str,
    Sequence[str],
    None
] = None

depends_on: Union[
    str,
    Sequence[str],
    None
] = None


# ============================================================
# UPGRADE
# ============================================================

def upgrade() -> None:
    """
    Create milestone_tasks table.
    """

    op.create_table(
        "milestone_tasks",

        # ----------------------------------------------------
        # ID
        # ----------------------------------------------------

        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),

        # ----------------------------------------------------
        # MILESTONE
        # ----------------------------------------------------

        sa.Column(
            "milestone_id",
            sa.UUID(),
            nullable=False,
        ),

        # ----------------------------------------------------
        # TASK DETAILS
        # ----------------------------------------------------

        sa.Column(
            "title",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),

        # ----------------------------------------------------
        # COMPLETION
        # ----------------------------------------------------

        sa.Column(
            "is_completed",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),

        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        # ----------------------------------------------------
        # TIMESTAMPS
        # ----------------------------------------------------

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        # ----------------------------------------------------
        # FOREIGN KEY
        # ----------------------------------------------------

        sa.ForeignKeyConstraint(
            ["milestone_id"],
            ["milestones.id"],
            ondelete="CASCADE",
        ),

        # ----------------------------------------------------
        # PRIMARY KEY
        # ----------------------------------------------------

        sa.PrimaryKeyConstraint(
            "id"
        ),
    )

    # ========================================================
    # INDEX: MILESTONE ID
    # ========================================================

    op.create_index(
        "ix_milestone_tasks_milestone_id",
        "milestone_tasks",
        ["milestone_id"],
        unique=False,
    )

    # ========================================================
    # INDEX: COMPLETION
    # ========================================================

    op.create_index(
        "ix_milestone_tasks_is_completed",
        "milestone_tasks",
        ["is_completed"],
        unique=False,
    )


# ============================================================
# DOWNGRADE
# ============================================================

def downgrade() -> None:
    """
    Remove milestone_tasks table.
    """

    op.drop_index(
        "ix_milestone_tasks_is_completed",
        table_name="milestone_tasks",
    )

    op.drop_index(
        "ix_milestone_tasks_milestone_id",
        table_name="milestone_tasks",
    )

    op.drop_table(
        "milestone_tasks"
    )