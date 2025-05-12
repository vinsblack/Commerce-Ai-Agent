import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from src.core.celery_app import celery_app
from src.db.session import SessionLocal
from src.models.product import Product
from src.models.store import Store
from src.models.order import Order
from src.agents.inventory.agent import inventory_agent

logger = logging.getLogger(__name__)

@celery_app.task(name="src.tasks.inventory.sync_inventory")
def sync_inventory() -> Dict[str, Any]:
    """
    Task periodico per sincronizzare l'inventario tra il database e i marketplace.
    """
    async def _sync_inventory():
        db = SessionLocal()
        try:
            # Recupera tutti i negozi attivi
            stores = await db.query(Store).filter(Store.is_active == True).all()
            
            results = []
            for store in stores:
                try:
                    # Recupera i prodotti del negozio
                    products = await db.query(Product).filter(Product.store_id == store.id).all()
                    
                    # Recupera i dati dal marketplace
                    marketplace_products = await _get_marketplace_products(store)
                    
                    # Aggiorna i prodotti nel database
                    updated_count = 0
                    for product in products:
                        marketplace_product = next(
                            (p for p in marketplace_products if p.get("sku") == product.sku),
                            None
                        )
                        
                        if marketplace_product and marketplace_product.get("quantity") != product.quantity:
                            product.quantity = marketplace_product.get("quantity")
                            updated_count += 1
                    
                    await db.commit()
                    
                    results.append({
                        "store_id": str(store.id),
                        "store_name": store.name,
                        "products_count": len(products),
                        "updated_count": updated_count,
                        "success": True,
                    })
                
                except Exception as e:
                    logger.error(f"Errore nella sincronizzazione dell'inventario per il negozio {store.id}: {str(e)}")
                    results.append({
                        "store_id": str(store.id),
                        "store_name": store.name,
                        "success": False,
                        "error": str(e),
                    })
            
            return {
                "success": True,
                "stores_count": len(stores),
                "results": results,
            }
        
        except Exception as e:
            logger.error(f"Errore nella sincronizzazione dell'inventario: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_sync_inventory())

async def _get_marketplace_products(store: Store) -> List[Dict[str, Any]]:
    """
    Recupera i prodotti dal marketplace.
    """
    # Implementazione specifica per ogni piattaforma
    if store.platform == "shopify":
        from src.integrations.shopify.client import ShopifyClient
        
        # Recupera le credenziali dal database
        credentials = store.settings.get("credentials", {})
        
        client = ShopifyClient(
            api_key=credentials.get("api_key"),
            api_secret=credentials.get("api_secret"),
            shop_url=credentials.get("shop_url"),
            access_token=credentials.get("access_token"),
        )
        
        products = client.get_products()
        
        # Mappa i prodotti al formato interno
        return [
            {
                "sku": product.get("variants", [{}])[0].get("sku"),
                "quantity": product.get("variants", [{}])[0].get("inventory_quantity", 0),
            }
            for product in products
            if product.get("variants") and product.get("variants")[0].get("sku")
        ]
    
    elif store.platform == "woocommerce":
        from src.integrations.woocommerce.client import WooCommerceClient
        
        # Recupera le credenziali dal database
        credentials = store.settings.get("credentials", {})
        
        client = WooCommerceClient(
            url=credentials.get("url"),
            consumer_key=credentials.get("consumer_key"),
            consumer_secret=credentials.get("consumer_secret"),
        )
        
        products = client.get_products()
        
        # Mappa i prodotti al formato interno
        return [
            {
                "sku": product.get("sku"),
                "quantity": product.get("stock_quantity", 0),
            }
            for product in products
            if product.get("sku")
        ]
    
    # Piattaforma non supportata
    return []

@celery_app.task(name="src.tasks.inventory.predict_demand")
def predict_demand(product_id: str, store_id: str, days_ahead: int = 30) -> Dict[str, Any]:
    """
    Task per prevedere la domanda futura per un prodotto.
    """
    async def _predict_demand():
        try:
            # Utilizza l'agente di inventario per prevedere la domanda
            result = await inventory_agent.predict_demand(
                product_id=product_id,
                store_id=store_id,
                days_ahead=days_ahead,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nella previsione della domanda: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_predict_demand())

@celery_app.task(name="src.tasks.inventory.recommend_restock")
def recommend_restock(store_id: str, threshold: int = 5) -> Dict[str, Any]:
    """
    Task per raccomandare prodotti da riordinare.
    """
    async def _recommend_restock():
        try:
            # Utilizza l'agente di inventario per raccomandare prodotti da riordinare
            result = await inventory_agent.recommend_restock(
                store_id=store_id,
                threshold=threshold,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nella raccomandazione dei prodotti da riordinare: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_recommend_restock())

@celery_app.task(name="src.tasks.inventory.optimize_inventory")
def optimize_inventory(store_id: str) -> Dict[str, Any]:
    """
    Task per ottimizzare i livelli di inventario.
    """
    async def _optimize_inventory():
        try:
            # Utilizza l'agente di inventario per ottimizzare l'inventario
            result = await inventory_agent.optimize_inventory(
                store_id=store_id,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nell'ottimizzazione dell'inventario: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_optimize_inventory())
