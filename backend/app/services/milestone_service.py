import uuid

from datetime import date

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.milestone import Milestone
from app.models.contract import Contract


class MilestoneService:

    # ============================================================
    # AUTO-GENERATE MILESTONE NUMBER
    # ============================================================

    @staticmethod
    def generate_milestone_number(
        db: Session,
        organization_id: UUID,
    ) -> str:

        year = date.today().year

        prefix = f"MLS-{year}-"

        existing = (
            db.query(Milestone.milestone_no)
            .filter(
                Milestone.organization_id
                == organization_id,

                Milestone.milestone_no.like(
                    f"{prefix}%"
                ),
            )
            .all()
        )

        highest = 0

        for row in existing:

            milestone_no = row[0]

            if not milestone_no:
                continue

            try:

                number = int(
                    milestone_no.replace(
                        prefix,
                        "",
                    )
                )

                highest = max(
                    highest,
                    number,
                )

            except ValueError:

                continue

        return (
            f"{prefix}"
            f"{highest + 1:04d}"
        )

    # ============================================================
    # GET ALL ACTIVE MILESTONES
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        organization_id: UUID,
    ):

        return (
            db.query(Milestone)
            .filter(
                Milestone.organization_id
                == organization_id,

                Milestone.is_archived
                == False,
            )
            .order_by(
                Milestone.created_at.desc()
            )
            .all()
        )

    # ============================================================
    # GET ARCHIVED MILESTONES
    # ============================================================

    @staticmethod
    def get_archived(
        db: Session,
        organization_id: UUID,
    ):

        return (
            db.query(Milestone)
            .filter(
                Milestone.organization_id == organization_id,
                Milestone.is_archived == True,
            )
            .order_by(
                Milestone.updated_at.desc()
            )
            .all()
        )

    # ============================================================
    # GET BY CONTRACT
    # ============================================================

    @staticmethod
    def get_by_contract(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):

        return (
            db.query(Milestone)
            .filter(
                Milestone.contract_id
                == contract_id,

                Milestone.organization_id
                == organization_id,

                Milestone.is_archived
                == False,
            )
            .order_by(
                Milestone.created_at.desc()
            )
            .all()
        )

    # ============================================================
    # GET BY ID
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        milestone_id: UUID,
        organization_id: UUID,
    ):

        milestone = (
            db.query(Milestone)
            .filter(
                Milestone.id
                == milestone_id,

                Milestone.organization_id
                == organization_id,
            )
            .first()
        )

        if not milestone:
            raise ValueError(
                "Milestone not found."
            )

        return milestone

    # ============================================================
    # CREATE
    # ============================================================
    #
    # IMPORTANT:
    # Progress and status are NOT user-controlled.
    #
    # New milestone always starts at:
    #
    # progress = 0
    # status   = Not Started
    #
    # Tasks will control these values later.
    #
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        contract_id: UUID,
        title: str,
        description: str | None = None,
        due_date=None,
        milestone_no: str | None = None,
    ):

        # --------------------------------------------------------
        # VERIFY CONTRACT
        # --------------------------------------------------------

        contract = (
            db.query(Contract)
            .filter(
                Contract.id
                == contract_id,

                Contract.organization_id
                == organization_id,
            )
            .first()
        )

        if not contract:
            raise ValueError(
                "Contract not found."
            )

        # --------------------------------------------------------
        # VALIDATE TITLE
        # --------------------------------------------------------

        if not title or not title.strip():
            raise ValueError(
                "Milestone title is required."
            )

        title = title.strip()

        # --------------------------------------------------------
        # AUTO-GENERATE NUMBER
        # --------------------------------------------------------

        milestone_no = (
            MilestoneService
            .generate_milestone_number(
                db,
                organization_id,
            )
        )

        # --------------------------------------------------------
        # CREATE MILESTONE
        # --------------------------------------------------------

        milestone = Milestone(
            id=uuid.uuid4(),

            organization_id=
                organization_id,

            contract_id=
                contract_id,

            milestone_no=
                milestone_no,

            title=
                title,

            description=
                description,

            due_date=
                due_date,

            # SYSTEM-CALCULATED
            progress=0,

            # SYSTEM-CALCULATED
            status="Not Started",

            is_archived=False,
        )

        db.add(milestone)

        db.commit()

        db.refresh(milestone)

        return milestone

    # ============================================================
    # UPDATE
    # ============================================================
    #
    # Only editable milestone details:
    #
    # - title
    # - description
    # - due_date
    #
    # Progress and status are controlled by tasks.
    #
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        milestone_id: UUID,
        organization_id: UUID,
        title=None,
        description=None,
        due_date=None,
    ):

        milestone = (
            MilestoneService.get_by_id(
                db,
                milestone_id,
                organization_id,
            )
        )

        # --------------------------------------------------------
        # DO NOT EDIT ARCHIVED MILESTONES
        # --------------------------------------------------------

        if milestone.is_archived:
            raise ValueError(
                "Cannot update an archived milestone."
            )

        # --------------------------------------------------------
        # TITLE
        # --------------------------------------------------------

        if title is not None:

            if not title.strip():
                raise ValueError(
                    "Milestone title is required."
                )

            milestone.title = title.strip()

        # --------------------------------------------------------
        # DESCRIPTION
        # --------------------------------------------------------

        if description is not None:
            milestone.description = description

        # --------------------------------------------------------
        # DUE DATE
        # --------------------------------------------------------

        if due_date is not None:
            milestone.due_date = due_date

        # --------------------------------------------------------
        # IMPORTANT:
        #
        # progress and status are intentionally NOT changed here.
        #
        # They are controlled by MilestoneTaskService.
        # --------------------------------------------------------

        db.commit()

        db.refresh(milestone)

        return milestone

    # ============================================================
    # ARCHIVE
    # ============================================================

    @staticmethod
    def archive(
        db: Session,
        milestone_id: UUID,
        organization_id: UUID,
    ):

        milestone = (
            MilestoneService.get_by_id(
                db,
                milestone_id,
                organization_id,
            )
        )

        if milestone.is_archived:
            raise ValueError(
                "Milestone is already archived."
            )

        milestone.is_archived = True

        db.commit()

        db.refresh(milestone)

        return milestone

    # ============================================================
    # UNARCHIVE
    # ============================================================
    #
    # Kept for future archive-management functionality.
    #
    # ============================================================

    @staticmethod
    def unarchive(
        db: Session,
        milestone_id: UUID,
        organization_id: UUID,
    ):

        milestone = (
            MilestoneService.get_by_id(
                db,
                milestone_id,
                organization_id,
            )
        )

        if not milestone.is_archived:
            raise ValueError(
                "Milestone is already active."
            )

        milestone.is_archived = False

        db.commit()

        db.refresh(milestone)

        return milestone