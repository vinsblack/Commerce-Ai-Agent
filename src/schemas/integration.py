from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel

class IntegrationBase(BaseModel):
    """
    Schema base per le integrazioni.
    """
    name: Optional[str] = None
    type: Optional[str] = None
    provider: Optional[str] = None
    is_active: Optional[bool] = True
    credentials: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None

class IntegrationCreate(IntegrationBase):
    """
    Schema per la creazione di un'integrazione.
    """
    name: str
    type: str
    provider: str

class IntegrationUpdate(IntegrationBase):
    """
    Schema per l'aggiornamento di un'integrazione.
    """
    pass

class IntegrationInDBBase(IntegrationBase):
    """
    Schema per un'integrazione nel database.
    """
    id: UUID
    user_id: UUID
    
    class Config:
        orm_mode = True

class Integration(IntegrationInDBBase):
    """
    Schema per un'integrazione nelle risposte API.
    """
    pass
