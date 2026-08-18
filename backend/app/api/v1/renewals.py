from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.core.security import (
    get_current_user,
)

from app.models.user import User

from app.schemas.renewal import (
    RenewalCreate,
    RenewalUpdate,
)

from app.services.renewal_service import (
    RenewalService,
)


router = APIRouter()


# ============================================================
# SERIALIZER
# ============================================================

def serialize_renewal(renewal):

    contract = getattr(
        renewal,
        "contract",
        None,
    )

    party = (
        getattr(
            contract,
            "party",
            None,
        )
        if contract
        else None
    )

    return {
        "id": str(
            renewal.id
        ),

        "organization_id": str(
            renewal.organization_id
        ),

        "contract_id": str(
            renewal.contract_id
        ),

        "renewal_no":
            renewal.renewal_no,

        "contract_no": (
            contract.contract_no
            if contract
            else None
        ),

        "title": (
            contract.title
            if contract
            else None
        ),

        "party": (
            party.name
            if party
            else None
        ),

        "renewal_type":
            renewal.renewal_type,

        "current_end_date":
            renewal.current_end_date,

        "new_end_date":
            renewal.new_end_date,

        "status":
            renewal.status,

        "created_at":
            renewal.created_at,

        "updated_at":
            renewal.updated_at,
    }


# ============================================================
# GET ALL
# ============================================================

@router.get("/")
def get_renewals(

    db: Session = Depends(
        get_db
    ),

    current_user: User =
        Depends(
            get_current_user
        ),
):

    renewals = (
        RenewalService.get_all(
            db,
            current_user.organization_id,
        )
    )

    return {
        "success": True,

        "message":
            "Renewals retrieved successfully.",

        "data": [
            serialize_renewal(
                renewal
            )
            for renewal in renewals
        ],
    }


# ============================================================
# GET STATS
# ============================================================

@router.get("/stats")
def get_renewal_stats(

    db: Session = Depends(
        get_db
    ),

    current_user: User =
        Depends(
            get_current_user
        ),
):

    stats = (
        RenewalService.get_stats(
            db,
            current_user.organization_id,
        )
    )

    return {
        "success": True,

        "message":
            "Renewal statistics retrieved successfully.",

        "data": stats,
    }


# ============================================================
# GET SINGLE
# ============================================================

@router.get("/{renewal_id}")
def get_renewal(

    renewal_id: UUID,

    db: Session = Depends(
        get_db
    ),

    current_user: User =
        Depends(
            get_current_user
        ),
):

    try:

        renewal = (
            RenewalService.get_by_id(
                db,
                renewal_id,
                current_user.organization_id,
            )
        )

        return {
            "success": True,

            "message":
                "Renewal retrieved successfully.",

            "data":
                serialize_renewal(
                    renewal
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# CREATE
# ============================================================

# ============================================================
# CREATE
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_renewal(
    data: RenewalCreate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    try:
        renewal = RenewalService.create(
            db=db,

            organization_id=(
                current_user.organization_id
            ),

            contract_id=(
                data.contract_id
            ),

            renewal_type=(
                data.renewal_type
            ),

            new_end_date=(
                data.new_end_date
            ),

            approver_id=(
                current_user.id
            ),
        )

        return {
            "success": True,

            "message":
                "Renewal created successfully.",

            "data":
                serialize_renewal(
                    renewal
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),

            detail=str(error),
        )

# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{renewal_id}"
)
def update_renewal(

    renewal_id: UUID,

    data: RenewalUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user: User =
        Depends(
            get_current_user
        ),
):

    try:

        renewal = (
            RenewalService.update(

                db=db,

                renewal_id=
                    renewal_id,

                organization_id=
                    current_user.organization_id,

                **data.model_dump(
                    exclude_unset=True
                ),
            )
        )

        return {
            "success": True,

            "message":
                "Renewal updated successfully.",

            "data":
                serialize_renewal(
                    renewal
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{renewal_id}"
)
def delete_renewal(

    renewal_id: UUID,

    db: Session = Depends(
        get_db
    ),

    current_user: User =
        Depends(
            get_current_user
        ),
):

    try:

        RenewalService.delete(

            db=db,

            renewal_id=
                renewal_id,

            organization_id=
                current_user.organization_id,
        )

        return {
            "success": True,

            "message":
                "Renewal deleted successfully.",
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )