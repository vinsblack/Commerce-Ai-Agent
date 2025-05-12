from sqlalchemy import Column, String, Integer, Float
from sqlalchemy.dialects.postgresql import ARRAY

from src.models.base import BaseModel

class Subscription(BaseModel):
    """
    Modello per i piani di abbonamento.
    """
    name = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    orders_limit = Column(Integer, nullable=False)  # 0 significa illimitato
    features = Column(ARRAY(String), nullable=False)
    
    def __repr__(self):
        return f"<Subscription {self.name}>"
