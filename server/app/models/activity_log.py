from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String, nullable=True)  # Captured user name at the time of log
    action = Column(String, nullable=False)    # e.g., CREATE, UPDATE, DELETE, LOGIN, SIGNUP, UPDATE_STATUS
    entity_type = Column(String, nullable=False) # e.g., Product, Customer, Order, User
    entity_id = Column(String, nullable=True)   # Affected entity ID
    details = Column(Text, nullable=True)       # Human readable summary
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User")
