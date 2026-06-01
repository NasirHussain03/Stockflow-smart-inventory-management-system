from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product
from app.models.order_item import OrderItem
from app.schemas.product import ProductCreate, ProductUpdate
from fastapi import HTTPException, status
from typing import Optional


def get_product(db: Session, product_id: int, user_id: Optional[int] = None) -> Product:
    query = db.query(Product).filter(Product.id == product_id)
    if user_id is not None:
        query = query.filter(Product.created_by == user_id)
    db_product = query.first()
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return db_product


def get_product_by_sku(db: Session, sku: str) -> Product:
    return db.query(Product).filter(Product.sku == sku).first()


def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    user_id: Optional[int] = None
):
    query = db.query(Product)
    if user_id is not None:
        query = query.filter(Product.created_by == user_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_filter),
                Product.sku.ilike(search_filter),
                Product.description.ilike(search_filter)
            )
        )
    total = query.count()
    items = query.order_by(Product.updated_at.desc()).offset(skip).limit(limit).all()
    return items, total


def create_product(db: Session, product_in: ProductCreate, user_id: Optional[int] = None) -> Product:
    if get_product_by_sku(db, product_in.sku):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku}' already exists"
        )

    db_product = Product(
        sku=product_in.sku,
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        stock_quantity=product_in.stock_quantity,
        created_by=user_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(
    db: Session,
    product_id: int,
    product_in: ProductUpdate,
    user_id: Optional[int] = None
) -> Product:
    db_product = get_product(db, product_id, user_id=user_id)

    if product_in.sku is not None and product_in.sku != db_product.sku:
        if get_product_by_sku(db, product_in.sku):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_in.sku}' already exists"
            )

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int, user_id: Optional[int] = None) -> Product:
    db_product = get_product(db, product_id, user_id=user_id)

    ordered_item = db.query(OrderItem).filter(OrderItem.product_id == product_id).first()
    if ordered_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product as it is associated with existing orders."
        )

    db.delete(db_product)
    db.commit()
    return db_product
