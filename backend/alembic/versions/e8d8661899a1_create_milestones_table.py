"""create milestones table

Revision ID: e8d8661899a1
Revises: 7c813f578684
Create Date: 2026-08-16 22:22:11.955154

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e8d8661899a1"

down_revision: Union[
    str,
    Sequence[str],
    None
] = "7c813f578684"

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


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "milestones",

        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "organization_id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "contract_id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "milestone_no",
            sa.String(length=50),
            nullable=False,
        ),

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

        sa.Column(
            "due_date",
            sa.Date(),
            nullable=False,
        ),

        sa.Column(
            "progress",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),

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

        sa.ForeignKeyConstraint(
            ["contract_id"],
            ["contracts.id"],
        ),

        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),

        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_milestones_contract_id"),
        "milestones",
        ["contract_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_milestones_milestone_no"),
        "milestones",
        ["milestone_no"],
        unique=True,
    )

    op.create_index(
        op.f("ix_milestones_organization_id"),
        "milestones",
        ["organization_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_milestones_organization_id"),
        table_name="milestones",
    )

    op.drop_index(
        op.f("ix_milestones_milestone_no"),
        table_name="milestones",
    )

    op.drop_index(
        op.f("ix_milestones_contract_id"),
        table_name="milestones",
    )

    op.drop_table("milestones")