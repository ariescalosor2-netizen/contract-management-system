from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ============================================================
# DOCUMENT RESPONSE
# ============================================================

class DocumentResponse(BaseModel):

    id: UUID

    organization_id: UUID

    contract_id: UUID

    document_name: str

    document_type: str

    file_name: str

    content_type: str | None = None

    file_size: int | None = None

    description: str | None = None

    uploaded_by: UUID

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )