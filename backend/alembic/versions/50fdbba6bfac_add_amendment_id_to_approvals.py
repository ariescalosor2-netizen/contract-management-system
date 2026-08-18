"""add amendment_id to approvals

Revision ID: 50fdbba6bfac
Revises: c6eb950bb691
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# ============================================================
# REVISION IDENTIFIERS
# ============================================================

revision: str = "50fdbba6bfac"

down_revision: Union[
    str,
    Sequence[str],
    None
] = "c6eb950bb691"

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

    bind = op.get_bind()

    inspector = sa.inspect(bind)

    # --------------------------------------------------------
    # CHECK TABLES
    # --------------------------------------------------------

    tables = inspector.get_table_names()

    if "approvals" not in tables:
        raise RuntimeError(
            "The approvals table does not exist."
        )

    if "amendments" not in tables:
        raise RuntimeError(
            "The amendments table does not exist."
        )

    # --------------------------------------------------------
    # CHECK EXISTING COLUMNS
    # --------------------------------------------------------

    existing_columns = {
        column["name"]
        for column in inspector.get_columns(
            "approvals"
        )
    }

    # --------------------------------------------------------
    # ADD amendment_id
    # --------------------------------------------------------

    if "amendment_id" not in existing_columns:

        op.add_column(
            "approvals",
            sa.Column(
                "amendment_id",
                postgresql.UUID(
                    as_uuid=True
                ),
                nullable=True,
            ),
        )

    # --------------------------------------------------------
    # CHECK INDEXES
    # --------------------------------------------------------

    existing_indexes = {
        index["name"]
        for index in inspector.get_indexes(
            "approvals"
        )
    }

    # --------------------------------------------------------
    # CREATE INDEX
    # --------------------------------------------------------

    if (
        "ix_approvals_amendment_id"
        not in existing_indexes
    ):

        op.create_index(
            "ix_approvals_amendment_id",
            "approvals",
            ["amendment_id"],
            unique=False,
        )

    # --------------------------------------------------------
    # CHECK FOREIGN KEYS
    # --------------------------------------------------------

    existing_foreign_keys = {
        fk["name"]
        for fk in inspector.get_foreign_keys(
            "approvals"
        )
        if fk.get("name")
    }

    # --------------------------------------------------------
    # CREATE FOREIGN KEY
    # --------------------------------------------------------

    if (
        "fk_approvals_amendment_id"
        not in existing_foreign_keys
    ):

        op.create_foreign_key(
            "fk_approvals_amendment_id",
            "approvals",
            "amendments",
            ["amendment_id"],
            ["id"],
        )


# ============================================================
# DOWNGRADE
# ============================================================

def downgrade() -> None:

    bind = op.get_bind()

    inspector = sa.inspect(bind)

    # --------------------------------------------------------
    # CHECK TABLE
    # --------------------------------------------------------

    tables = inspector.get_table_names()

    if "approvals" not in tables:
        return

    # --------------------------------------------------------
    # DROP FOREIGN KEY
    # --------------------------------------------------------

    existing_foreign_keys = {
        fk["name"]
        for fk in inspector.get_foreign_keys(
            "approvals"
        )
        if fk.get("name")
    }

    if (
        "fk_approvals_amendment_id"
        in existing_foreign_keys
    ):

        op.drop_constraint(
            "fk_approvals_amendment_id",
            "approvals",
            type_="foreignkey",
        )

    # --------------------------------------------------------
    # DROP INDEX
    # --------------------------------------------------------

    existing_indexes = {
        index["name"]
        for index in inspector.get_indexes(
            "approvals"
        )
    }

    if (
        "ix_approvals_amendment_id"
        in existing_indexes
    ):

        op.drop_index(
            "ix_approvals_amendment_id",
            table_name="approvals",
        )

    # --------------------------------------------------------
    # DROP COLUMN
    # --------------------------------------------------------

    existing_columns = {
        column["name"]
        for column in inspector.get_columns(
            "approvals"
        )
    }

    if "amendment_id" in existing_columns:

        op.drop_column(
            "approvals",
            "amendment_id",
        )