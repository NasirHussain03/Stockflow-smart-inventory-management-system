from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(String, nullable=False, default="Pending")  # Pending, Confirmed, Cancelled
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    customer = relationship("Customer")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
