from uuid import UUID

from sqlalchemy.orm import Session

from app.models.document import Document


class DocumentRepository:

    # ============================================================
    # GET ALL
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):

        return (
            db.query(Document)
            .filter(
                Document.contract_id
                == contract_id,

                Document.organization_id
                == organization_id,
            )
            .order_by(
                Document.created_at.desc()
            )
            .all()
        )

    # ============================================================
    # GET BY ID
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        document_id: UUID,
        organization_id: UUID,
    ):

        return (
            db.query(Document)
            .filter(
                Document.id
                == document_id,

                Document.organization_id
                == organization_id,
            )
            .first()
        )

    # ============================================================
    # CREATE
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        document: Document,
    ):

        db.add(document)

        db.commit()

        db.refresh(document)

        return document

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        document: Document,
    ):

        db.delete(document)

        db.commit()

        return True