from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import customers, dashboard, orders, products
from app.core.config import settings

app = FastAPI(
    title="Inventory & Order Management System",
    description="Production-ready inventory and order management API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
