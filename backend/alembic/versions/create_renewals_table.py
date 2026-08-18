"""create renewals table"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "create_renewals_table"

# Continue from the current latest migration.
down_revision = "50fdbba6bfac"

branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "renewals",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),

        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),

        sa.Column(
            "contract_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),

        sa.Column(
            "renewal_no",
            sa.String(length=50),
            nullable=False,
        ),

        sa.Column(
            "renewal_type",
            sa.String(length=100),
            nullable=False,
        ),

        sa.Column(
            "current_end_date",
            sa.Date(),
            nullable=False,
        ),

        sa.Column(
            "new_end_date",
            sa.Date(),
            nullable=False,
        ),

        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="Active",
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),

        sa.ForeignKeyConstraint(
            ["contract_id"],
            ["contracts.id"],
        ),

        sa.PrimaryKeyConstraint(
            "id"
        ),

        sa.UniqueConstraint(
            "renewal_no"
        ),
    )

    op.create_index(
        "ix_renewals_organization_id",
        "renewals",
        ["organization_id"],
    )

    op.create_index(
        "ix_renewals_contract_id",
        "renewals",
        ["contract_id"],
    )

    op.create_index(
        "ix_renewals_renewal_no",
        "renewals",
        ["renewal_no"],
    )


def downgrade():
    op.drop_index(
        "ix_renewals_renewal_no",
        table_name="renewals",
    )

    op.drop_index(
        "ix_renewals_contract_id",
        table_name="renewals",
    )

    op.drop_index(
        "ix_renewals_organization_id",
        table_name="renewals",
    )

    op.drop_table("renewals")