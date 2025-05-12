from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel

class StoreBase(BaseModel):
    """
    Schema base per i negozi.
    """
    name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    platform: Optional[str] = None
    is_active: Optional[bool] = True
    settings: Optional[Dict[str, Any]] = None

class StoreCreate(StoreBase):
    """
    Schema per la creazione di un negozio.
    """
    name: str
    platform: str

class StoreUpdate(StoreBase):
    """
    Schema per l'aggiornamento di un negozio.
    """
    pass

class StoreInDBBase(StoreBase):
    """
    Schema per un negozio nel database.
    """
    id: UUID
    owner_id: UUID
    
    class Config:
        orm_mode = True

class Store(StoreInDBBase):
    """
    Schema per un negozio nelle risposte API.
    """
    pass
