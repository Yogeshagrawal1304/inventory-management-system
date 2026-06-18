from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/", response_model=List[CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
    service = CustomerService(db)
    customers = service.get_all()
    result = []
    for c in customers:
        data = CustomerResponse.model_validate(c)
        data.orders_count = len(c.orders)
        result.append(data)
    return result


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    c = CustomerService(db).get_by_id(customer_id)
    data = CustomerResponse.model_validate(c)
    data.orders_count = len(c.orders)
    return data


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    return CustomerService(db).create(data)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, data: CustomerUpdate, db: Session = Depends(get_db)):
    return CustomerService(db).update(customer_id, data)


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    CustomerService(db).delete(customer_id)
