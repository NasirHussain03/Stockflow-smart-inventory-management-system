from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Staff")  # Admin, Staff
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
