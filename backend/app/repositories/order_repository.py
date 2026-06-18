from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models.order import Order
from app.models.order_item import OrderItem


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Order]:
        return self.db.query(Order).options(joinedload(Order.items)).all()

    def get_by_id(self, order_id: int) -> Optional[Order]:
        return (
            self.db.query(Order)
            .options(joinedload(Order.items))
            .filter(Order.id == order_id)
            .first()
        )

    def create_order(self, order: Order, items: List[OrderItem]) -> Order:
        self.db.add(order)
        self.db.flush()
        for item in items:
            item.order_id = order.id
            self.db.add(item)
        self.db.commit()
        self.db.refresh(order)
        return order
