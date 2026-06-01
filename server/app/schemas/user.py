from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=1, description="User's full name")
    email: EmailStr = Field(..., description="Unique email address")
    role: str = Field("Staff", description="Role context: Admin or Staff")

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        valid_roles = {"Admin", "Staff"}
        if v not in valid_roles:
            raise ValueError(f"Role must be one of {valid_roles}")
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

    @field_validator('full_name')
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Name cannot be empty or whitespace only')
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's login email")
    password: str = Field(..., description="User's login password")

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserRoleUpdate(BaseModel):
    role: str

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        valid_roles = {"Admin", "Staff"}
        if v not in valid_roles:
            raise ValueError(f"Role must be one of {valid_roles}")
        return v
