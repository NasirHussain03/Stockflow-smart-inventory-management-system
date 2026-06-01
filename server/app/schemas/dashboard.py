from pydantic import BaseModel
from typing import List

class OrdersByDayItem(BaseModel):
    date: str
    orders_count: int
    revenue: float

class InventoryDistributionItem(BaseModel):
    name: str
    stock: int

class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
    orders_by_day: List[OrdersByDayItem]
    inventory_distribution: List[InventoryDistributionItem]
