from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password
from fastapi import HTTPException, status

def create_user(db: Session, user_in: UserCreate) -> User:
    # Verify email is unique
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account with this email already exists."
        )
        
    db_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, login_in: UserLogin) -> User:
    db_user = db.query(User).filter(User.email == login_in.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    if not verify_password(login_in.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    return db_user

def get_users(db: Session):
    return db.query(User).order_by(User.id).all()

def update_user_role(db: Session, user_id: int, role: str) -> User:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db_user.role = role
    db.commit()
    db.refresh(db_user)
    return db_user
