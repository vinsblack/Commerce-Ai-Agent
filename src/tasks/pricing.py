import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from src.core.celery_app import celery_app
from src.db.session import SessionLocal
from src.models.product import Product
from src.models.store import Store
from src.agents.pricing.agent import pricing_agent

logger = logging.getLogger(__name__)

@celery_app.task(name="src.tasks.pricing.update_dynamic_pricing")
def update_dynamic_pricing() -> Dict[str, Any]:
    """
    Task periodico per aggiornare i prezzi dinamici dei prodotti.
    """
    async def _update_dynamic_pricing():
        db = SessionLocal()
        try:
            # Recupera tutti i negozi attivi con pricing dinamico abilitato
            stores = await db.query(Store).filter(
                Store.is_active == True,
                Store.settings.has_key("dynamic_pricing_enabled"),
                Store.settings["dynamic_pricing_enabled"].astext == "true"
            ).all()
            
            results = []
            for store in stores:
                try:
                    # Recupera i prodotti del negozio
                    products = await db.query(Product).filter(Product.store_id == store.id).all()
                    
                    # Aggiorna i prezzi dei prodotti
                    updated_count = 0
                    for product in products:
                        try:
                            # Ottimizza il prezzo utilizzando l'agente di pricing
                            optimization_result = await pricing_agent.optimize_price(
                                product_id=str(product.id),
                                store_id=str(store.id),
                            )
                            
                            if optimization_result.get("success") and "optimized_price" in optimization_result:
                                optimized_price = optimization_result["optimized_price"]
                                
                                # Aggiorna il prezzo solo se è cambiato significativamente
                                price_change_threshold = store.settings.get("price_change_threshold", 0.05)
                                price_change_ratio = abs(optimized_price - product.price) / product.price
                                
                                if price_change_ratio > price_change_threshold:
                                    product.compare_at_price = product.price
                                    product.price = optimized_price
                                    updated_count += 1
                        except Exception as e:
                            logger.error(f"Errore nell'ottimizzazione del prezzo per il prodotto {product.id}: {str(e)}")
                    
                    await db.commit()
                    
                    results.append({
                        "store_id": str(store.id),
                        "store_name": store.name,
                        "products_count": len(products),
                        "updated_count": updated_count,
                        "success": True,
                    })
                
                except Exception as e:
                    logger.error(f"Errore nell'aggiornamento dei prezzi per il negozio {store.id}: {str(e)}")
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
            logger.error(f"Errore nell'aggiornamento dei prezzi dinamici: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_update_dynamic_pricing())

@celery_app.task(name="src.tasks.pricing.analyze_competition")
def analyze_competition(product_id: str, store_id: str) -> Dict[str, Any]:
    """
    Task per analizzare i prezzi della concorrenza per un prodotto.
    """
    async def _analyze_competition():
        try:
            # Utilizza l'agente di pricing per analizzare la concorrenza
            result = await pricing_agent.analyze_competition(
                product_id=product_id,
                store_id=store_id,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nell'analisi della concorrenza: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_analyze_competition())

@celery_app.task(name="src.tasks.pricing.recommend_promotions")
def recommend_promotions(store_id: str, target: str = "revenue") -> Dict[str, Any]:
    """
    Task per raccomandare promozioni e sconti.
    """
    async def _recommend_promotions():
        try:
            # Utilizza l'agente di pricing per raccomandare promozioni
            result = await pricing_agent.recommend_promotions(
                store_id=store_id,
                target=target,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nella raccomandazione delle promozioni: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_recommend_promotions())

@celery_app.task(name="src.tasks.pricing.forecast_impact")
def forecast_impact(product_id: str, store_id: str, new_price: float) -> Dict[str, Any]:
    """
    Task per prevedere l'impatto di un cambio di prezzo sulle vendite.
    """
    async def _forecast_impact():
        try:
            # Utilizza l'agente di pricing per prevedere l'impatto
            result = await pricing_agent.forecast_impact(
                product_id=product_id,
                store_id=store_id,
                new_price=new_price,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nella previsione dell'impatto del cambio di prezzo: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_forecast_impact())
