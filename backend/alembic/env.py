from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.database.base import Base
from app.database.connection import DATABASE_URL

# ============================================================
# IMPORT ALL MODELS
# ============================================================
# These imports allow Alembic to detect all SQLAlchemy models
# through Base.metadata during autogenerate.

from app.models.user import User
from app.models.role import Role
from app.models.organization import Organization
from app.models.contract_type import ContractType
from app.models.party import Party
from app.models.contract import Contract
from app.models.milestone import Milestone
from app.models.amendment import Amendment
from app.models.contract_party import ContractParty

# ============================================================
# ALEMBIC CONFIG
# ============================================================

config = context.config


# ============================================================
# DATABASE URL
# ============================================================

config.set_main_option(
    "sqlalchemy.url",
    DATABASE_URL.render_as_string(hide_password=False),
)


# ============================================================
# LOGGING
# ============================================================

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ============================================================
# METADATA
# ============================================================

target_metadata = Base.metadata


# ============================================================
# OFFLINE MIGRATIONS
# ============================================================

def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.
    """

    url = config.get_main_option(
        "sqlalchemy.url"
    )

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ============================================================
# ONLINE MIGRATIONS
# ============================================================

def run_migrations_online() -> None:
    """
    Run migrations in online mode.
    """

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ============================================================
# RUN
# ============================================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()