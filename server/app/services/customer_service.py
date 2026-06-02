from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate, CustomerUpdate
from fastapi import HTTPException, status
from typing import Optional


def get_customer(db: Session, customer_id: int, user_id: Optional[int] = None) -> Customer:
    query = db.query(Customer).filter(Customer.id == customer_id)
    if user_id is not None:
        query = query.filter(Customer.created_by == user_id)
    db_customer = query.first()
    if not db_customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    return db_customer


def get_customer_by_email(db: Session, email: str) -> Customer:
    return db.query(Customer).filter(Customer.email == email).first()


def get_customers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    user_id: Optional[int] = None
):
    query = db.query(Customer)
    if user_id is not None:
        query = query.filter(Customer.created_by == user_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Customer.full_name.ilike(search_filter),
                Customer.email.ilike(search_filter),
                Customer.phone.ilike(search_filter),
                Customer.address.ilike(search_filter)
            )
        )
    total = query.count()
    items = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


def create_customer(
    db: Session,
    customer_in: CustomerCreate,
    user_id: Optional[int] = None
) -> Customer:
    if get_customer_by_email(db, customer_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer_in.email}' already exists"
        )

    db_customer = Customer(
        full_name=customer_in.full_name,
        email=customer_in.email,
        phone=customer_in.phone,
        address=customer_in.address,
        created_by=user_id
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)

    # Log action
    from app.services.activity_log_service import create_log
    create_log(
        db,
        action="CREATE",
        entity_type="Customer",
        entity_id=str(db_customer.id),
        user_id=user_id,
        details=f"Customer '{db_customer.full_name}' ({db_customer.email}) created"
    )

    return db_customer


def update_customer(
    db: Session,
    customer_id: int,
    customer_in: CustomerUpdate,
    user_id: Optional[int] = None
) -> Customer:
    db_customer = get_customer(db, customer_id, user_id=user_id)

    if customer_in.email is not None and customer_in.email != db_customer.email:
        if get_customer_by_email(db, customer_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{customer_in.email}' already exists"
            )

    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_customer, field, value)

    db.commit()
    db.refresh(db_customer)

    # Log action
    from app.services.activity_log_service import create_log
    create_log(
        db,
        action="UPDATE",
        entity_type="Customer",
        entity_id=str(db_customer.id),
        user_id=user_id,
        details=f"Customer '{db_customer.full_name}' ({db_customer.email}) updated"
    )

    return db_customer


def delete_customer(db: Session, customer_id: int, user_id: Optional[int] = None) -> Customer:
    db_customer = get_customer(db, customer_id, user_id=None)

    has_orders = db.query(Order).filter(Order.customer_id == customer_id).first()
    if has_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete customer as they have existing orders."
        )

    # Save name before delete for logs
    c_name = db_customer.full_name
    c_email = db_customer.email

    db.delete(db_customer)
    db.commit()

    # Log action
    from app.services.activity_log_service import create_log
    create_log(
        db,
        action="DELETE",
        entity_type="Customer",
        entity_id=str(customer_id),
        user_id=user_id,
        details=f"Customer '{c_name}' ({c_email}) deleted"
    )

    return db_customer
