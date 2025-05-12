from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.dependencies import get_db
from src.models.user import User
from src.schemas.token import Token
from src.utils.security import authenticate_user, create_access_token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Ottieni un token JWT per l'accesso.
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o password non corretti",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    return {
        "access_token": create_access_token(
            subject=str(user.id), expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=Token)
async def register_user(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Registra un nuovo utente e ottieni un token JWT.
    """
    # Verifica se l'utente esiste già
    user = await db.query(User).filter(User.email == form_data.username).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email già registrata",
        )
    
    # Crea un nuovo utente
    from src.utils.security import get_password_hash
    new_user = User(
        email=form_data.username,
        hashed_password=get_password_hash(form_data.password),
        is_active=True,
        subscription_plan="free"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Genera il token
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    return {
        "access_token": create_access_token(
            subject=str(new_user.id), expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
