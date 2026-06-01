from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, description="Unique SKU code for the product")
    name: str = Field(..., min_length=1, description="Name of the product")
    description: Optional[str] = Field(None, description="Detailed description of the product")
    price: Decimal = Field(..., gt=Decimal('0.00'), max_digits=10, decimal_places=2, description="Price must be greater than 0")
    stock_quantity: int = Field(..., ge=0, description="Available stock quantity cannot be negative")

class ProductCreate(ProductBase):
    @field_validator('sku', 'name')
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Cannot be empty or whitespace only')
        return v.strip()

class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=1)
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=Decimal('0.00'), max_digits=10, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)

    @field_validator('sku', 'name')
    @classmethod
    def not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError('Cannot be empty or whitespace only')
        return v.strip() if v is not None else None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
