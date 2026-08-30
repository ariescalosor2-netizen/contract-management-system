from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.contract import Contract
from app.models.party import Party


router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # =========================
    # USERS
    # =========================

    total_users = db.query(User).count()

    # =========================
    # CONTRACTS
    # =========================

    total_contracts = db.query(Contract).count()

    active_contracts = (
        db.query(Contract)
        .filter(Contract.status == "Active")
        .count()
    )

    expired_contracts = (
        db.query(Contract)
        .filter(Contract.end_date < date.today())
        .count()
    )

    # Contracts expiring within the next 30 days
    today = date.today()
    next_30_days = today + timedelta(days=30)

    expiring_contracts = (
        db.query(Contract)
        .filter(
            Contract.end_date >= today,
            Contract.end_date <= next_30_days,
            Contract.status == "Active",
        )
        .count()
    )

    # =========================
    # PARTIES
    # =========================

    total_parties = db.query(Party).count()

    # =========================
    # RESPONSE
    # =========================

    return {
        "success": True,
        "message": "Dashboard statistics retrieved successfully.",
        "data": {
            "total_users": total_users,
            "total_contracts": total_contracts,
            "active_contracts": active_contracts,
            "expiring_contracts": expiring_contracts,
            "expired_contracts": expired_contracts,
            "total_parties": total_parties,
        },
    }