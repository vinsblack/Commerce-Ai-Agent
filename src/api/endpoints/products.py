from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.models.product import Product
from src.models.store import Store
from src.models.user import User
from src.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
async def read_products(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    store_id: UUID = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera tutti i prodotti dell'utente corrente.
    Filtra per store_id se specificato.
    """
    query = db.query(Product).join(Store).filter(Store.owner_id == current_user.id)
    
    if store_id:
        query = query.filter(Product.store_id == store_id)
    
    products = await query.offset(skip).limit(limit).all()
    return products

@router.post("/", response_model=ProductSchema)
async def create_product(
    *,
    db: AsyncSession = Depends(get_db),
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Crea un nuovo prodotto.
    """
    # Verifica che il negozio appartenga all'utente corrente
    store = await db.query(Store).filter(Store.id == product_in.store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato o non autorizzato",
        )
    
    product = Product(**product_in.dict())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.get("/{product_id}", response_model=ProductSchema)
async def read_product(
    *,
    db: AsyncSession = Depends(get_db),
    product_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera un prodotto specifico tramite ID.
    """
    product = await db.query(Product).join(Store).filter(
        Product.id == product_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prodotto non trovato",
        )
    return product

@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    *,
    db: AsyncSession = Depends(get_db),
    product_id: UUID,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Aggiorna un prodotto.
    """
    product = await db.query(Product).join(Store).filter(
        Product.id == product_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prodotto non trovato",
        )
    
    update_data = product_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", response_model=ProductSchema)
async def delete_product(
    *,
    db: AsyncSession = Depends(get_db),
    product_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Elimina un prodotto.
    """
    product = await db.query(Product).join(Store).filter(
        Product.id == product_id,
        Store.owner_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prodotto non trovato",
        )
    
    await db.delete(product)
    await db.commit()
    return product
