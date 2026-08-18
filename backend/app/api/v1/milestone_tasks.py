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

from app.schemas.milestone_task import (
    MilestoneTaskCreate,
    MilestoneTaskUpdate,
)

from app.services.milestone_task_service import (
    MilestoneTaskService,
)


router = APIRouter()


# ============================================================
# SERIALIZER
# ============================================================

def serialize_task(task):

    return {
        "id": str(task.id),

        "milestone_id": str(
            task.milestone_id
        ),

        "title": task.title,

        "description": task.description,

        "is_completed":
            task.is_completed,

        "completed_at":
            task.completed_at,

        "created_at":
            task.created_at,

        "updated_at":
            task.updated_at,
    }


# ============================================================
# GET TASKS BY MILESTONE
# ============================================================

@router.get(
    "/milestone/{milestone_id}"
)
def get_milestone_tasks(

    milestone_id: UUID,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        tasks = (
            MilestoneTaskService.get_tasks(

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
                "Milestone tasks retrieved successfully.",

            "data": [
                serialize_task(task)
                for task in tasks
            ],
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# CREATE TASK
# ============================================================

@router.post(
    "/milestone/{milestone_id}",
    status_code=status.HTTP_201_CREATED,
)
def create_milestone_task(

    milestone_id: UUID,

    data: MilestoneTaskCreate,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        task = (
            MilestoneTaskService.create(

                db=db,

                milestone_id=
                    milestone_id,

                organization_id=
                    current_user.organization_id,

                title=
                    data.title,

                description=
                    data.description,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone task created successfully.",

            "data":
                serialize_task(task),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# UPDATE TASK
# ============================================================

@router.put(
    "/{task_id}"
)
def update_milestone_task(

    task_id: UUID,

    data: MilestoneTaskUpdate,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        task = (
            MilestoneTaskService.update(

                db=db,

                task_id=
                    task_id,

                organization_id=
                    current_user.organization_id,

                title=
                    data.title,

                description=
                    data.description,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone task updated successfully.",

            "data":
                serialize_task(task),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )

# ============================================================
# TOGGLE TASK COMPLETION
# ============================================================

@router.patch(
    "/{task_id}/toggle"
)
def toggle_milestone_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User =
        Depends(get_current_user),
):
    try:

        task = (
            MilestoneTaskService.toggle_completion(

                db=db,

                task_id=
                    task_id,

                organization_id=
                    current_user.organization_id,
            )
        )

        return {
            "success": True,

            "message":
                "Milestone task completion updated successfully.",

            "data":
                serialize_task(task),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# DELETE TASK
# ============================================================

@router.delete(
    "/{task_id}"
)
def delete_milestone_task(

    task_id: UUID,

    db: Session = Depends(get_db),

    current_user: User =
        Depends(get_current_user),

):

    try:

        MilestoneTaskService.delete(

            db=db,

            task_id=
                task_id,

            organization_id=
                current_user.organization_id,
        )

        return {
            "success": True,

            "message":
                "Milestone task deleted successfully.",
        }

    except ValueError as error:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )