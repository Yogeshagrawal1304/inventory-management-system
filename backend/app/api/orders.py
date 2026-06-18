from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    return OrderService(db).get_all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return OrderService(db).get_by_id(order_id)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, data: OrderStatusUpdate, db: Session = Depends(get_db)):
    return OrderService(db).update_status(order_id, data.status)


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    return OrderService(db).create(data)
