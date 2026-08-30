from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import get_current_user
from app.models.user import User

from app.schemas.milestone import (
    MilestoneCreate,
    MilestoneUpdate,
)

from app.services.milestone_service import (
    MilestoneService,
)


router = APIRouter()


# ============================================================
# SERIALIZER
# ============================================================

def serialize_milestone(milestone):

    contract = getattr(
        milestone,
        "contract",
        None,
    )

    tasks = getattr(
        milestone,
        "tasks",
        [],
    )

    return {
        "id": str(milestone.id),

        "organization_id": str(
            milestone.organization_id
        ),

        "contract_id": str(
            milestone.contract_id
        ),

        "milestone_no":
            milestone.milestone_no,

        "title":
            milestone.title,

        "description":
            milestone.description,

        "due_date":
            milestone.due_date,

        # SYSTEM-CALCULATED
        "progress":
            milestone.progress,

        # SYSTEM-CALCULATED
        "status":
            milestone.status,

        "is_archived":
            milestone.is_archived,

        "created_at":
            milestone.created_at,

        "updated_at":
            milestone.updated_at,

        "contract_no": (
            contract.contract_no
            if contract
            else None
        ),

        "contract_title": (
            contract.title
            if contract
            else None
        ),

        "tasks": [
            {
                "id": str(task.id),

                "milestone_id":
                    str(task.milestone_id),

                "title":
                    task.title,

                "description":
                    task.description,

                "is_completed":
                    task.is_completed,

                "completed_at":
                    task.completed_at,

                "created_at":
                    task.created_at,

                "updated_at":
                    task.updated_at,
            }

            for task in tasks
        ],
    }


# ============================================================
# GET ALL ACTIVE MILESTONES
# ============================================================

@router.get("/")
def get_milestones(

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    milestones = (
        MilestoneService.get_all(
            db,
            current_user.organization_id,
        )
    )

    return {
        "success": True,

        "message":
            "Milestones retrieved successfully.",

        "data": [
            serialize_milestone(
                milestone
            )
            for milestone in milestones
        ],
    }


# ============================================================
# GET ALL ARCHIVED MILESTONES
# ============================================================

@router.get("/archived")
def get_archived_milestones(

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    milestones = (
        MilestoneService.get_archived(
            db,
            current_user.organization_id,
        )
    )

    return {
        "success": True,

        "message":
            "Archived milestones retrieved successfully.",

        "data": [
            serialize_milestone(
                milestone
            )
            for milestone in milestones
        ],
    }


# ============================================================
# CREATE MILESTONE
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_milestone(

    data: MilestoneCreate,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        milestone = (
            MilestoneService.create(

                db=db,

                organization_id=
                    current_user.organization_id,

                contract_id=
                    data.contract_id,

                title=
                    data.title,

                description=
                    data.description,

                due_date=
                    data.due_date,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone created successfully.",

            "data":
                serialize_milestone(
                    milestone
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# GET CONTRACT MILESTONES
# ============================================================

@router.get(
    "/contract/{contract_id}"
)
def get_contract_milestones(

    contract_id: UUID,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    milestones = (
        MilestoneService.get_by_contract(

            db=db,

            contract_id=contract_id,

            organization_id=
                current_user.organization_id,
        )
    )

    return {
        "success": True,

        "message":
            "Contract milestones retrieved successfully.",

        "data": [
            serialize_milestone(
                milestone
            )
            for milestone in milestones
        ],
    }


# ============================================================
# GET SINGLE MILESTONE
# ============================================================

@router.get(
    "/{milestone_id}"
)
def get_milestone(

    milestone_id: UUID,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        milestone = (
            MilestoneService.get_by_id(

                db=db,

                milestone_id=
                    milestone_id,

                organization_id=
                    current_user.organization_id,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone retrieved successfully.",

            "data":
                serialize_milestone(
                    milestone
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# UPDATE MILESTONE
# ============================================================

@router.put(
    "/{milestone_id}"
)
def update_milestone(

    milestone_id: UUID,

    data: MilestoneUpdate,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        milestone = (
            MilestoneService.update(

                db=db,

                milestone_id=
                    milestone_id,

                organization_id=
                    current_user.organization_id,

                title=
                    data.title,

                description=
                    data.description,

                due_date=
                    data.due_date,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone updated successfully.",

            "data":
                serialize_milestone(
                    milestone
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# ARCHIVE MILESTONE
# ============================================================

@router.patch(
    "/{milestone_id}/archive"
)
def archive_milestone(

    milestone_id: UUID,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        milestone = (
            MilestoneService.archive(

                db=db,

                milestone_id=
                    milestone_id,

                organization_id=
                    current_user.organization_id,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone archived successfully.",

            "data":
                serialize_milestone(
                    milestone
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# RESTORE / UNARCHIVE MILESTONE
# ============================================================

@router.patch(
    "/{milestone_id}/restore"
)
def restore_milestone(

    milestone_id: UUID,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        milestone = (
            MilestoneService.unarchive(

                db=db,

                milestone_id=
                    milestone_id,

                organization_id=
                    current_user.organization_id,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone restored successfully.",

            "data":
                serialize_milestone(
                    milestone
                ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )