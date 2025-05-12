from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from src.models.order import OrderStatus

class OrderBase(BaseModel):
    """
    Schema base per gli ordini.
    """
    order_number: Optional[str] = None
    status: Optional[OrderStatus] = OrderStatus.PENDING
    total_price: Optional[float] = None
    subtotal: Optional[float] = None
    shipping_price: Optional[float] = 0
    tax_price: Optional[float] = 0
    discount_price: Optional[float] = 0
    currency: Optional[str] = "EUR"
    shipping_address: Optional[Dict[str, Any]] = None
    billing_address: Optional[Dict[str, Any]] = None
    payment_method: Optional[str] = None
    shipping_method: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None

class OrderCreate(OrderBase):
    """
    Schema per la creazione di un ordine.
    """
    order_number: str
    total_price: float
    subtotal: float
    items: List[Dict[str, Any]]
    store_id: UUID
    customer_id: UUID

class OrderUpdate(OrderBase):
    """
    Schema per l'aggiornamento di un ordine.
    """
    pass

class OrderInDBBase(OrderBase):
    """
    Schema per un ordine nel database.
    """
    id: UUID
    store_id: UUID
    customer_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Order(OrderInDBBase):
    """
    Schema per un ordine nelle risposte API.
    """
    pass
