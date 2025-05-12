from sqlalchemy import Column, String, Boolean, ForeignKey, JSON, Date
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from src.models.base import BaseModel

class Customer(BaseModel):
    """
    Modello per i clienti.
    """
    email = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    accepts_marketing = Column(Boolean, default=False, nullable=False)
    default_address = Column(JSON, nullable=True)
    addresses = Column(ARRAY(JSON), nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    notes = Column(String, nullable=True)
    birthdate = Column(Date, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    # Relazioni
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    store = relationship("Store", back_populates="customers")
    orders = relationship("Order", back_populates="customer")
    
    def __repr__(self):
        return f"<Customer {self.email}>"
