from typing import Any, List, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user, check_subscription_plan
from src.models.email_template import EmailTemplate
from src.models.user import User
from src.models.customer import Customer
from src.models.store import Store
from src.schemas.email import EmailTemplate as EmailTemplateSchema, EmailTemplateCreate, EmailTemplateUpdate, EmailSend

router = APIRouter()

@router.get("/templates", response_model=List[EmailTemplateSchema])
async def read_email_templates(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera tutti i template email disponibili.
    """
    templates = await db.query(EmailTemplate).offset(skip).limit(limit).all()
    return templates

@router.post("/templates", response_model=EmailTemplateSchema)
async def create_email_template(
    *,
    db: AsyncSession = Depends(get_db),
    template_in: EmailTemplateCreate,
    current_user: User = Depends(check_subscription_plan("basic")),
) -> Any:
    """
    Crea un nuovo template email.
    Richiede almeno il piano Basic.
    """
    template = EmailTemplate(**template_in.dict())
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template

@router.get("/templates/{template_id}", response_model=EmailTemplateSchema)
async def read_email_template(
    *,
    db: AsyncSession = Depends(get_db),
    template_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera un template email specifico tramite ID.
    """
    template = await db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template email non trovato",
        )
    return template

@router.put("/templates/{template_id}", response_model=EmailTemplateSchema)
async def update_email_template(
    *,
    db: AsyncSession = Depends(get_db),
    template_id: UUID,
    template_in: EmailTemplateUpdate,
    current_user: User = Depends(check_subscription_plan("basic")),
) -> Any:
    """
    Aggiorna un template email.
    Richiede almeno il piano Basic.
    """
    template = await db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template email non trovato",
        )
    
    update_data = template_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    await db.commit()
    await db.refresh(template)
    return template

@router.post("/send", status_code=status.HTTP_202_ACCEPTED)
async def send_email(
    *,
    db: AsyncSession = Depends(get_db),
    email_in: EmailSend,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Invia un'email utilizzando un template.
    """
    # Verifica che il negozio appartenga all'utente corrente
    store = await db.query(Store).filter(Store.id == email_in.store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato o non autorizzato",
        )
    
    # Verifica che il template esista
    template = await db.query(EmailTemplate).filter(EmailTemplate.id == email_in.template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template email non trovato",
        )
    
    # Verifica che i destinatari esistano (se specificati per ID)
    if email_in.customer_ids:
        customers = await db.query(Customer).filter(
            Customer.id.in_(email_in.customer_ids),
            Customer.store_id == store.id
        ).all()
        
        if len(customers) != len(email_in.customer_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alcuni clienti non sono stati trovati",
            )
    
    # Aggiungi il task di invio email in background
    from src.tasks.email import send_email_task
    background_tasks.add_task(
        send_email_task,
        template_id=str(email_in.template_id),
        store_id=str(email_in.store_id),
        customer_ids=[str(cid) for cid in email_in.customer_ids] if email_in.customer_ids else None,
        email_addresses=email_in.email_addresses,
        context=email_in.context
    )
    
    return {
        "message": "Email in elaborazione",
        "status": "accepted"
    }

@router.post("/newsletter", status_code=status.HTTP_202_ACCEPTED)
async def send_newsletter(
    *,
    db: AsyncSession = Depends(get_db),
    store_id: UUID,
    template_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(check_subscription_plan("pro")),
) -> Dict[str, Any]:
    """
    Invia una newsletter a tutti i clienti che hanno accettato il marketing.
    Richiede il piano Pro.
    """
    # Verifica che il negozio appartenga all'utente corrente
    store = await db.query(Store).filter(Store.id == store_id, Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Negozio non trovato o non autorizzato",
        )
    
    # Verifica che il template esista
    template = await db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template email non trovato",
        )
    
    # Aggiungi il task di invio newsletter in background
    from src.tasks.email import send_newsletter_task
    background_tasks.add_task(
        send_newsletter_task,
        template_id=str(template_id),
        store_id=str(store_id)
    )
    
    return {
        "message": "Newsletter in elaborazione",
        "status": "accepted"
    }
