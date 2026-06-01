from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services import auth_service
from app.models.user import User
from typing import Optional

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(
    user_in: UserCreate, 
    db: Session = Depends(get_db),
    x_user_role: Optional[str] = Header(None)
):
    # Allow registering the first user as Admin if no users exist.
    # Otherwise, only allow an Admin to register/create Admin users.
    if db.query(User).count() > 0 and x_user_role != "Admin":
        user_in.role = "Staff"
    return auth_service.create_user(db, user_in)

@router.post("/login", response_model=UserResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, login_in)

