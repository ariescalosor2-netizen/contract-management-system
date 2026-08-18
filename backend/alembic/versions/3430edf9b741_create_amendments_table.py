"""create amendments table

Revision ID: 3430edf9b741
Revises: 585a56ef221e
Create Date: 2026-08-16 23:58:47.326070

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# ============================================================
# REVISION IDENTIFIERS
# ============================================================

revision: str = "3430edf9b741"
down_revision: Union[str, Sequence[str], None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ============================================================
# UPGRADE
# ============================================================

def upgrade() -> None:
    """
    Upgrade amendments table.

    This migration safely updates an existing amendments table
    without losing existing amendment records.
    """

    # --------------------------------------------------------
    # 1. ADD NEW COLUMNS AS NULLABLE FIRST
    # --------------------------------------------------------
    # Existing rows already exist in the database.
    # Therefore, these must initially allow NULL values.

    op.add_column(
        "amendments",
        sa.Column(
            "title",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "reason",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "original_value",
            sa.Numeric(precision=15, scale=2),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "amended_value",
            sa.Numeric(precision=15, scale=2),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "original_start_date",
            sa.Date(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "original_end_date",
            sa.Date(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "new_start_date",
            sa.Date(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "new_end_date",
            sa.Date(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "scope_changes",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "rejection_reason",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "approved_by",
            sa.UUID(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "approved_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # --------------------------------------------------------
    # 2. MIGRATE EXISTING DATA
    # --------------------------------------------------------
    # Existing amendments already have description and
    # amendment_type. Use those values to populate the new
    # required fields.

    op.execute(
        """
        UPDATE amendments
        SET
            title = COALESCE(
                NULLIF(TRIM(description), ''),
                'Contract Amendment'
            ),
            reason = COALESCE(
                NULLIF(TRIM(description), ''),
                'Existing amendment record'
            )
        WHERE title IS NULL
           OR reason IS NULL
        """
    )

    # Preserve old approval date by converting it into the
    # new approved_at timestamp field.

    op.execute(
        """
        UPDATE amendments
        SET approved_at = approved_date::timestamp AT TIME ZONE 'UTC'
        WHERE approved_date IS NOT NULL
        """
    )

    # Preserve old remarks for rejected amendments.
    # The new design uses rejection_reason for rejection details.

    op.execute(
        """
        UPDATE amendments
        SET rejection_reason = remarks
        WHERE LOWER(status) = 'rejected'
          AND remarks IS NOT NULL
          AND TRIM(remarks) <> ''
        """
    )

    # --------------------------------------------------------
    # 3. MAKE REQUIRED FIELDS NOT NULL
    # --------------------------------------------------------

    op.alter_column(
        "amendments",
        "title",
        existing_type=sa.String(length=255),
        nullable=False,
    )

    op.alter_column(
        "amendments",
        "reason",
        existing_type=sa.Text(),
        nullable=False,
    )

    # --------------------------------------------------------
    # 4. UPDATE EXISTING COLUMN TYPES
    # --------------------------------------------------------

    op.alter_column(
        "amendments",
        "amendment_no",
        existing_type=sa.VARCHAR(length=30),
        type_=sa.String(length=50),
        existing_nullable=False,
    )

    op.alter_column(
        "amendments",
        "description",
        existing_type=sa.TEXT(),
        nullable=False,
    )

    op.alter_column(
        "amendments",
        "status",
        existing_type=sa.VARCHAR(length=20),
        type_=sa.String(length=30),
        existing_nullable=False,
    )

    # --------------------------------------------------------
    # 5. UPDATE AMENDMENT NUMBER INDEX
    # --------------------------------------------------------

    # Remove the old organization + amendment_no unique
    # constraint.

    op.drop_constraint(
        op.f("uq_amendments_organization_amendment_no"),
        "amendments",
        type_="unique",
    )

    # Remove old non-unique index.

    op.drop_index(
        op.f("ix_amendments_amendment_no"),
        table_name="amendments",
    )

    # Create globally unique amendment number index.
    # Example:
    # AMD-2026-001
    # AMD-2026-002
    # AMD-2026-003

    op.create_index(
        op.f("ix_amendments_amendment_no"),
        "amendments",
        ["amendment_no"],
        unique=True,
    )

    # --------------------------------------------------------
    # 6. APPROVED BY FOREIGN KEY
    # --------------------------------------------------------

    op.create_foreign_key(
        "fk_amendments_approved_by_users",
        "amendments",
        "users",
        ["approved_by"],
        ["id"],
    )

    # --------------------------------------------------------
    # 7. REMOVE OLD COLUMNS
    # --------------------------------------------------------

    # approved_date has already been migrated to approved_at.
    op.drop_column(
        "amendments",
        "approved_date",
    )

    # remarks has already been preserved as rejection_reason
    # for rejected amendments.
    op.drop_column(
        "amendments",
        "remarks",
    )


# ============================================================
# DOWNGRADE
# ============================================================

def downgrade() -> None:
    """
    Restore the previous amendments table structure.
    """

    # --------------------------------------------------------
    # 1. RESTORE OLD COLUMNS
    # --------------------------------------------------------

    op.add_column(
        "amendments",
        sa.Column(
            "approved_date",
            sa.DATE(),
            nullable=True,
        ),
    )

    op.add_column(
        "amendments",
        sa.Column(
            "remarks",
            sa.TEXT(),
            nullable=True,
        ),
    )

    # --------------------------------------------------------
    # 2. RESTORE DATA
    # --------------------------------------------------------

    op.execute(
        """
        UPDATE amendments
        SET approved_date = approved_at::date
        WHERE approved_at IS NOT NULL
        """
    )

    op.execute(
        """
        UPDATE amendments
        SET remarks = rejection_reason
        WHERE rejection_reason IS NOT NULL
        """
    )

    # --------------------------------------------------------
    # 3. REMOVE FOREIGN KEY
    # --------------------------------------------------------

    op.drop_constraint(
        "fk_amendments_approved_by_users",
        "amendments",
        type_="foreignkey",
    )

    # --------------------------------------------------------
    # 4. RESTORE OLD INDEX
    # --------------------------------------------------------

    op.drop_index(
        op.f("ix_amendments_amendment_no"),
        table_name="amendments",
    )

    op.create_index(
        op.f("ix_amendments_amendment_no"),
        "amendments",
        ["amendment_no"],
        unique=False,
    )

    op.create_unique_constraint(
        op.f("uq_amendments_organization_amendment_no"),
        "amendments",
        ["organization_id", "amendment_no"],
        postgresql_nulls_not_distinct=False,
    )

    # --------------------------------------------------------
    # 5. RESTORE OLD COLUMN TYPES
    # --------------------------------------------------------

    op.alter_column(
        "amendments",
        "status",
        existing_type=sa.String(length=30),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False,
    )

    op.alter_column(
        "amendments",
        "description",
        existing_type=sa.TEXT(),
        nullable=True,
    )

    op.alter_column(
        "amendments",
        "amendment_no",
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(length=30),
        existing_nullable=False,
    )

    # --------------------------------------------------------
    # 6. REMOVE NEW COLUMNS
    # --------------------------------------------------------

    op.drop_column(
        "amendments",
        "approved_at",
    )

    op.drop_column(
        "amendments",
        "approved_by",
    )

    op.drop_column(
        "amendments",
        "rejection_reason",
    )

    op.drop_column(
        "amendments",
        "scope_changes",
    )

    op.drop_column(
        "amendments",
        "new_end_date",
    )

    op.drop_column(
        "amendments",
        "new_start_date",
    )

    op.drop_column(
        "amendments",
        "original_end_date",
    )

    op.drop_column(
        "amendments",
        "original_start_date",
    )

    op.drop_column(
        "amendments",
        "amended_value",
    )

    op.drop_column(
        "amendments",
        "original_value",
    )

    op.drop_column(
        "amendments",
        "reason",
    )

    op.drop_column(
        "amendments",
        "title",
    )