"""add renewal support to approvals

Revision ID: 015307234b83
Revises: create_renewals_table
Create Date: 2026-08-17 20:36:57.899304

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "015307234b83"
down_revision: Union[str, Sequence[str], None] = "create_renewals_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add renewal support to approvals.

    Existing contract and amendment approvals continue to work.
    Renewal approvals will use renewal_id.
    """

    # ------------------------------------------------------------
    # Make contract_id optional
    # ------------------------------------------------------------

    op.alter_column(
        "approvals",
        "contract_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=True,
    )

    # ------------------------------------------------------------
    # Add renewal_id
    # ------------------------------------------------------------

    op.add_column(
        "approvals",
        sa.Column(
            "renewal_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    # ------------------------------------------------------------
    # Foreign key: approvals.renewal_id
    #                  -> renewals.id
    # ------------------------------------------------------------

    op.create_foreign_key(
        "fk_approvals_renewal_id_renewals",
        "approvals",
        "renewals",
        ["renewal_id"],
        ["id"],
    )

    # ------------------------------------------------------------
    # Index
    # ------------------------------------------------------------

    op.create_index(
        "ix_approvals_renewal_id",
        "approvals",
        ["renewal_id"],
    )


def downgrade() -> None:
    """
    Remove renewal support from approvals.
    """

    # ------------------------------------------------------------
    # Remove index
    # ------------------------------------------------------------

    op.drop_index(
        "ix_approvals_renewal_id",
        table_name="approvals",
    )

    # ------------------------------------------------------------
    # Remove foreign key
    # ------------------------------------------------------------

    op.drop_constraint(
        "fk_approvals_renewal_id_renewals",
        "approvals",
        type_="foreignkey",
    )

    # ------------------------------------------------------------
    # Remove renewal_id
    # ------------------------------------------------------------

    op.drop_column(
        "approvals",
        "renewal_id",
    )

    # ------------------------------------------------------------
    # Restore contract_id as required
    # ------------------------------------------------------------

    op.alter_column(
        "approvals",
        "contract_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )