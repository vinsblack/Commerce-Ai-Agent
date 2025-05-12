import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from src.core.celery_app import celery_app
from src.db.session import SessionLocal
from src.models.product import Product
from src.models.store import Store
from src.models.customer import Customer
from src.agents.marketing.agent import marketing_agent

logger = logging.getLogger(__name__)

@celery_app.task(name="src.tasks.marketing.send_weekly_newsletter")
def send_weekly_newsletter() -> Dict[str, Any]:
    """
    Task periodico per inviare newsletter settimanali.
    """
    async def _send_weekly_newsletter():
        db = SessionLocal()
        try:
            # Recupera tutti i negozi attivi con newsletter abilitate
            stores = await db.query(Store).filter(
                Store.is_active == True,
                Store.settings.has_key("newsletter_enabled"),
                Store.settings["newsletter_enabled"].astext == "true"
            ).all()
            
            results = []
            for store in stores:
                try:
                    # Verifica se è il giorno della settimana configurato per l'invio
                    newsletter_day = store.settings.get("newsletter_day", "monday").lower()
                    current_day = datetime.now().strftime("%A").lower()
                    
                    if current_day != newsletter_day:
                        continue
                    
                    # Recupera i clienti che hanno accettato il marketing
                    customers = await db.query(Customer).filter(
                        Customer.store_id == store.id,
                        Customer.is_active == True,
                        Customer.accepts_marketing == True
                    ).all()
                    
                    if not customers:
                        results.append({
                            "store_id": str(store.id),
                            "store_name": store.name,
                            "success": True,
                            "message": "Nessun cliente ha accettato il marketing",
                        })
                        continue
                    
                    # Genera il contenuto della newsletter
                    newsletter_content = await _generate_newsletter_content(store)
                    
                    # Invia la newsletter
                    from src.tasks.email import send_email_task
                    
                    email_result = send_email_task(
                        template_id=store.settings.get("newsletter_template_id"),
                        store_id=str(store.id),
                        customer_ids=[str(customer.id) for customer in customers],
                        context={
                            "newsletter_content": newsletter_content,
                            "current_date": datetime.now().strftime("%d/%m/%Y"),
                        }
                    )
                    
                    results.append({
                        "store_id": str(store.id),
                        "store_name": store.name,
                        "customers_count": len(customers),
                        "success": email_result.get("success", False),
                        "email_result": email_result,
                    })
                
                except Exception as e:
                    logger.error(f"Errore nell'invio della newsletter per il negozio {store.id}: {str(e)}")
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
            logger.error(f"Errore nell'invio delle newsletter settimanali: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_send_weekly_newsletter())

async def _generate_newsletter_content(store: Store) -> Dict[str, Any]:
    """
    Genera il contenuto della newsletter per un negozio.
    """
    try:
        # Utilizza l'agente di marketing per generare contenuti
        campaign_result = await marketing_agent.generate_campaign(
            store_id=str(store.id),
            objective="engagement",
        )
        
        return {
            "title": campaign_result.get("title", f"Newsletter settimanale di {store.name}"),
            "intro": campaign_result.get("intro", f"Scopri le ultime novità da {store.name}"),
            "content": campaign_result.get("content", ""),
            "cta": campaign_result.get("cta", "Visita il nostro negozio"),
            "cta_url": store.url or "#",
        }
    except Exception as e:
        logger.error(f"Errore nella generazione del contenuto della newsletter: {str(e)}")
        return {
            "title": f"Newsletter settimanale di {store.name}",
            "intro": f"Scopri le ultime novità da {store.name}",
            "content": "Grazie per essere iscritto alla nostra newsletter!",
            "cta": "Visita il nostro negozio",
            "cta_url": store.url or "#",
        }

@celery_app.task(name="src.tasks.marketing.generate_product_descriptions")
def generate_product_descriptions(store_id: str, tone: str = "professional") -> Dict[str, Any]:
    """
    Task per generare descrizioni ottimizzate per tutti i prodotti di un negozio.
    """
    async def _generate_product_descriptions():
        db = SessionLocal()
        try:
            # Recupera il negozio
            store = await db.query(Store).filter(Store.id == store_id).first()
            if not store:
                return {"success": False, "error": "Negozio non trovato"}
            
            # Recupera i prodotti del negozio
            products = await db.query(Product).filter(Product.store_id == store.id).all()
            
            results = []
            for product in products:
                try:
                    # Genera la descrizione del prodotto
                    description_result = await marketing_agent.generate_product_description(
                        product_id=str(product.id),
                        store_id=str(store.id),
                        tone=tone,
                    )
                    
                    if description_result.get("success") and "description" in description_result:
                        # Aggiorna la descrizione del prodotto
                        product.description = description_result["description"]
                        
                        results.append({
                            "product_id": str(product.id),
                            "product_name": product.name,
                            "success": True,
                        })
                    else:
                        results.append({
                            "product_id": str(product.id),
                            "product_name": product.name,
                            "success": False,
                            "error": "Errore nella generazione della descrizione",
                        })
                except Exception as e:
                    logger.error(f"Errore nella generazione della descrizione per il prodotto {product.id}: {str(e)}")
                    results.append({
                        "product_id": str(product.id),
                        "product_name": product.name,
                        "success": False,
                        "error": str(e),
                    })
            
            await db.commit()
            
            return {
                "success": True,
                "products_count": len(products),
                "updated_count": sum(1 for r in results if r["success"]),
                "results": results,
            }
        
        except Exception as e:
            logger.error(f"Errore nella generazione delle descrizioni dei prodotti: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_generate_product_descriptions())

@celery_app.task(name="src.tasks.marketing.generate_social_posts")
def generate_social_posts(store_id: str, platform: str = "instagram", count: int = 5) -> Dict[str, Any]:
    """
    Task per generare post per i social media.
    """
    async def _generate_social_posts():
        db = SessionLocal()
        try:
            # Recupera il negozio
            store = await db.query(Store).filter(Store.id == store_id).first()
            if not store:
                return {"success": False, "error": "Negozio non trovato"}
            
            # Recupera i prodotti in evidenza del negozio
            featured_products = await db.query(Product).filter(
                Product.store_id == store.id,
                Product.tags.contains(["featured"])
            ).limit(count).all()
            
            posts = []
            for product in featured_products:
                try:
                    # Genera un post per il prodotto
                    post_result = await marketing_agent.generate_social_post(
                        product_id=str(product.id),
                        store_id=str(store.id),
                        platform=platform,
                        objective="sales",
                    )
                    
                    if post_result.get("success") and "content" in post_result:
                        posts.append({
                            "product_id": str(product.id),
                            "product_name": product.name,
                            "platform": platform,
                            "content": post_result["content"],
                            "hashtags": post_result.get("hashtags", []),
                            "image_url": product.images[0] if product.images else None,
                        })
                except Exception as e:
                    logger.error(f"Errore nella generazione del post per il prodotto {product.id}: {str(e)}")
            
            # Genera post generici se non ci sono abbastanza prodotti in evidenza
            if len(posts) < count:
                try:
                    for i in range(count - len(posts)):
                        post_result = await marketing_agent.generate_social_post(
                            store_id=str(store.id),
                            platform=platform,
                            objective="engagement",
                        )
                        
                        if post_result.get("success") and "content" in post_result:
                            posts.append({
                                "platform": platform,
                                "content": post_result["content"],
                                "hashtags": post_result.get("hashtags", []),
                            })
                except Exception as e:
                    logger.error(f"Errore nella generazione del post generico: {str(e)}")
            
            return {
                "success": True,
                "posts_count": len(posts),
                "posts": posts,
            }
        
        except Exception as e:
            logger.error(f"Errore nella generazione dei post per i social media: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_generate_social_posts())
