"""add organization tenant context

Revision ID: add_org_tenant_context
Revises: 9c095006746d
Create Date: 2026-08-12
"""

from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


# ============================================================
# REVISION IDENTIFIERS
# ============================================================

revision: str = "a6d6944"
down_revision: Union[str, Sequence[str], None] = "9c095006746d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ============================================================
# UPGRADE
# ============================================================

def upgrade() -> None:
    # --------------------------------------------------------
    # 1. CREATE ORGANIZATIONS TABLE
    # --------------------------------------------------------

    op.create_table(
        "organizations",

        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "code",
            sa.String(length=100),
            nullable=False,
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
            nullable=False,
            server_default=sa.text("now()"),
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),

        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )

    op.create_index(
        "ix_organizations_code",
        "organizations",
        ["code"],
        unique=True,
    )

    # --------------------------------------------------------
    # 2. CREATE INITIAL ORGANIZATION
    # --------------------------------------------------------

    organization_id = uuid.uuid4()

    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            INSERT INTO organizations
                (id, name, code, status)
            VALUES
                (:id, :name, :code, :status)
            """
        ),
        {
            "id": organization_id,
            "name": "Argo HQ",
            "code": "ARGO-HQ",
            "status": "Active",
        },
    )

    # --------------------------------------------------------
    # 3. ADD ORGANIZATION_ID TO USERS
    # --------------------------------------------------------

    op.add_column(
        "users",
        sa.Column(
            "organization_id",
            sa.UUID(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_users_organization_id",
        "users",
        ["organization_id"],
        unique=False,
    )

    # Assign existing users to the initial organization
    connection.execute(
        sa.text(
            """
            UPDATE users
            SET organization_id = :organization_id
            WHERE organization_id IS NULL
            """
        ),
        {
            "organization_id": organization_id,
        },
    )

    op.create_foreign_key(
        "fk_users_organization_id",
        "users",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.alter_column(
        "users",
        "organization_id",
        existing_type=sa.UUID(),
        nullable=False,
    )

    # --------------------------------------------------------
    # 4. ADD ORGANIZATION_ID TO CONTRACT TYPES
    # --------------------------------------------------------

    op.add_column(
        "contract_types",
        sa.Column(
            "organization_id",
            sa.UUID(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_contract_types_organization_id",
        "contract_types",
        ["organization_id"],
        unique=False,
    )

    connection.execute(
        sa.text(
            """
            UPDATE contract_types
            SET organization_id = :organization_id
            WHERE organization_id IS NULL
            """
        ),
        {
            "organization_id": organization_id,
        },
    )

    op.create_foreign_key(
        "fk_contract_types_organization_id",
        "contract_types",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.alter_column(
        "contract_types",
        "organization_id",
        existing_type=sa.UUID(),
        nullable=False,
    )

    # --------------------------------------------------------
    # 5. ADD ORGANIZATION_ID TO PARTIES
    # --------------------------------------------------------

    op.add_column(
        "parties",
        sa.Column(
            "organization_id",
            sa.UUID(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_parties_organization_id",
        "parties",
        ["organization_id"],
        unique=False,
    )

    connection.execute(
        sa.text(
            """
            UPDATE parties
            SET organization_id = :organization_id
            WHERE organization_id IS NULL
            """
        ),
        {
            "organization_id": organization_id,
        },
    )

    op.create_foreign_key(
        "fk_parties_organization_id",
        "parties",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.alter_column(
        "parties",
        "organization_id",
        existing_type=sa.UUID(),
        nullable=False,
    )

    # --------------------------------------------------------
    # 6. ADD ORGANIZATION_ID TO CONTRACTS
    # --------------------------------------------------------

    op.add_column(
        "contracts",
        sa.Column(
            "organization_id",
            sa.UUID(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_contracts_organization_id",
        "contracts",
        ["organization_id"],
        unique=False,
    )

    connection.execute(
        sa.text(
            """
            UPDATE contracts
            SET organization_id = :organization_id
            WHERE organization_id IS NULL
            """
        ),
        {
            "organization_id": organization_id,
        },
    )

    op.create_foreign_key(
        "fk_contracts_organization_id",
        "contracts",
        "organizations",
        ["organization_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.alter_column(
        "contracts",
        "organization_id",
        existing_type=sa.UUID(),
        nullable=False,
    )


# ============================================================
# DOWNGRADE
# ============================================================

def downgrade() -> None:

    # Contracts
    op.drop_constraint(
        "fk_contracts_organization_id",
        "contracts",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_contracts_organization_id",
        table_name="contracts",
    )

    op.drop_column(
        "contracts",
        "organization_id",
    )

    # Parties
    op.drop_constraint(
        "fk_parties_organization_id",
        "parties",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_parties_organization_id",
        table_name="parties",
    )

    op.drop_column(
        "parties",
        "organization_id",
    )

    # Contract Types
    op.drop_constraint(
        "fk_contract_types_organization_id",
        "contract_types",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_contract_types_organization_id",
        table_name="contract_types",
    )

    op.drop_column(
        "contract_types",
        "organization_id",
    )

    # Users
    op.drop_constraint(
        "fk_users_organization_id",
        "users",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_users_organization_id",
        table_name="users",
    )

    op.drop_column(
        "users",
        "organization_id",
    )

    # Organization
    op.drop_index(
        "ix_organizations_code",
        table_name="organizations",
    )

    op.drop_table("organizations")