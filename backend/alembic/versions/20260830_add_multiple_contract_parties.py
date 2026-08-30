"""add multiple parties per contract

Revision ID: 20260830_contract_parties
Revises: ed1dc89a8808
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260830_contract_parties"
down_revision: Union[str, Sequence[str], None] = "ed1dc89a8808"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "contract_parties",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("contract_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("party_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(length=100), nullable=False, server_default="Party"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["contract_id"], ["contracts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["party_id"], ["parties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("contract_id", "party_id", name="uq_contract_party"),
    )
    op.create_index("ix_contract_parties_contract_id", "contract_parties", ["contract_id"])
    op.create_index("ix_contract_parties_party_id", "contract_parties", ["party_id"])

    # Preserve every existing contract's current party as its first relationship.
    op.execute(
        sa.text(
            """
            INSERT INTO contract_parties (id, contract_id, party_id, role)
            SELECT gen_random_uuid(), id, party_id, 'Primary Party'
            FROM contracts
            WHERE party_id IS NOT NULL
            ON CONFLICT (contract_id, party_id) DO NOTHING
            """
        )
    )


def downgrade() -> None:
    op.drop_index("ix_contract_parties_party_id", table_name="contract_parties")
    op.drop_index("ix_contract_parties_contract_id", table_name="contract_parties")
    op.drop_table("contract_parties")
