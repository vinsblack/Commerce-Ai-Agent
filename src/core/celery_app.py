from celery import Celery
from src.core.config import settings

# Configurazione dell'app Celery
celery_app = Celery(
    "commerce_ai_worker",
    broker=settings.RABBITMQ_URI,
    backend=settings.REDIS_URI,
    include=[
        "src.tasks.email",
        "src.tasks.inventory",
        "src.tasks.pricing",
        "src.tasks.marketing",
        "src.tasks.customer_service",
    ]
)

# Configurazione delle impostazioni di Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_track_started=True,
)

# Configurazione delle code di task
celery_app.conf.task_routes = {
    "src.tasks.email.*": {"queue": "email"},
    "src.tasks.inventory.*": {"queue": "inventory"},
    "src.tasks.pricing.*": {"queue": "pricing"},
    "src.tasks.marketing.*": {"queue": "marketing"},
    "src.tasks.customer_service.*": {"queue": "customer_service"},
}

# Configurazione dei task periodici
celery_app.conf.beat_schedule = {
    "sync-inventory-every-hour": {
        "task": "src.tasks.inventory.sync_inventory",
        "schedule": 3600.0,
    },
    "update-pricing-every-day": {
        "task": "src.tasks.pricing.update_dynamic_pricing",
        "schedule": 86400.0,
    },
    "send-marketing-emails-weekly": {
        "task": "src.tasks.marketing.send_weekly_newsletter",
        "schedule": 604800.0,
    },
}

if __name__ == "__main__":
    celery_app.start()
