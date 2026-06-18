from decimal import Decimal
from typing import List

from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.customer_repository import CustomerRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.order import OrderCreate
from app.utils.exceptions import BadRequestException, NotFoundException


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.product_repo = ProductRepository(db)

    def update_status(self, order_id: int, status) -> Order:
        order = self.get_by_id(order_id)
        order.status = status
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_all(self) -> List[Order]:
        return self.order_repo.get_all()

    def get_by_id(self, order_id: int) -> Order:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException(f"Order with id {order_id} not found")
        return order

    def create(self, data: OrderCreate) -> Order:
        customer = self.customer_repo.get_by_id(data.customer_id)
        if not customer:
            raise NotFoundException(f"Customer with id {data.customer_id} not found")

        order_items = []
        total_amount = Decimal("0")

        for item_data in data.items:
            product = self.product_repo.get_by_id(item_data.product_id)
            if not product:
                raise NotFoundException(f"Product with id {item_data.product_id} not found")
            if product.stock_quantity < item_data.quantity:
                raise BadRequestException(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock_quantity}, requested: {item_data.quantity}"
                )

            unit_price = Decimal(str(product.price))
            subtotal = unit_price * item_data.quantity
            total_amount += subtotal

            order_items.append(
                OrderItem(
                    product_id=product.id,
                    quantity=item_data.quantity,
                    unit_price=unit_price,
                    subtotal=subtotal,
                )
            )

        for item_data in data.items:
            product = self.product_repo.get_by_id(item_data.product_id)
            product.stock_quantity -= item_data.quantity

        order = Order(customer_id=data.customer_id, total_amount=total_amount)
        return self.order_repo.create_order(order, order_items)
