import os
import uuid

from pathlib import Path
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.document import Document

from app.repositories.document_repository import (
    DocumentRepository,
)


class DocumentService:

    # ============================================================
    # UPLOAD DIRECTORY
    # ============================================================

    UPLOAD_ROOT = Path("uploads/contracts")

    # ============================================================
    # ALLOWED FILE TYPES
    # ============================================================

    ALLOWED_EXTENSIONS = {
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".jpg",
        ".jpeg",
        ".png",
    }

    # 10 MB
    MAX_FILE_SIZE = 10 * 1024 * 1024

    # ============================================================
    # GET DOCUMENTS
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        contract_id: UUID,
        organization_id: UUID,
    ):

        contract = (
            db.query(Contract)
            .filter(
                Contract.id == contract_id,
                Contract.organization_id
                == organization_id,
            )
            .first()
        )

        if not contract:

            raise ValueError(
                "Contract not found."
            )

        return DocumentRepository.get_all(
            db,
            contract_id,
            organization_id,
        )

    # ============================================================
    # GET SINGLE DOCUMENT
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        document_id: UUID,
        organization_id: UUID,
    ):

        document = (
            DocumentRepository.get_by_id(
                db,
                document_id,
                organization_id,
            )
        )

        if not document:

            raise ValueError(
                "Document not found."
            )

        return document

    # ============================================================
    # CREATE DOCUMENT
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        organization_id: UUID,
        contract_id: UUID,
        uploaded_by: UUID,
        document_name: str,
        document_type: str,
        file_name: str,
        file_content: bytes,
        content_type: str | None = None,
        description: str | None = None,
    ):

        # --------------------------------------------------------
        # CHECK CONTRACT
        # --------------------------------------------------------

        contract = (
            db.query(Contract)
            .filter(
                Contract.id == contract_id,
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
        # CHECK FILE NAME
        # --------------------------------------------------------

        original_name = (
            Path(file_name).name
        )

        extension = (
            Path(original_name)
            .suffix
            .lower()
        )

        if extension not in (
            DocumentService.ALLOWED_EXTENSIONS
        ):

            raise ValueError(
                "File type is not allowed. "
                "Allowed files: PDF, DOC, DOCX, XLS, XLSX, "
                "JPG, JPEG, PNG."
            )

        # --------------------------------------------------------
        # CHECK FILE SIZE
        # --------------------------------------------------------

        file_size = len(
            file_content
        )

        if (
            file_size
            > DocumentService.MAX_FILE_SIZE
        ):

            raise ValueError(
                "File size cannot exceed 10 MB."
            )

        if file_size == 0:

            raise ValueError(
                "Uploaded file is empty."
            )

        # --------------------------------------------------------
        # CREATE DIRECTORY
        # --------------------------------------------------------

        contract_directory = (
            DocumentService.UPLOAD_ROOT
            / str(contract_id)
        )

        contract_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        # --------------------------------------------------------
        # GENERATE SAFE STORAGE NAME
        # --------------------------------------------------------

        stored_name = (
            f"{uuid.uuid4()}"
            f"{extension}"
        )

        file_path = (
            contract_directory
            / stored_name
        )

        # --------------------------------------------------------
        # SAVE FILE
        # --------------------------------------------------------

        try:

            with open(
                file_path,
                "wb",
            ) as file:

                file.write(
                    file_content
                )

        except OSError as error:

            raise ValueError(
                f"Unable to save document: {error}"
            )

        # --------------------------------------------------------
        # CREATE DATABASE RECORD
        # --------------------------------------------------------

        document = Document(

            id=uuid.uuid4(),

            organization_id=
                organization_id,

            contract_id=
                contract_id,

            document_name=
                document_name.strip(),

            document_type=
                document_type.strip(),

            file_name=
                original_name,

            file_path=
                str(file_path),

            content_type=
                content_type,

            file_size=
                file_size,

            description=(
                description.strip()
                if description
                else None
            ),

            uploaded_by=
                uploaded_by,
        )

        try:

            return DocumentRepository.create(
                db,
                document,
            )

        except Exception:

            # ----------------------------------------------------
            # DATABASE FAILED
            # REMOVE PHYSICAL FILE
            # ----------------------------------------------------

            if file_path.exists():

                try:
                    file_path.unlink()
                except OSError:
                    pass

            raise

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        document_id: UUID,
        organization_id: UUID,
    ):

        document = (
            DocumentRepository.get_by_id(
                db,
                document_id,
                organization_id,
            )
        )

        if not document:

            raise ValueError(
                "Document not found."
            )

        # --------------------------------------------------------
        # DELETE PHYSICAL FILE
        # --------------------------------------------------------

        file_path = Path(
            document.file_path
        )

        if file_path.exists():

            try:
                file_path.unlink()

            except OSError as error:

                raise ValueError(
                    f"Unable to delete document file: {error}"
                )

        # --------------------------------------------------------
        # DELETE DATABASE RECORD
        # --------------------------------------------------------

        DocumentRepository.delete(
            db,
            document,
        )

        return True