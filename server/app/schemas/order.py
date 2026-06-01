from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse

# Order Items Schemas
class OrderItemBase(BaseModel):
    product_id: int = Field(..., description="ID of the product being ordered")
    quantity: int = Field(..., gt=0, description="Quantity ordered must be greater than zero")

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    unit_price: Decimal
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)

# Order Schemas
class OrderBase(BaseModel):
    customer_id: int = Field(..., description="ID of the customer placing the order")

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order must contain at least one item")

class OrderUpdate(BaseModel):
    status: str = Field(..., description="Status of the order: Pending, Confirmed, Cancelled")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = {"Pending", "Confirmed", "Cancelled"}
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")
        return v

class OrderResponse(OrderBase):
    id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    customer: Optional[CustomerResponse] = None
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int
