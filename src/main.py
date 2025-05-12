from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from src.api.routes import api_router
from src.core.config import settings
from src.core.dependencies import get_db
from src.db.init_db import init_db

app = FastAPI(
    title="CommerceAI Agent",
    description="Sistema di agenti AI per l'automazione e ottimizzazione delle operazioni di e-commerce",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware per le sessioni
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY
)

# Inclusione dei router API
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
async def startup_event():
    """
    Inizializzazione all'avvio dell'applicazione.
    """
    # Inizializza il database se necessario
    db = next(get_db())
    await init_db(db)

@app.get("/")
async def root():
    """
    Endpoint di base per verificare che l'API sia in esecuzione.
    """
    return {
        "name": "CommerceAI Agent API",
        "version": "0.1.0",
        "status": "online",
        "docs": f"{settings.API_PREFIX}/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS
    )
