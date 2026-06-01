from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderListResponse
from app.services import order_service
from app.api.deps import get_current_user_id
from typing import Optional

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return order_service.create_order(db, order_in, user_id=user_id)


@router.get("/", response_model=OrderListResponse)
def read_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    items, total = order_service.get_orders(db, skip=skip, limit=limit, user_id=user_id)
    return {"items": items, "total": total}


@router.get("/{id}", response_model=OrderResponse)
def read_order(
    id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return order_service.get_order(db, id, user_id=user_id)


@router.put("/{id}", response_model=OrderResponse)
def update_order_status(
    id: int,
    status_in: OrderUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return order_service.update_order_status(db, id, status_in.status, user_id=user_id)


@router.delete("/{id}", response_model=OrderResponse)
def delete_order(
    id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return order_service.delete_order(db, id, user_id=user_id)
