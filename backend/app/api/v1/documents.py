from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from app.core.security import (
    get_current_user,
)

from app.database.session import (
    get_db,
)

from app.models.user import User

from app.schemas.document import (
    DocumentResponse,
)

from app.services.document_service import (
    DocumentService,
)


router = APIRouter()


# ============================================================
# ADMIN CHECK
# ============================================================

def require_admin(
    current_user: User,
):

    role_name = ""

    if current_user.role:

        role_name = str(
            current_user.role.name
        ).strip().lower()

    if role_name not in {
        "admin",
        "administrator",
    }:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "Administrator access is required for contract documents.",
        )

    return current_user


# ============================================================
# SERIALIZER
# ============================================================

def serialize_document(
    document,
):

    return {

        "id":
            str(document.id),

        "organization_id":
            str(
                document.organization_id
            ),

        "contract_id":
            str(
                document.contract_id
            ),

        "document_name":
            document.document_name,

        "document_type":
            document.document_type,

        "file_name":
            document.file_name,

        "content_type":
            document.content_type,

        "file_size":
            document.file_size,

        "description":
            document.description,

        "uploaded_by":
            str(
                document.uploaded_by
            ),

        "created_at":
            document.created_at,

        "updated_at":
            document.updated_at,
    }


# ============================================================
# GET CONTRACT DOCUMENTS
# ============================================================

@router.get(
    "/contract/{contract_id}"
)
def get_contract_documents(

    contract_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),
):

    require_admin(
        current_user
    )

    try:

        documents = (
            DocumentService.get_all(
                db,
                contract_id,
                current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Contract documents retrieved successfully.",

            "data": [

                serialize_document(
                    document
                )

                for document in documents

            ],
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# GET DOCUMENT
# ============================================================

@router.get(
    "/{document_id}"
)
def get_document(

    document_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),
):

    require_admin(
        current_user
    )

    try:

        document = (
            DocumentService.get_by_id(
                db,
                document_id,
                current_user.organization_id,
            )
        )

        return {

            "success":
                True,

            "message":
                "Document retrieved successfully.",

            "data":
                serialize_document(
                    document
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# UPLOAD DOCUMENT
# ============================================================

@router.post(
    "/upload",
    status_code=
        status.HTTP_201_CREATED,
)
async def upload_document(

    contract_id: UUID =
        Form(...),

    document_name: str =
        Form(...),

    document_type: str =
        Form("Other"),

    description: str | None =
        Form(None),

    file: UploadFile =
        File(...),

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),
):

    require_admin(
        current_user
    )

    # --------------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------------

    if not document_name.strip():

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Document name is required.",
        )

    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    try:

        file_content = (
            await file.read()
        )

    except Exception as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                f"Unable to read uploaded file: {error}",
        )

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    try:

        document = (
            DocumentService.create(

                db=db,

                organization_id=(
                    current_user.organization_id
                ),

                contract_id=
                    contract_id,

                uploaded_by=
                    current_user.id,

                document_name=
                    document_name,

                document_type=
                    document_type,

                file_name=
                    file.filename
                    or "document",

                file_content=
                    file_content,

                content_type=
                    file.content_type,

                description=
                    description,
            )
        )

        return {

            "success":
                True,

            "message":
                "Document uploaded successfully.",

            "data":
                serialize_document(
                    document
                ),
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )


# ============================================================
# DOWNLOAD DOCUMENT
# ============================================================

@router.get(
    "/{document_id}/download"
)
def download_document(

    document_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),
):

    require_admin(
        current_user
    )

    try:

        document = (
            DocumentService.get_by_id(
                db,
                document_id,
                current_user.organization_id,
            )
        )

        file_path = document.file_path

        import os

        if not os.path.exists(
            file_path
        ):

            raise HTTPException(

                status_code=
                    status.HTTP_404_NOT_FOUND,

                detail=
                    "Document file was not found on the server.",
            )

        return FileResponse(

            path=file_path,

            filename=document.file_name,

            media_type=(
                document.content_type
                or "application/octet-stream"
            ),
        )

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=str(error),
        )


# ============================================================
# DELETE DOCUMENT
# ============================================================

@router.delete(
    "/{document_id}"
)
def delete_document(

    document_id: UUID,

    db: Session =
        Depends(get_db),

    current_user: User =
        Depends(get_current_user),
):

    require_admin(
        current_user
    )

    try:

        DocumentService.delete(

            db=db,

            document_id=
                document_id,

            organization_id=(
                current_user.organization_id
            ),
        )

        return {

            "success":
                True,

            "message":
                "Document deleted successfully.",
        }

    except ValueError as error:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=str(error),
        )