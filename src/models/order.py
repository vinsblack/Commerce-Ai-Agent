from sqlalchemy import Column, String, Float, Integer, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import enum

from src.models.base import BaseModel

class OrderStatus(enum.Enum):
    """
    Enum per lo stato degli ordini.
    """
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Order(BaseModel):
    """
    Modello per gli ordini.
    """
    order_number = Column(String, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    shipping_price = Column(Float, default=0, nullable=False)
    tax_price = Column(Float, default=0, nullable=False)
    discount_price = Column(Float, default=0, nullable=False)
    currency = Column(String, default="EUR", nullable=False)
    shipping_address = Column(JSON, nullable=True)
    billing_address = Column(JSON, nullable=True)
    payment_method = Column(String, nullable=True)
    shipping_method = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    tracking_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    items = Column(JSON, nullable=False)  # Array di prodotti con quantità, prezzo, ecc.
    metadata = Column(JSON, nullable=True)
    
    # Relazioni
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    store = relationship("Store", back_populates="orders")
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    customer = relationship("Customer", back_populates="orders")
    
    def __repr__(self):
        return f"<Order {self.order_number} ({self.status.value})>"
