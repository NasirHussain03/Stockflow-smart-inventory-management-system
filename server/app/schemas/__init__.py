from app.schemas.product import ProductBase, ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.schemas.customer import CustomerBase, CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.schemas.order import OrderBase, OrderCreate, OrderUpdate, OrderResponse, OrderItemResponse, OrderItemCreate, OrderListResponse
from app.schemas.dashboard import DashboardResponse, OrdersByDayItem, InventoryDistributionItem

__all__ = [
    "ProductBase", "ProductCreate", "ProductUpdate", "ProductResponse", "ProductListResponse",
    "CustomerBase", "CustomerCreate", "CustomerUpdate", "CustomerResponse", "CustomerListResponse",
    "OrderBase", "OrderCreate", "OrderUpdate", "OrderResponse", "OrderItemResponse", "OrderItemCreate", "OrderListResponse",
    "DashboardResponse", "OrdersByDayItem", "InventoryDistributionItem"
]
