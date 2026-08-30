from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    code: str = Field(min_length=1, max_length=100)
    status: str = Field(default="Active", min_length=1, max_length=20)
    admin_first_name: str | None = Field(default=None, min_length=1, max_length=100)
    admin_last_name: str | None = Field(default=None, min_length=1, max_length=100)
    admin_email: EmailStr | None = None
    admin_password: str | None = Field(default=None, min_length=8, max_length=255)


class OrganizationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: str | None = Field(default=None, min_length=1, max_length=100)
    status: str | None = Field(default=None, min_length=1, max_length=20)


class SuperAdminUserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    role: str = Field(min_length=1, max_length=50)
    organization_id: UUID | None = None


class SuperAdminUserUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=255)
    role: str | None = Field(default=None, min_length=1, max_length=50)
    organization_id: UUID | None = None
    is_active: bool | None = None
