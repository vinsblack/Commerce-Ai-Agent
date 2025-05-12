from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError

from src.core.config import settings
from src.db.session import SessionLocal
from src.models.user import User
from src.schemas.token import TokenPayload

# OAuth2 scheme per l'autenticazione
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")

async def get_db() -> Generator:
    """
    Dependency per ottenere una sessione del database.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependency per ottenere l'utente corrente dal token JWT.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await db.query(User).filter(User.id == token_data.sub).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utente inattivo"
        )
    
    return user

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency per verificare che l'utente corrente sia un superuser.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permessi insufficienti"
        )
    
    return current_user

def check_subscription_plan(required_plan: str):
    """
    Dependency factory per verificare il piano di abbonamento dell'utente.
    """
    async def _check_subscription_plan(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.subscription_plan != required_plan and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Questa funzionalità richiede il piano {required_plan}"
            )
        return current_user
    
    return _check_subscription_plan
