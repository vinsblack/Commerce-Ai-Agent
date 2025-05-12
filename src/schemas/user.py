from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    """
    Schema base per gli utenti.
    """
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    subscription_plan: str = "free"

class UserCreate(UserBase):
    """
    Schema per la creazione di un utente.
    """
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    """
    Schema per l'aggiornamento di un utente.
    """
    password: Optional[str] = None

class UserInDBBase(UserBase):
    """
    Schema per un utente nel database.
    """
    id: UUID
    
    class Config:
        orm_mode = True

class User(UserInDBBase):
    """
    Schema per un utente nelle risposte API.
    """
    pass

class UserInDB(UserInDBBase):
    """
    Schema per un utente nel database con password hash.
    """
    hashed_password: str
