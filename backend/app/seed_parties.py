from app.database.session import SessionLocal
from app.models.party import Party


parties = [
    {
        "name": "ABC Corporation",
        "type": "Organization",
        "email": "contact@abccorp.com",
        "contact": "+63 912 345 6789",
        "status": "Active",
    },
    {
        "name": "Tech Solutions Inc.",
        "type": "Organization",
        "email": "info@techsolutions.com",
        "contact": "+63 917 234 5678",
        "status": "Active",
    },
    {
        "name": "BuildWell Contractors",
        "type": "Organization",
        "email": "hello@buildwell.com",
        "contact": "+63 918 345 6789",
        "status": "Active",
    },
    {
        "name": "NetConnect PH",
        "type": "Organization",
        "email": "support@netconnect.ph",
        "contact": "+63 919 456 7890",
        "status": "Active",
    },
]


def seed_parties():
    db = SessionLocal()

    try:
        for item in parties:
            existing = (
                db.query(Party)
                .filter(Party.name == item["name"])
                .first()
            )

            if existing:
                print(f"Already exists: {item['name']}")
                continue

            party = Party(
                name=item["name"],
                type=item["type"],
                email=item["email"],
                contact=item["contact"],
                status=item["status"],
            )

            db.add(party)

        db.commit()

        print("Parties seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_parties()