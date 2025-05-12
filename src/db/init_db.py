from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from src.core.config import settings
from src.db.session import engine, Base
from src.models.user import User
from src.models.subscription import Subscription
from src.models.integration import Integration
from src.models.store import Store
from src.models.product import Product
from src.models.order import Order
from src.models.customer import Customer
from src.models.email_template import EmailTemplate
from src.utils.security import get_password_hash

async def init_db(db: AsyncSession) -> None:
    """
    Inizializza il database creando le tabelle e inserendo i dati iniziali.
    """
    # Crea le tabelle se non esistono
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Verifica se esistono già utenti nel database
    result = await db.execute(text("SELECT COUNT(*) FROM users"))
    user_count = result.scalar()
    
    # Se non ci sono utenti, crea un superuser di default
    if user_count == 0:
        admin_user = User(
            email="admin@commerceai.example.com",
            hashed_password=get_password_hash("admin"),
            full_name="Admin User",
            is_superuser=True,
            is_active=True,
            subscription_plan="enterprise"
        )
        db.add(admin_user)
        
        # Crea un utente di test per ogni piano
        test_users = [
            User(
                email="free@example.com",
                hashed_password=get_password_hash("password"),
                full_name="Free User",
                is_superuser=False,
                is_active=True,
                subscription_plan="free"
            ),
            User(
                email="basic@example.com",
                hashed_password=get_password_hash("password"),
                full_name="Basic User",
                is_superuser=False,
                is_active=True,
                subscription_plan="basic"
            ),
            User(
                email="pro@example.com",
                hashed_password=get_password_hash("password"),
                full_name="Pro User",
                is_superuser=False,
                is_active=True,
                subscription_plan="pro"
            )
        ]
        for user in test_users:
            db.add(user)
        
        # Crea i piani di abbonamento
        subscriptions = [
            Subscription(
                name="free",
                display_name="Free",
                price=0,
                orders_limit=settings.FREE_PLAN_ORDERS_LIMIT,
                features=["Gestione email di base", "Integrazione con 1 marketplace", "Dashboard semplice"]
            ),
            Subscription(
                name="basic",
                display_name="Basic",
                price=29,
                orders_limit=settings.BASIC_PLAN_ORDERS_LIMIT,
                features=["Gestione email avanzata", "Integrazione con 2 marketplace", "Customer service base", "Analisi inventario"]
            ),
            Subscription(
                name="pro",
                display_name="Pro",
                price=99,
                orders_limit=settings.PRO_PLAN_ORDERS_LIMIT,
                features=["Tutte le funzionalità Basic", "Pricing dinamico", "Marketing automatico", "Integrazione con tutti i marketplace", "API completa"]
            ),
            Subscription(
                name="enterprise",
                display_name="Enterprise",
                price=299,
                orders_limit=0,  # Illimitato
                features=["Tutte le funzionalità Pro", "Ordini illimitati", "Supporto prioritario", "Personalizzazioni", "White-label"]
            )
        ]
        for subscription in subscriptions:
            db.add(subscription)
        
        # Crea alcuni template email di esempio
        email_templates = [
            EmailTemplate(
                name="welcome",
                subject="Benvenuto su {store_name}!",
                body="""
                <h1>Benvenuto su {store_name}!</h1>
                <p>Ciao {customer_name},</p>
                <p>Grazie per esserti registrato. Siamo felici di averti con noi!</p>
                <p>Cordiali saluti,<br>Il team di {store_name}</p>
                """
            ),
            EmailTemplate(
                name="order_confirmation",
                subject="Conferma ordine #{order_number}",
                body="""
                <h1>Grazie per il tuo ordine!</h1>
                <p>Ciao {customer_name},</p>
                <p>Abbiamo ricevuto il tuo ordine #{order_number} e lo stiamo elaborando.</p>
                <p>Dettagli dell'ordine:</p>
                <ul>
                    {order_items}
                </ul>
                <p>Totale: {order_total}</p>
                <p>Cordiali saluti,<br>Il team di {store_name}</p>
                """
            ),
            EmailTemplate(
                name="shipping_confirmation",
                subject="Il tuo ordine #{order_number} è stato spedito",
                body="""
                <h1>Il tuo ordine è in viaggio!</h1>
                <p>Ciao {customer_name},</p>
                <p>Il tuo ordine #{order_number} è stato spedito.</p>
                <p>Numero di tracciamento: {tracking_number}</p>
                <p>Puoi seguire la spedizione <a href="{tracking_url}">qui</a>.</p>
                <p>Cordiali saluti,<br>Il team di {store_name}</p>
                """
            ),
            EmailTemplate(
                name="abandoned_cart",
                subject="Hai dimenticato qualcosa nel carrello?",
                body="""
                <h1>Il tuo carrello ti aspetta!</h1>
                <p>Ciao {customer_name},</p>
                <p>Abbiamo notato che hai lasciato alcuni articoli nel tuo carrello.</p>
                <p>Ecco cosa c'è nel tuo carrello:</p>
                <ul>
                    {cart_items}
                </ul>
                <p><a href="{cart_url}">Completa il tuo acquisto</a></p>
                <p>Cordiali saluti,<br>Il team di {store_name}</p>
                """
            )
        ]
        for template in email_templates:
            db.add(template)
        
        await db.commit()
