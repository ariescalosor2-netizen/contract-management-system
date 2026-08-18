from app.database.session import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.utils.hashing import hash_password


def seed():
    db = SessionLocal()

    try:
        # Default Roles
        roles = [
            "Administrator",
            "Contract Manager",
            "Finance Officer",
            "Legal Officer",
            "Viewer",
        ]

        role_objects = {}

        for role_name in roles:
            role = db.query(Role).filter(Role.name == role_name).first()

            if not role:
                role = Role(
                    name=role_name,
                    description=f"{role_name} Role",
                )
                db.add(role)
                db.commit()
                db.refresh(role)

            role_objects[role_name] = role

        # Default Administrator
        admin = db.query(User).filter(
            User.email == "admin@cms.com"
        ).first()

        if not admin:
            admin = User(
                role_id=role_objects["Administrator"].id,
                first_name="System",
                last_name="Administrator",
                email="admin@cms.com",
                password=hash_password("Admin@123"),
                is_active=True,
            )

            db.add(admin)
            db.commit()

            print("✅ Administrator account created.")

        else:
            print("ℹ️ Administrator already exists.")

        print("✅ Database seeding completed.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()