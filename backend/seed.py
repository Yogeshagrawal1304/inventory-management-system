"""Seed script — run once to populate the database with demo data."""

import os
from decimal import Decimal
from dotenv import load_dotenv

load_dotenv()

from app.core.database import SessionLocal
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem

PRODUCTS = [
    {"name": "MacBook Pro 14\"", "sku": "MBP-14-M3", "price": Decimal("1999.99"), "stock_quantity": 25, "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=80&h=80&fit=crop"},
    {"name": "iPhone 15 Pro",    "sku": "IPH-15-PRO", "price": Decimal("1099.00"), "stock_quantity": 42, "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80&h=80&fit=crop"},
    {"name": "Sony WH-1000XM5",  "sku": "SNY-WH1000", "price": Decimal("349.99"),  "stock_quantity": 8,  "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=80&h=80&fit=crop"},
    {"name": "iPad Air 5th Gen", "sku": "IPD-AIR-5",  "price": Decimal("749.00"),  "stock_quantity": 18, "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=80&h=80&fit=crop"},
    {"name": "Dell 27\" 4K Monitor", "sku": "DLL-MON-27", "price": Decimal("499.99"), "stock_quantity": 5, "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&h=80&fit=crop"},
    {"name": "Logitech MX Master 3", "sku": "LGT-MX3",  "price": Decimal("99.99"),  "stock_quantity": 30, "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop"},
    {"name": "Samsung 1TB SSD",  "sku": "SAM-SSD-1T",  "price": Decimal("89.99"),   "stock_quantity": 0,  "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=80&h=80&fit=crop"},
    {"name": "Keychron K2 Keyboard", "sku": "KCH-K2-WL", "price": Decimal("89.00"), "stock_quantity": 3, "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop"},
    {"name": "Anker USB-C Hub",  "sku": "ANK-USBC-7",  "price": Decimal("45.99"),   "stock_quantity": 55, "image_url": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=80&h=80&fit=crop"},
    {"name": "Apple AirPods Pro","sku": "APP-AIRP-2",  "price": Decimal("249.00"),  "stock_quantity": 12, "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80&h=80&fit=crop"},
]

CUSTOMERS = [
    {"name": "Alice Johnson",  "email": "alice@example.com",   "phone": "+1 555-0101"},
    {"name": "Bob Martinez",   "email": "bob@example.com",     "phone": "+1 555-0102"},
    {"name": "Carol Williams", "email": "carol@example.com",   "phone": "+1 555-0103"},
    {"name": "David Lee",      "email": "david@example.com",   "phone": "+1 555-0104"},
    {"name": "Emma Davis",     "email": "emma@example.com",    "phone": "+1 555-0105"},
    {"name": "Frank Wilson",   "email": "frank@example.com",   "phone": "+1 555-0106"},
    {"name": "Grace Kim",      "email": "grace@example.com",   "phone": "+1 555-0107"},
]

# (customer_index, [(product_index, qty), ...], status)
ORDERS = [
    (0, [(0, 1), (5, 1)],       OrderStatus.completed),
    (1, [(1, 2), (9, 2)],       OrderStatus.completed),
    (2, [(3, 1), (8, 3)],       OrderStatus.pending),
    (3, [(4, 1), (5, 2)],       OrderStatus.completed),
    (4, [(0, 1), (2, 1)],       OrderStatus.pending),
    (5, [(6, 2)],               OrderStatus.cancelled),
    (6, [(7, 1), (8, 2)],       OrderStatus.completed),
    (0, [(9, 3), (5, 1)],       OrderStatus.pending),
    (2, [(1, 1)],               OrderStatus.completed),
    (4, [(4, 2), (3, 1)],       OrderStatus.completed),
]


def seed():
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            print("Database already seeded — skipping.")
            return

        print("Seeding products...")
        products = [Product(**p) for p in PRODUCTS]
        db.add_all(products)
        db.flush()

        print("Seeding customers...")
        customers = [Customer(**c) for c in CUSTOMERS]
        db.add_all(customers)
        db.flush()

        print("Seeding orders...")
        for cust_idx, items, status in ORDERS:
            total = Decimal("0")
            order_items = []
            for prod_idx, qty in items:
                p = products[prod_idx]
                unit_price = Decimal(str(p.price))
                subtotal = unit_price * qty
                total += subtotal
                order_items.append(
                    OrderItem(
                        product_id=p.id,
                        quantity=qty,
                        unit_price=unit_price,
                        subtotal=subtotal,
                    )
                )

            order = Order(
                customer_id=customers[cust_idx].id,
                total_amount=total,
                status=status,
            )
            db.add(order)
            db.flush()
            for item in order_items:
                item.order_id = order.id
                db.add(item)

        db.commit()
        print(f"✓ Seeded {len(products)} products, {len(customers)} customers, {len(ORDERS)} orders.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
