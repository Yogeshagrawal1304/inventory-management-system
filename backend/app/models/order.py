import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class OrderStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
