"""update amendments table

Revision ID: 3430edf9b741
Revises: f1a2b3c4d5e6
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3430edf9b741"
down_revision: Union[str, Sequence[str], None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    columns = {
        column["name"]
        for column in inspector.get_columns("amendments")
    }

    # Add only columns that do not already exist.
    additions = [
        ("title", sa.String(255)),
        ("reason", sa.Text()),
        ("original_value", sa.Numeric(15, 2)),
        ("amended_value", sa.Numeric(15, 2)),
        ("original_start_date", sa.Date()),
        ("original_end_date", sa.Date()),
        ("new_start_date", sa.Date()),
        ("new_end_date", sa.Date()),
        ("scope_changes", sa.Text()),
        ("rejection_reason", sa.Text()),
        ("approved_by", sa.UUID()),
        ("approved_at", sa.DateTime(timezone=True)),
    ]

    for name, column_type in additions:
        if name not in columns:
            op.add_column(
                "amendments",
                sa.Column(
                    name,
                    column_type,
                    nullable=True,
                ),
            )

    # Populate the new fields from existing data.
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

    # Preserve the old approval date.
    if "approved_date" in columns:
        op.execute(
            """
            UPDATE amendments
            SET approved_at = approved_date::timestamp AT TIME ZONE 'UTC'
            WHERE approved_date IS NOT NULL
              AND approved_at IS NULL
            """
        )

    # Preserve remarks for rejected amendments.
    if "remarks" in columns:
        op.execute(
            """
            UPDATE amendments
            SET rejection_reason = remarks
            WHERE LOWER(status) = 'rejected'
              AND remarks IS NOT NULL
              AND TRIM(remarks) <> ''
              AND rejection_reason IS NULL
            """
        )


def downgrade() -> None:
    # No destructive downgrade here.
    pass