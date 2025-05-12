from typing import List, Optional
from sqlalchemy import Boolean, Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from src.models.base import BaseModel

class User(BaseModel):
    """
    Modello per gli utenti del sistema.
    """
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    subscription_plan = Column(String, default="free", nullable=False)
    
    # Relazioni
    stores = relationship("Store", back_populates="owner", cascade="all, delete-orphan")
    integrations = relationship("Integration", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"
