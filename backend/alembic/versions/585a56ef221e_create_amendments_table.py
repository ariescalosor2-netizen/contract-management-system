"""create amendments table

Revision ID: f1a2b3c4d5e6
Revises: e8d8661899a1
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, Sequence[str], None] = "e8d8661899a1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "amendments" not in inspector.get_table_names():
        op.create_table(
            "amendments",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=False),
            sa.Column("contract_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("contracts.id"), nullable=False),
            sa.Column("requested_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("amendment_no", sa.String(50), nullable=False),
            sa.Column("title", sa.String(255), nullable=True),
            sa.Column("amendment_type", sa.String(100), nullable=False),
            sa.Column("reason", sa.Text(), nullable=True),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("amended_value", sa.Numeric(15, 2), nullable=True),
            sa.Column("new_start_date", sa.Date(), nullable=True),
            sa.Column("new_end_date", sa.Date(), nullable=True),
            sa.Column("scope_changes", sa.Text(), nullable=True),
            sa.Column("effective_date", sa.Date(), nullable=True),
            sa.Column("status", sa.String(50), nullable=False, server_default="Pending"),
            sa.Column("request_date", sa.Date(), nullable=False),
            sa.Column("approved_date", sa.Date(), nullable=True),
            sa.Column("rejection_reason", sa.Text(), nullable=True),
            sa.Column("remarks", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        op.create_index("ix_amendments_organization_id", "amendments", ["organization_id"])
        op.create_index("ix_amendments_contract_id", "amendments", ["contract_id"])
        op.create_index("ix_amendments_requested_by", "amendments", ["requested_by"])
        op.create_index("ix_amendments_amendment_no", "amendments", ["amendment_no"])
    else:
        existing = {c["name"] for c in inspector.get_columns("amendments")}
        additions = [
            ("title", sa.String(255)), ("reason", sa.Text()), ("amended_value", sa.Numeric(15, 2)),
            ("new_start_date", sa.Date()), ("new_end_date", sa.Date()), ("scope_changes", sa.Text()),
            ("effective_date", sa.Date()), ("rejection_reason", sa.Text()),
        ]
        for name, typ in additions:
            if name not in existing:
                op.add_column("amendments", sa.Column(name, typ, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    if "amendments" in sa.inspect(bind).get_table_names():
        op.drop_table("amendments")