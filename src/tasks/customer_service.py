import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from src.core.celery_app import celery_app
from src.db.session import SessionLocal
from src.models.store import Store
from src.models.customer import Customer
from src.models.order import Order
from src.agents.customer_service.agent import customer_service_agent

logger = logging.getLogger(__name__)

@celery_app.task(name="src.tasks.customer_service.answer_query")
def answer_query(query: str, customer_id: Optional[str] = None, store_id: str = None, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Task per rispondere a una domanda di un cliente.
    """
    async def _answer_query():
        try:
            # Utilizza l'agente di servizio clienti per rispondere alla domanda
            result = await customer_service_agent.answer_query(
                query=query,
                customer_id=customer_id,
                store_id=store_id,
                context=context,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nella risposta alla domanda: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_answer_query())

@celery_app.task(name="src.tasks.customer_service.handle_complaint")
def handle_complaint(complaint: str, customer_id: str, order_id: Optional[str] = None, store_id: str = None) -> Dict[str, Any]:
    """
    Task per gestire un reclamo di un cliente.
    """
    async def _handle_complaint():
        db = SessionLocal()
        try:
            # Recupera informazioni aggiuntive dal database
            customer = None
            order = None
            
            if customer_id:
                customer = await db.query(Customer).filter(Customer.id == customer_id).first()
            
            if order_id:
                order = await db.query(Order).filter(Order.id == order_id).first()
            
            # Utilizza l'agente di servizio clienti per gestire il reclamo
            result = await customer_service_agent.handle_complaint(
                complaint=complaint,
                customer_id=customer_id,
                order_id=order_id,
                store_id=store_id,
            )
            
            # Se il reclamo è stato gestito con successo, aggiorna lo stato dell'ordine se necessario
            if result.get("success") and order and result.get("actions", {}).get("update_order_status"):
                new_status = result["actions"]["update_order_status"]
                order.status = new_status
                await db.commit()
            
            return result
        except Exception as e:
            logger.error(f"Errore nella gestione del reclamo: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_handle_complaint())

@celery_app.task(name="src.tasks.customer_service.generate_response")
def generate_response(message: str, customer_id: str, store_id: str, tone: str = "professional") -> Dict[str, Any]:
    """
    Task per generare una risposta personalizzata a un messaggio del cliente.
    """
    async def _generate_response():
        try:
            # Utilizza l'agente di servizio clienti per generare una risposta
            result = await customer_service_agent.generate_response(
                message=message,
                customer_id=customer_id,
                store_id=store_id,
                tone=tone,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nella generazione della risposta: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_generate_response())

@celery_app.task(name="src.tasks.customer_service.analyze_sentiment")
def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Task per analizzare il sentiment di un testo.
    """
    async def _analyze_sentiment():
        try:
            # Utilizza l'agente di servizio clienti per analizzare il sentiment
            result = await customer_service_agent.analyze_sentiment(
                text=text,
            )
            
            return result
        except Exception as e:
            logger.error(f"Errore nell'analisi del sentiment: {str(e)}")
            return {"success": False, "error": str(e)}
    
    import asyncio
    return asyncio.run(_analyze_sentiment())

@celery_app.task(name="src.tasks.customer_service.process_customer_feedback")
def process_customer_feedback() -> Dict[str, Any]:
    """
    Task periodico per elaborare i feedback dei clienti e identificare tendenze.
    """
    async def _process_customer_feedback():
        db = SessionLocal()
        try:
            # Recupera tutti i negozi attivi
            stores = await db.query(Store).filter(Store.is_active == True).all()
            
            results = []
            for store in stores:
                try:
                    # Recupera gli ordini recenti con feedback
                    recent_orders = await db.query(Order).filter(
                        Order.store_id == store.id,
                        Order.metadata.has_key("customer_feedback"),
                        Order.created_at >= datetime.now() - timedelta(days=30)
                    ).all()
                    
                    if not recent_orders:
                        results.append({
                            "store_id": str(store.id),
                            "store_name": store.name,
                            "success": True,
                            "message": "Nessun feedback recente trovato",
                        })
                        continue
                    
                    # Analizza i feedback
                    feedback_texts = [order.metadata.get("customer_feedback", "") for order in recent_orders]
                    
                    sentiment_results = []
                    for text in feedback_texts:
                        sentiment_result = await customer_service_agent.analyze_sentiment(text)
                        if sentiment_result.get("success"):
                            sentiment_results.append(sentiment_result)
                    
                    # Calcola statistiche aggregate
                    if sentiment_results:
                        avg_sentiment = sum(r.get("sentiment_score", 0) for r in sentiment_results) / len(sentiment_results)
                        positive_count = sum(1 for r in sentiment_results if r.get("sentiment", "") == "positive")
                        negative_count = sum(1 for r in sentiment_results if r.get("sentiment", "") == "negative")
                        neutral_count = sum(1 for r in sentiment_results if r.get("sentiment", "") == "neutral")
                        
                        results.append({
                            "store_id": str(store.id),
                            "store_name": store.name,
                            "feedback_count": len(feedback_texts),
                            "avg_sentiment_score": avg_sentiment,
                            "positive_count": positive_count,
                            "negative_count": negative_count,
                            "neutral_count": neutral_count,
                            "success": True,
                        })
                    else:
                        results.append({
                            "store_id": str(store.id),
                            "store_name": store.name,
                            "success": False,
                            "error": "Errore nell'analisi del sentiment",
                        })
                
                except Exception as e:
                    logger.error(f"Errore nell'elaborazione dei feedback per il negozio {store.id}: {str(e)}")
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
            logger.error(f"Errore nell'elaborazione dei feedback dei clienti: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_process_customer_feedback())
