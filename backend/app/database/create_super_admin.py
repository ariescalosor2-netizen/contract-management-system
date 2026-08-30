"""Create or update a system-level Super Admin account.

Usage:
    python -m app.database.create_super_admin email password first_name last_name

The account is intentionally not assigned to an organization because Super Admin
is system-wide. No password is stored in source code.
"""

import sys
from uuid import uuid4

from app.database.session import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.utils.hashing import hash_password


def main():
    if len(sys.argv) != 5:
        raise SystemExit(
            "Usage: python -m app.database.create_super_admin "
            "email password first_name last_name"
        )

    email, password, first_name, last_name = sys.argv[1:]
    db = SessionLocal()
    try:
        role = db.query(Role).filter(Role.name == "Super Admin").first()
        if not role:
            role = Role(name="Super Admin", description="Super Admin Role")
            db.add(role)
            db.commit()
            db.refresh(role)

        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                id=uuid4(),
                organization_id=None,
                role_id=role.id,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=hash_password(password),
                is_active=True,
            )
            db.add(user)
        else:
            user.role_id = role.id
            user.organization_id = None
            user.first_name = first_name
            user.last_name = last_name
            user.password = hash_password(password)
            user.is_active = True

        db.commit()
        print(f"Super Admin ready: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
