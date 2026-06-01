from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.services import product_service
from app.api.deps import get_current_user_id, verify_admin
from typing import Optional

router = APIRouter()


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return product_service.create_product(db, product_in, user_id=user_id)


@router.get("/", response_model=ProductListResponse)
def read_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    items, total = product_service.get_products(db, skip=skip, limit=limit, search=search, user_id=user_id)
    return {"items": items, "total": total}


@router.get("/{id}", response_model=ProductResponse)
def read_product(
    id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return product_service.get_product(db, id, user_id=user_id)


@router.put("/{id}", response_model=ProductResponse)
def update_product(
    id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    return product_service.update_product(db, id, product_in, user_id=user_id)


@router.delete("/{id}", response_model=ProductResponse)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
    _: str = Depends(verify_admin)
):
    return product_service.delete_product(db, id, user_id=user_id)

