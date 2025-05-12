from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel

class ProductBase(BaseModel):
    """
    Schema base per i prodotti.
    """
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    quantity: Optional[int] = 0
    weight: Optional[float] = None
    weight_unit: Optional[str] = "kg"
    is_active: Optional[bool] = True
    is_digital: Optional[bool] = False
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None
    variants: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    """
    Schema per la creazione di un prodotto.
    """
    name: str
    price: float
    store_id: UUID

class ProductUpdate(ProductBase):
    """
    Schema per l'aggiornamento di un prodotto.
    """
    pass

class ProductInDBBase(ProductBase):
    """
    Schema per un prodotto nel database.
    """
    id: UUID
    store_id: UUID
    
    class Config:
        orm_mode = True

class Product(ProductInDBBase):
    """
    Schema per un prodotto nelle risposte API.
    """
    pass
