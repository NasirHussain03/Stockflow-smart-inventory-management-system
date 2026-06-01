from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.services import customer_service
from app.api.deps import get_current_user_id, verify_admin
from typing import Optional

router = APIRouter()


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return customer_service.create_customer(db, customer_in, user_id=user_id)


@router.get("/", response_model=CustomerListResponse)
def read_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    items, total = customer_service.get_customers(db, skip=skip, limit=limit, search=search, user_id=user_id)
    return {"items": items, "total": total}


@router.get("/{id}", response_model=CustomerResponse)
def read_customer(
    id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return customer_service.get_customer(db, id, user_id=user_id)


@router.put("/{id}", response_model=CustomerResponse)
def update_customer(
    id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return customer_service.update_customer(db, id, customer_in, user_id=user_id)


@router.delete("/{id}", response_model=CustomerResponse)
def delete_customer(
    id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
    _: str = Depends(verify_admin)
):
    return customer_service.delete_customer(db, id, user_id=user_id)

