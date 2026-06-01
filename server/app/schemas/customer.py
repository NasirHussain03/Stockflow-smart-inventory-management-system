from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, description="Full name of the customer")
    email: EmailStr = Field(..., description="Unique and valid email address")
    phone: Optional[str] = Field(None, description="Optional contact phone number")
    address: Optional[str] = Field(None, description="Optional delivery address")

class CustomerCreate(CustomerBase):
    @field_validator('full_name')
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Name cannot be empty or whitespace only')
        return v.strip()

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    @field_validator('full_name')
    @classmethod
    def not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty or whitespace only')
        return v.strip() if v is not None else None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerListResponse(BaseModel):
    items: List[CustomerResponse]
    total: int
