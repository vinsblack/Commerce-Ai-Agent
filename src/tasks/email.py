import logging
from typing import List, Dict, Any, Optional
from uuid import UUID

from jinja2 import Template
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.celery_app import celery_app
from src.core.config import settings
from src.db.session import SessionLocal
from src.models.customer import Customer
from src.models.email_template import EmailTemplate
from src.models.store import Store

logger = logging.getLogger(__name__)

async def render_template(template_str: str, context: Dict[str, Any]) -> str:
    """
    Renderizza un template con il contesto fornito.
    """
    template = Template(template_str)
    return template.render(**context)

async def send_email_async(
    recipient: str,
    subject: str,
    body: str,
    sender: str = None,
    sender_name: str = None,
) -> bool:
    """
    Invia un'email in modo asincrono.
    """
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    import aiosmtplib
    
    # Usa i valori predefiniti se non specificati
    sender = sender or settings.EMAIL_FROM
    sender_name = sender_name or settings.EMAIL_FROM_NAME
    
    # Crea il messaggio
    message = MIMEMultipart()
    message["From"] = f"{sender_name} <{sender}>"
    message["To"] = recipient
    message["Subject"] = subject
    
    # Aggiungi il corpo HTML
    message.attach(MIMEText(body, "html"))
    
    try:
        # Invia l'email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True,
        )
        logger.info(f"Email inviata a {recipient}")
        return True
    except Exception as e:
        logger.error(f"Errore nell'invio dell'email a {recipient}: {str(e)}")
        return False

@celery_app.task(name="src.tasks.email.send_email_task")
def send_email_task(
    template_id: str,
    store_id: str,
    customer_ids: Optional[List[str]] = None,
    email_addresses: Optional[List[str]] = None,
    context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Task per inviare email utilizzando un template.
    """
    async def _send_email():
        db = SessionLocal()
        try:
            # Recupera il template
            template = await db.query(EmailTemplate).filter(EmailTemplate.id == UUID(template_id)).first()
            if not template:
                logger.error(f"Template email {template_id} non trovato")
                return {"success": False, "error": "Template email non trovato"}
            
            # Recupera il negozio
            store = await db.query(Store).filter(Store.id == UUID(store_id)).first()
            if not store:
                logger.error(f"Negozio {store_id} non trovato")
                return {"success": False, "error": "Negozio non trovato"}
            
            # Prepara il contesto base
            base_context = {
                "store_name": store.name,
                "store_url": store.url,
                **(context or {})
            }
            
            # Recupera i clienti se sono stati specificati gli ID
            recipients = []
            if customer_ids:
                customers = await db.query(Customer).filter(
                    Customer.id.in_([UUID(cid) for cid in customer_ids]),
                    Customer.store_id == UUID(store_id)
                ).all()
                
                for customer in customers:
                    recipients.append({
                        "email": customer.email,
                        "context": {
                            **base_context,
                            "customer_name": f"{customer.first_name or ''} {customer.last_name or ''}".strip(),
                            "customer_email": customer.email,
                        }
                    })
            
            # Aggiungi gli indirizzi email specificati direttamente
            if email_addresses:
                for email in email_addresses:
                    recipients.append({
                        "email": email,
                        "context": {
                            **base_context,
                            "customer_name": "Cliente",
                            "customer_email": email,
                        }
                    })
            
            # Invia le email
            results = []
            for recipient in recipients:
                # Renderizza il template
                subject = await render_template(template.subject, recipient["context"])
                body = await render_template(template.body, recipient["context"])
                
                # Invia l'email
                success = await send_email_async(
                    recipient=recipient["email"],
                    subject=subject,
                    body=body,
                    sender=settings.EMAIL_FROM,
                    sender_name=f"{store.name} via CommerceAI",
                )
                
                results.append({
                    "email": recipient["email"],
                    "success": success,
                })
            
            return {
                "success": True,
                "total": len(results),
                "sent": sum(1 for r in results if r["success"]),
                "failed": sum(1 for r in results if not r["success"]),
                "results": results,
            }
        
        except Exception as e:
            logger.error(f"Errore nell'invio delle email: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_send_email())

@celery_app.task(name="src.tasks.email.send_newsletter_task")
def send_newsletter_task(
    template_id: str,
    store_id: str,
) -> Dict[str, Any]:
    """
    Task per inviare una newsletter a tutti i clienti che hanno accettato il marketing.
    """
    async def _send_newsletter():
        db = SessionLocal()
        try:
            # Recupera il template
            template = await db.query(EmailTemplate).filter(EmailTemplate.id == UUID(template_id)).first()
            if not template:
                logger.error(f"Template email {template_id} non trovato")
                return {"success": False, "error": "Template email non trovato"}
            
            # Recupera il negozio
            store = await db.query(Store).filter(Store.id == UUID(store_id)).first()
            if not store:
                logger.error(f"Negozio {store_id} non trovato")
                return {"success": False, "error": "Negozio non trovato"}
            
            # Recupera tutti i clienti che hanno accettato il marketing
            customers = await db.query(Customer).filter(
                Customer.store_id == UUID(store_id),
                Customer.accepts_marketing == True,
                Customer.is_active == True
            ).all()
            
            # Prepara il contesto base
            base_context = {
                "store_name": store.name,
                "store_url": store.url,
            }
            
            # Invia le email
            results = []
            for customer in customers:
                # Prepara il contesto specifico per il cliente
                context = {
                    **base_context,
                    "customer_name": f"{customer.first_name or ''} {customer.last_name or ''}".strip(),
                    "customer_email": customer.email,
                }
                
                # Renderizza il template
                subject = await render_template(template.subject, context)
                body = await render_template(template.body, context)
                
                # Invia l'email
                success = await send_email_async(
                    recipient=customer.email,
                    subject=subject,
                    body=body,
                    sender=settings.EMAIL_FROM,
                    sender_name=f"{store.name} via CommerceAI",
                )
                
                results.append({
                    "email": customer.email,
                    "success": success,
                })
            
            return {
                "success": True,
                "total": len(results),
                "sent": sum(1 for r in results if r["success"]),
                "failed": sum(1 for r in results if not r["success"]),
                "results": results,
            }
        
        except Exception as e:
            logger.error(f"Errore nell'invio della newsletter: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(_send_newsletter())
