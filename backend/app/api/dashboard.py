from fastapi import APIRouter, Depends
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    low_stock = db.query(func.count(Product.id)).filter(
        Product.stock_quantity <= LOW_STOCK_THRESHOLD,
        Product.stock_quantity > 0,
    ).scalar()
    out_of_stock = db.query(func.count(Product.id)).filter(
        Product.stock_quantity == 0
    ).scalar()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock,
        "out_of_stock_products": out_of_stock,
    }


@router.get("/monthly-orders")
def get_monthly_orders(db: Session = Depends(get_db)):
    results = db.execute(text("""
        SELECT TO_CHAR(created_at, 'Mon') AS month,
               EXTRACT(MONTH FROM created_at) AS month_num,
               COUNT(*) AS count
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY month, month_num
        ORDER BY month_num
    """)).fetchall()
    return [{"month": r[0], "orders": r[2]} for r in results]


@router.get("/stock-distribution")
def get_stock_distribution(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    in_stock = sum(1 for p in products if p.stock_quantity > LOW_STOCK_THRESHOLD)
    low_stock = sum(1 for p in products if 0 < p.stock_quantity <= LOW_STOCK_THRESHOLD)
    out_of_stock = sum(1 for p in products if p.stock_quantity == 0)
    return [
        {"name": "In Stock", "value": in_stock},
        {"name": "Low Stock", "value": low_stock},
        {"name": "Out of Stock", "value": out_of_stock},
    ]
