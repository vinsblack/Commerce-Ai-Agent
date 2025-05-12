from fastapi import APIRouter

from src.api.endpoints import auth, users, stores, products, orders, customers, email, integrations

# Router principale per le API
api_router = APIRouter()

# Inclusione dei router specifici
api_router.include_router(auth.router, prefix="/auth", tags=["autenticazione"])
api_router.include_router(users.router, prefix="/users", tags=["utenti"])
api_router.include_router(stores.router, prefix="/stores", tags=["negozi"])
api_router.include_router(products.router, prefix="/products", tags=["prodotti"])
api_router.include_router(orders.router, prefix="/orders", tags=["ordini"])
api_router.include_router(customers.router, prefix="/customers", tags=["clienti"])
api_router.include_router(email.router, prefix="/email", tags=["email"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrazioni"])
