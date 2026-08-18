"""create parties

Revision ID: 2aeab5299250
Revises: 1ea69c70a3a4
Create Date: 2026-08-10 20:38:50.120080

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "2aeab5299250"
down_revision: Union[str, Sequence[str], None] = "1ea69c70a3a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create parties table."""

    op.create_table(
        "parties",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),

        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "type",
            sa.String(length=50),
            nullable=False,
        ),

        sa.Column(
            "email",
            sa.String(length=255),
            nullable=True,
        ),

        sa.Column(
            "contact",
            sa.String(length=50),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="Active",
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

        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Drop parties table."""

    op.drop_table("parties")