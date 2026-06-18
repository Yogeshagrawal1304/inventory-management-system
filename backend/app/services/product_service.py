from typing import List

from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.exceptions import ConflictException, NotFoundException


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)

    def get_all(self) -> List[Product]:
        return self.repo.get_all()

    def get_by_id(self, product_id: int) -> Product:
        product = self.repo.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with id {product_id} not found")
        return product

    def create(self, data: ProductCreate) -> Product:
        if self.repo.get_by_sku(data.sku):
            raise ConflictException(f"Product with SKU '{data.sku}' already exists")
        return self.repo.create(data)

    def update(self, product_id: int, data: ProductUpdate) -> Product:
        product = self.get_by_id(product_id)
        if data.sku and data.sku != product.sku:
            existing = self.repo.get_by_sku(data.sku)
            if existing:
                raise ConflictException(f"Product with SKU '{data.sku}' already exists")
        return self.repo.update(product, data)

    def delete(self, product_id: int) -> None:
        product = self.get_by_id(product_id)
        self.repo.delete(product)
