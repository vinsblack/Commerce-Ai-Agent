from sqlalchemy import Column, String, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.models.base import BaseModel

class Store(BaseModel):
    """
    Modello per i negozi/store degli utenti.
    """
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    url = Column(String, nullable=True)
    platform = Column(String, nullable=False)  # shopify, woocommerce, amazon, ebay, ecc.
    is_active = Column(Boolean, default=True, nullable=False)
    settings = Column(JSON, nullable=True)
    
    # Relazioni
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="stores")
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="store", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="store", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Store {self.name} ({self.platform})>"
