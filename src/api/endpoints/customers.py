from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.models.customer import Customer
from src.models.store import Store
from src.models.user import User
from src.schemas.customer import Customer as CustomerSchema, CustomerCreate, CustomerUpdate

router = APIRouter()

@router.get("/", response_model=List[CustomerSchema])
async def read_customers(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    store_id: UUID = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera tutti i clienti dell'utente corrente.
    Filtra per store_id se specificato.
    """
    query = db.query(Customer).join(Store).filter(Store.owner_id == current_user.id)
    
    if store_id:
        query = query.filter(Customer.store_id == store_id)
    
    customers = await query.offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=CustomerSchema)
async def create_customer(
    *,
    db: AsyncSession = Depends(get_db),
    customer_in: CustomerCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Crea un nuovo cliente.
    """
    # Verifica che il negozio appartenga all'utente corrente
    store = await db.query(Store).filter(Store.id == customer_in.store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato o non autorizzato",
        )
    
    customer = Customer(**customer_in.dict())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerSchema)
async def read_customer(
    *,
    db: AsyncSession = Depends(get_db),
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera un cliente specifico tramite ID.
    """
    customer = await db.query(Customer).join(Store).filter(
        Customer.id == customer_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente non trovato",
        )
    return customer

@router.put("/{customer_id}", response_model=CustomerSchema)
async def update_customer(
    *,
    db: AsyncSession = Depends(get_db),
    customer_id: UUID,
    customer_in: CustomerUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Aggiorna un cliente.
    """
    customer = await db.query(Customer).join(Store).filter(
        Customer.id == customer_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente non trovato",
        )
    
    update_data = customer_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    await db.commit()
    await db.refresh(customer)
    return customer

@router.delete("/{customer_id}", response_model=CustomerSchema)
async def delete_customer(
    *,
    db: AsyncSession = Depends(get_db),
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Elimina un cliente.
    """
    customer = await db.query(Customer).join(Store).filter(
        Customer.id == customer_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente non trovato",
        )
    
    await db.delete(customer)
    await db.commit()
    return customer
