from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import date
from pydantic import BaseModel, EmailStr

class CustomerBase(BaseModel):
    """
    Schema base per i clienti.
    """
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = True
    accepts_marketing: Optional[bool] = False
    default_address: Optional[Dict[str, Any]] = None
    addresses: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    birthdate: Optional[date] = None
    metadata: Optional[Dict[str, Any]] = None

class CustomerCreate(CustomerBase):
    """
    Schema per la creazione di un cliente.
    """
    email: EmailStr
    store_id: UUID

class CustomerUpdate(CustomerBase):
    """
    Schema per l'aggiornamento di un cliente.
    """
    pass

class CustomerInDBBase(CustomerBase):
    """
    Schema per un cliente nel database.
    """
    id: UUID
    store_id: UUID
    
    class Config:
        orm_mode = True

class Customer(CustomerInDBBase):
    """
    Schema per un cliente nelle risposte API.
    """
    pass
