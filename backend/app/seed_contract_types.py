from app.database.session import SessionLocal
from app.models.contract_type import ContractType


contract_types = [
    {
        "name": "Goods",
        "description": "Purchase of goods and equipment",
        "icon": "📦",
        "status": "Active",
    },
    {
        "name": "Services",
        "description": "Service-related contracts",
        "icon": "🛠️",
        "status": "Active",
    },
    {
        "name": "Maintenance",
        "description": "Maintenance and support services",
        "icon": "🏢",
        "status": "Active",
    },
    {
        "name": "Consulting",
        "description": "Consulting and professional services",
        "icon": "👨‍💼",
        "status": "Active",
    },
    {
        "name": "Partnership",
        "description": "Partnership or collaboration agreements",
        "icon": "🤝",
        "status": "Inactive",
    },
    {
        "name": "Lease",
        "description": "Lease or rental agreements",
        "icon": "📄",
        "status": "Active",
    },
    {
        "name": "Other",
        "description": "Other types of contracts",
        "icon": "🛡️",
        "status": "Active",
    },
]


def seed_contract_types():
    db = SessionLocal()

    try:
        for item in contract_types:

            existing = (
                db.query(ContractType)
                .filter(
                    ContractType.name == item["name"]
                )
                .first()
            )

            if existing:
                print(
                    f"Already exists: {item['name']}"
                )
                continue

            contract_type = ContractType(
                name=item["name"],
                description=item["description"],
                icon=item["icon"],
                status=item["status"],
            )

            db.add(contract_type)

        db.commit()

        print("Contract types seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_contract_types()