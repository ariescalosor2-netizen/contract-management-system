from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class CreateUser(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str


class UpdateUser(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None
    is_active: bool | None = None