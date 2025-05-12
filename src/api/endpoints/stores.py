from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.models.store import Store
from src.models.user import User
from src.schemas.store import Store as StoreSchema, StoreCreate, StoreUpdate

router = APIRouter()

@router.get("/", response_model=List[StoreSchema])
async def read_stores(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera tutti i negozi dell'utente corrente.
    """
    stores = await db.query(Store).filter(Store.owner_id == current_user.id).offset(skip).limit(limit).all()
    return stores

@router.post("/", response_model=StoreSchema)
async def create_store(
    *,
    db: AsyncSession = Depends(get_db),
    store_in: StoreCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Crea un nuovo negozio per l'utente corrente.
    """
    store = Store(
        **store_in.dict(),
        owner_id=current_user.id,
    )
    db.add(store)
    await db.commit()
    await db.refresh(store)
    return store

@router.get("/{store_id}", response_model=StoreSchema)
async def read_store(
    *,
    db: AsyncSession = Depends(get_db),
    store_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera un negozio specifico tramite ID.
    """
    store = await db.query(Store).filter(Store.id == store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato",
        )
    return store

@router.put("/{store_id}", response_model=StoreSchema)
async def update_store(
    *,
    db: AsyncSession = Depends(get_db),
    store_id: UUID,
    store_in: StoreUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Aggiorna un negozio.
    """
    store = await db.query(Store).filter(Store.id == store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato",
        )
    
    update_data = store_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(store, field, value)
    
    await db.commit()
    await db.refresh(store)
    return store

@router.delete("/{store_id}", response_model=StoreSchema)
async def delete_store(
    *,
    db: AsyncSession = Depends(get_db),
    store_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Elimina un negozio.
    """
    store = await db.query(Store).filter(Store.id == store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato",
        )
    
    await db.delete(store)
    await db.commit()
    return store
