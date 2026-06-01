from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from datetime import datetime, timedelta
from typing import Optional


def get_dashboard_data(db: Session, user_id: Optional[int] = None):
    # Base queries scoped to the current user
    product_q  = db.query(Product)
    customer_q = db.query(Customer)
    order_q    = db.query(Order)

    if user_id is not None:
        product_q  = product_q.filter(Product.created_by == user_id)
        customer_q = customer_q.filter(Customer.created_by == user_id)
        order_q    = order_q.filter(Order.created_by == user_id)

    total_products  = product_q.count()
    total_customers = customer_q.count()
    total_orders    = order_q.count()
    low_stock_products = product_q.filter(Product.stock_quantity <= 10).count()

    # Orders by day (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    base_order_q = order_q.filter(
        Order.created_at >= thirty_days_ago,
        Order.status != "Cancelled"
    )

    orders_by_day_raw = (
        db.query(
            cast(Order.created_at, Date).label("order_date"),
            func.count(Order.id).label("orders_count"),
            func.sum(Order.total_amount).label("revenue")
        )
        .filter(
            Order.created_at >= thirty_days_ago,
            Order.status != "Cancelled",
            *([Order.created_by == user_id] if user_id is not None else [])
        )
        .group_by(cast(Order.created_at, Date))
        .order_by(cast(Order.created_at, Date).asc())
        .all()
    )

    orders_by_day = [
        {
            "date": str(row.order_date),
            "orders_count": row.orders_count or 0,
            "revenue": float(row.revenue or 0.0)
        }
        for row in orders_by_day_raw
    ] or [{"date": str(datetime.utcnow().date()), "orders_count": 0, "revenue": 0.0}]

    # Inventory distribution (top 10 by stock, scoped to user)
    inventory_raw = (
        product_q
        .with_entities(Product.name, Product.stock_quantity)
        .order_by(Product.stock_quantity.desc())
        .limit(10)
        .all()
    )

    inventory_distribution = [
        {"name": row.name, "stock": row.stock_quantity}
        for row in inventory_raw
    ]

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products,
        "orders_by_day": orders_by_day,
        "inventory_distribution": inventory_distribution
    }
