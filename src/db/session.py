from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from src.core.config import settings

# Creazione dell'engine per il database
engine = create_async_engine(
    settings.DATABASE_URI,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
)

# Sessione asincrona per SQLAlchemy
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base per i modelli SQLAlchemy
Base = declarative_base()
