from sqlalchemy import CheckConstraint, Column, DateTime, Integer, Numeric, String, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        CheckConstraint("stock_quantity >= 0", name="ck_product_stock_non_negative"),
        CheckConstraint("price > 0", name="ck_product_price_positive"),
    )
