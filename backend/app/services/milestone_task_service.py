import uuid
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.milestone import Milestone
from app.models.milestone_task import MilestoneTask


class MilestoneTaskService:

    # ============================================================
    # GET TASKS
    # ============================================================

    @staticmethod
    def get_tasks(
        db: Session,
        milestone_id: UUID,
        organization_id: UUID,
    ):
        milestone = (
            db.query(Milestone)
            .filter(
                Milestone.id == milestone_id,
                Milestone.organization_id == organization_id,
            )
            .first()
        )

        if not milestone:
            raise ValueError("Milestone not found.")

        return (
            db.query(MilestoneTask)
            .filter(
                MilestoneTask.milestone_id == milestone_id
            )
            .order_by(
                MilestoneTask.created_at.asc()
            )
            .all()
        )

    # ============================================================
    # GET SINGLE TASK
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        task_id: UUID,
        organization_id: UUID,
    ):
        task = (
            db.query(MilestoneTask)
            .join(
                Milestone,
                Milestone.id == MilestoneTask.milestone_id,
            )
            .filter(
                MilestoneTask.id == task_id,
                Milestone.organization_id == organization_id,
            )
            .first()
        )

        if not task:
            raise ValueError("Milestone task not found.")

        return task

    # ============================================================
    # RECALCULATE MILESTONE PROGRESS
    # ============================================================

    @staticmethod
    def recalculate_progress(
        db: Session,
        milestone: Milestone,
    ):
        tasks = (
            db.query(MilestoneTask)
            .filter(
                MilestoneTask.milestone_id == milestone.id
            )
            .all()
        )

        total_tasks = len(tasks)

        completed_tasks = sum(
            1
            for task in tasks
            if task.is_completed
        )

        # --------------------------------------------------------
        # NO TASKS
        # --------------------------------------------------------

        if total_tasks == 0:
            milestone.progress = 0
            milestone.status = "Not Started"

        # --------------------------------------------------------
        # ALL TASKS COMPLETED
        # --------------------------------------------------------

        elif completed_tasks == total_tasks:
            milestone.progress = 100
            milestone.status = "Completed"

        # --------------------------------------------------------
        # SOME TASKS COMPLETED
        # --------------------------------------------------------

        else:
            milestone.progress = round(
                (completed_tasks / total_tasks) * 100
            )
            milestone.status = "In Progress"

        # --------------------------------------------------------
        # OVERDUE
        # --------------------------------------------------------

        if (
            milestone.due_date
            and milestone.progress < 100
            and milestone.due_date
            < datetime.now(timezone.utc).date()
        ):
            milestone.status = "Overdue"

        return milestone

    # ============================================================
    # CREATE TASK
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        milestone_id: UUID,
        organization_id: UUID,
        title: str,
        description: str | None = None,
    ):
        milestone = (
            db.query(Milestone)
            .filter(
                Milestone.id == milestone_id,
                Milestone.organization_id == organization_id,
                Milestone.is_archived == False,
            )
            .first()
        )

        if not milestone:
            raise ValueError("Milestone not found.")

        if not title or not title.strip():
            raise ValueError("Task title is required.")

        task = MilestoneTask(
            id=uuid.uuid4(),
            milestone_id=milestone.id,
            title=title.strip(),
            description=(
                description.strip()
                if description
                else None
            ),
            is_completed=False,
            completed_at=None,
        )

        db.add(task)

        # IMPORTANT:
        # Flush first so the new task is included
        # when calculating milestone progress.
        db.flush()

        MilestoneTaskService.recalculate_progress(
            db,
            milestone,
        )

        db.commit()

        db.refresh(task)
        db.refresh(milestone)

        return task

    # ============================================================
    # UPDATE TASK
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        task_id: UUID,
        organization_id: UUID,
        title: str | None = None,
        description: str | None = None,
        is_completed: bool | None = None,
    ):
        task = MilestoneTaskService.get_by_id(
            db,
            task_id,
            organization_id,
        )

        milestone = task.milestone

        if milestone.is_archived:
            raise ValueError(
                "Cannot update a task from an archived milestone."
            )

        if title is not None:
            if not title.strip():
                raise ValueError(
                    "Task title is required."
                )

            task.title = title.strip()

        if description is not None:
            task.description = (
                description.strip()
                if description
                else None
            )

        if is_completed is not None:
            task.is_completed = is_completed

            if is_completed:
                task.completed_at = datetime.now(
                    timezone.utc
                )
            else:
                task.completed_at = None

        db.flush()

        MilestoneTaskService.recalculate_progress(
            db,
            milestone,
        )

        db.commit()

        db.refresh(task)
        db.refresh(milestone)

        return task

    # ============================================================
    # TOGGLE TASK
    # ============================================================

    @staticmethod
    def toggle_completion(
        db: Session,
        task_id: UUID,
        organization_id: UUID,
    ):
        task = MilestoneTaskService.get_by_id(
            db,
            task_id,
            organization_id,
        )

        milestone = task.milestone

        if milestone.is_archived:
            raise ValueError(
                "Cannot update a task from an archived milestone."
            )

        task.is_completed = not task.is_completed

        if task.is_completed:
            task.completed_at = datetime.now(
                timezone.utc
            )
        else:
            task.completed_at = None

        db.flush()

        MilestoneTaskService.recalculate_progress(
            db,
            milestone,
        )

        db.commit()

        db.refresh(task)
        db.refresh(milestone)

        return task

    # ============================================================
    # DELETE TASK
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        task_id: UUID,
        organization_id: UUID,
    ):
        task = MilestoneTaskService.get_by_id(
            db,
            task_id,
            organization_id,
        )

        milestone = task.milestone

        if milestone.is_archived:
            raise ValueError(
                "Cannot delete a task from an archived milestone."
            )

        db.delete(task)

        # IMPORTANT:
        # Flush first so the deleted task is excluded
        # from the calculation.
        db.flush()

        MilestoneTaskService.recalculate_progress(
            db,
            milestone,
        )

        db.commit()

        db.refresh(milestone)

        return True
