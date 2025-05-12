from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr

class EmailTemplateBase(BaseModel):
    """
    Schema base per i template email.
    """
    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    is_active: Optional[bool] = True

class EmailTemplateCreate(EmailTemplateBase):
    """
    Schema per la creazione di un template email.
    """
    name: str
    subject: str
    body: str

class EmailTemplateUpdate(EmailTemplateBase):
    """
    Schema per l'aggiornamento di un template email.
    """
    pass

class EmailTemplateInDBBase(EmailTemplateBase):
    """
    Schema per un template email nel database.
    """
    id: UUID
    
    class Config:
        orm_mode = True

class EmailTemplate(EmailTemplateInDBBase):
    """
    Schema per un template email nelle risposte API.
    """
    pass

class EmailSend(BaseModel):
    """
    Schema per l'invio di un'email.
    """
    template_id: UUID
    store_id: UUID
    customer_ids: Optional[List[UUID]] = None
    email_addresses: Optional[List[EmailStr]] = None
    context: Optional[Dict[str, Any]] = None
