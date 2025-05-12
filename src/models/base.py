import uuid
from datetime import datetime
from typing import Any, Dict

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr

from src.db.session import Base

class BaseModel(Base):
    """
    Modello base per tutti i modelli del database.
    Include campi comuni come id, created_at, updated_at.
    """
    __abstract__ = True
    
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Converte il modello in un dizionario.
        """
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
