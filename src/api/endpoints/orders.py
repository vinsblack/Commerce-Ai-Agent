from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.models.order import Order
from src.models.store import Store
from src.models.user import User
from src.schemas.order import Order as OrderSchema, OrderCreate, OrderUpdate

router = APIRouter()

@router.get("/", response_model=List[OrderSchema])
async def read_orders(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    store_id: UUID = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera tutti gli ordini dell'utente corrente.
    Filtra per store_id se specificato.
    """
    query = db.query(Order).join(Store).filter(Store.owner_id == current_user.id)
    
    if store_id:
        query = query.filter(Order.store_id == store_id)
    
    orders = await query.offset(skip).limit(limit).all()
    return orders

@router.post("/", response_model=OrderSchema)
async def create_order(
    *,
    db: AsyncSession = Depends(get_db),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Crea un nuovo ordine.
    """
    # Verifica che il negozio appartenga all'utente corrente
    store = await db.query(Store).filter(Store.id == order_in.store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato o non autorizzato",
        )
    
    order = Order(**order_in.dict())
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order

@router.get("/{order_id}", response_model=OrderSchema)
async def read_order(
    *,
    db: AsyncSession = Depends(get_db),
    order_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera un ordine specifico tramite ID.
    """
    order = await db.query(Order).join(Store).filter(
        Order.id == order_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ordine non trovato",
        )
    return order

@router.put("/{order_id}", response_model=OrderSchema)
async def update_order(
    *,
    db: AsyncSession = Depends(get_db),
    order_id: UUID,
    order_in: OrderUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Aggiorna un ordine.
    """
    order = await db.query(Order).join(Store).filter(
        Order.id == order_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ordine non trovato",
        )
    
    update_data = order_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    await db.commit()
    await db.refresh(order)
    return order

@router.delete("/{order_id}", response_model=OrderSchema)
async def delete_order(
    *,
    db: AsyncSession = Depends(get_db),
    order_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Elimina un ordine.
    """
    order = await db.query(Order).join(Store).filter(
        Order.id == order_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ordine non trovato",
        )
    
    await db.delete(order)
    await db.commit()
    return order
