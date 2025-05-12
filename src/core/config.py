import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Configurazioni dell'applicazione caricate dalle variabili d'ambiente.
    """
    # Configurazione Generale
    ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str
    API_PREFIX: str = "/api/v1"
    
    # Configurazione Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    
    # Database
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    DB_SCHEMA: str = "public"
    DATABASE_URI: str = None
    
    @validator("DATABASE_URI", pre=True)
    def assemble_db_uri(cls, v, values):
        if v:
            return v
        return f"postgresql://{values.get('DB_USER')}:{values.get('DB_PASSWORD')}@{values.get('DB_HOST')}:{values.get('DB_PORT')}/{values.get('DB_NAME')}"
    
    # Redis
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_URI: str = None
    
    @validator("REDIS_URI", pre=True)
    def assemble_redis_uri(cls, v, values):
        if v:
            return v
        password_part = f":{values.get('REDIS_PASSWORD')}@" if values.get('REDIS_PASSWORD') else "@"
        return f"redis://{password_part}{values.get('REDIS_HOST')}:{values.get('REDIS_PORT')}/{values.get('REDIS_DB')}"
    
    # RabbitMQ
    RABBITMQ_HOST: str
    RABBITMQ_PORT: int
    RABBITMQ_USER: str
    RABBITMQ_PASSWORD: str
    RABBITMQ_VHOST: str = "/"
    RABBITMQ_URI: str = None
    
    @validator("RABBITMQ_URI", pre=True)
    def assemble_rabbitmq_uri(cls, v, values):
        if v:
            return v
        return f"amqp://{values.get('RABBITMQ_USER')}:{values.get('RABBITMQ_PASSWORD')}@{values.get('RABBITMQ_HOST')}:{values.get('RABBITMQ_PORT')}/{values.get('RABBITMQ_VHOST')}"
    
    # AI/LLM
    OPENAI_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""
    MCP_ENABLED: bool = True
    MCP_SERVER_URL: str = "http://localhost:8080"
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    EMAIL_FROM: str
    EMAIL_FROM_NAME: str
    
    # Sicurezza
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60
    CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    # Piani e Limiti
    FREE_PLAN_ORDERS_LIMIT: int = 100
    BASIC_PLAN_ORDERS_LIMIT: int = 1000
    PRO_PLAN_ORDERS_LIMIT: int = 10000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Istanza delle impostazioni
settings = Settings()
