from typing import List

from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.utils.exceptions import ConflictException, NotFoundException


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)

    def get_all(self) -> List[Customer]:
        return self.repo.get_all()

    def get_by_id(self, customer_id: int) -> Customer:
        customer = self.repo.get_by_id(customer_id)
        if not customer:
            raise NotFoundException(f"Customer with id {customer_id} not found")
        return customer

    def create(self, data: CustomerCreate) -> Customer:
        if self.repo.get_by_email(data.email):
            raise ConflictException(f"Customer with email '{data.email}' already exists")
        return self.repo.create(data)

    def update(self, customer_id: int, data: CustomerUpdate) -> Customer:
        customer = self.get_by_id(customer_id)
        if data.email and data.email != customer.email:
            existing = self.repo.get_by_email(data.email)
            if existing:
                raise ConflictException(f"Customer with email '{data.email}' already exists")
        return self.repo.update(customer, data)

    def delete(self, customer_id: int) -> None:
        customer = self.get_by_id(customer_id)
        self.repo.delete(customer)
