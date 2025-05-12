from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user, get_current_active_superuser
from src.models.user import User
from src.schemas.user import User as UserSchema, UserCreate, UserUpdate
from src.utils.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Recupera tutti gli utenti.
    Solo per superuser.
    """
    users = await db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=UserSchema)
async def create_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Crea un nuovo utente.
    Solo per superuser.
    """
    user = await db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'email è già registrata nel sistema",
        )
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_superuser=user_in.is_superuser,
        is_active=user_in.is_active,
        subscription_plan=user_in.subscription_plan,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/me", response_model=UserSchema)
async def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera l'utente corrente.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Aggiorna i dati dell'utente corrente.
    """
    if user_in.password is not None:
        current_user.hashed_password = get_password_hash(user_in.password)
    
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    
    if user_in.email is not None:
        current_user.email = user_in.email
    
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserSchema)
async def read_user_by_id(
    user_id: UUID,
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Recupera un utente specifico tramite ID.
    Solo per superuser.
    """
    user = await db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato",
        )
    return user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: UUID,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Aggiorna un utente.
    Solo per superuser.
    """
    user = await db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato",
        )
    
    if user_in.password is not None:
        user.hashed_password = get_password_hash(user_in.password)
    
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    
    if user_in.email is not None:
        user.email = user_in.email
    
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    
    if user_in.is_superuser is not None:
        user.is_superuser = user_in.is_superuser
    
    if user_in.subscription_plan is not None:
        user.subscription_plan = user_in.subscription_plan
    
    await db.commit()
    await db.refresh(user)
    return user
