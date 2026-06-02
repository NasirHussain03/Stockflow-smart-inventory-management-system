from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services.customer_service import get_customer
from fastapi import HTTPException, status
from decimal import Decimal
from typing import Optional


class InsufficientStockException(Exception):
    """Raised when product stock is insufficient for an order."""
    pass


def get_order(db: Session, order_id: int, user_id: Optional[int] = None) -> Order:
    query = db.query(Order).filter(Order.id == order_id)
    if user_id is not None:
        query = query.filter(Order.created_by == user_id)
    db_order = query.first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found"
        )
    return db_order


def get_orders(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None
):
    query = db.query(Order)
    if user_id is not None:
        query = query.filter(Order.created_by == user_id)
    total = query.count()
    items = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


def create_order(
    db: Session,
    order_in: OrderCreate,
    user_id: Optional[int] = None
) -> Order:
    # Validate customer exists (no user scoping — customers are referenced by ID)
    get_customer(db, order_in.customer_id)

    total_amount = Decimal('0.00')
    try:
        db_order = Order(
            customer_id=order_in.customer_id,
            status="Pending",
            total_amount=Decimal('0.00'),
            created_by=user_id
        )
        db.add(db_order)
        db.flush()

        for item_in in order_in.items:
            db_product = (
                db.query(Product)
                .filter(Product.id == item_in.product_id)
                .with_for_update()
                .first()
            )
            if not db_product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item_in.product_id} not found"
                )
            if db_product.stock_quantity < item_in.quantity:
                raise InsufficientStockException()

            db_product.stock_quantity -= item_in.quantity
            item_total = db_product.price * item_in.quantity
            total_amount += item_total

            db.add(OrderItem(
                order_id=db_order.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity,
                unit_price=db_product.price
            ))

        db_order.total_amount = total_amount
        db.commit()
        db.refresh(db_order)

        # Log action
        from app.services.activity_log_service import create_log
        create_log(
            db,
            action="CREATE",
            entity_type="Order",
            entity_id=str(db_order.id),
            user_id=user_id,
            details=f"Order #{db_order.id} created (Total: ₹{db_order.total_amount})"
        )

        return db_order

    except Exception as e:
        db.rollback()
        raise e


def update_order_status(
    db: Session,
    order_id: int,
    status_in: str,
    user_id: Optional[int] = None
) -> Order:
    db_order = get_order(db, order_id, user_id=user_id)
    old_status = db_order.status

    if old_status == status_in:
        return db_order

    try:
        if old_status == "Cancelled" and status_in in ["Pending", "Confirmed"]:
            for item in db_order.items:
                db_product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if not db_product or db_product.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock to restore order for product: {db_product.name if db_product else 'Unknown'}"
                    )
                db_product.stock_quantity -= item.quantity

        elif old_status in ["Pending", "Confirmed"] and status_in == "Cancelled":
            for item in db_order.items:
                db_product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if db_product:
                    db_product.stock_quantity += item.quantity

        db_order.status = status_in
        db.commit()
        db.refresh(db_order)

        # Log action
        from app.services.activity_log_service import create_log
        create_log(
            db,
            action="UPDATE_STATUS",
            entity_type="Order",
            entity_id=str(order_id),
            user_id=user_id,
            details=f"Order #{order_id} status updated from '{old_status}' to '{status_in}'"
        )

        return db_order

    except Exception as e:
        db.rollback()
        raise e


def delete_order(db: Session, order_id: int, user_id: Optional[int] = None) -> Order:
    db_order = get_order(db, order_id, user_id=user_id)
    try:
        if db_order.status != "Cancelled":
            for item in db_order.items:
                db_product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if db_product:
                    db_product.stock_quantity += item.quantity
        db.delete(db_order)
        db.commit()

        # Log action
        from app.services.activity_log_service import create_log
        create_log(
            db,
            action="DELETE",
            entity_type="Order",
            entity_id=str(order_id),
            user_id=user_id,
            details=f"Order #{order_id} deleted"
        )

        return db_order
    except Exception as e:
        db.rollback()
        raise e
