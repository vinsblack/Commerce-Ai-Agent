from sqlalchemy import Column, String, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.models.base import BaseModel

class Integration(BaseModel):
    """
    Modello per le integrazioni con servizi esterni.
    """
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # marketplace, payment, crm, shipping
    provider = Column(String, nullable=False)  # shopify, woocommerce, stripe, paypal, ecc.
    is_active = Column(Boolean, default=True, nullable=False)
    credentials = Column(JSON, nullable=True)
    settings = Column(JSON, nullable=True)
    
    # Relazioni
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="integrations")
    
    def __repr__(self):
        return f"<Integration {self.name} ({self.provider})>"
