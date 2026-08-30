from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.contract import Contract
from app.models.party import Party
from app.models.user import User


router = APIRouter()


def require_viewer(current_user: User = Depends(get_current_user)):
    role_name = str(current_user.role.name).strip().lower() if current_user.role else ""
    if role_name != "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewer access is required.",
        )
    return current_user


@router.get("/dashboard")
def get_viewer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
):
    org_id = current_user.organization_id
    today = date.today()
    next_30_days = today + timedelta(days=30)

    total_contracts = db.query(Contract).filter(Contract.organization_id == org_id).count()
    active_contracts = db.query(Contract).filter(
        Contract.organization_id == org_id,
        Contract.status == "Active",
    ).count()
    expiring_contracts = db.query(Contract).filter(
        Contract.organization_id == org_id,
        Contract.status == "Active",
        Contract.end_date >= today,
        Contract.end_date <= next_30_days,
    ).count()
    total_parties = db.query(Party).filter(Party.organization_id == org_id).count()

    recent_contracts = (
        db.query(Contract)
        .filter(Contract.organization_id == org_id)
        .order_by(desc(Contract.created_at))
        .limit(8)
        .all()
    )

    return {
        "success": True,
        "message": "Viewer dashboard retrieved successfully.",
        "data": {
            "total_contracts": total_contracts,
            "active_contracts": active_contracts,
            "expiring_contracts": expiring_contracts,
            "total_parties": total_parties,
            "recent_contracts": [
                {
                    "id": str(contract.id),
                    "contract_no": contract.contract_no,
                    "title": contract.title,
                    "status": contract.status,
                    "start_date": contract.start_date,
                    "end_date": contract.end_date,
                    "value": contract.value,
                }
                for contract in recent_contracts
            ],
        },
    }
