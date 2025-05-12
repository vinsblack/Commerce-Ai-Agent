from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from src.models.base import BaseModel

class Product(BaseModel):
    """
    Modello per i prodotti.
    """
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    sku = Column(String, nullable=True)
    barcode = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)
    cost_price = Column(Float, nullable=True)
    quantity = Column(Integer, default=0, nullable=False)
    weight = Column(Float, nullable=True)
    weight_unit = Column(String, default="kg", nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_digital = Column(Boolean, default=False, nullable=False)
    categories = Column(ARRAY(String), nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    images = Column(ARRAY(String), nullable=True)
    variants = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    # Relazioni
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    store = relationship("Store", back_populates="products")
    
    def __repr__(self):
        return f"<Product {self.name} (SKU: {self.sku})>"
