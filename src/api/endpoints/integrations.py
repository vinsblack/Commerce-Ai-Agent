from typing import Any, List, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user, check_subscription_plan
from src.models.integration import Integration
from src.models.user import User
from src.schemas.integration import Integration as IntegrationSchema, IntegrationCreate, IntegrationUpdate

router = APIRouter()

@router.get("/", response_model=List[IntegrationSchema])
async def read_integrations(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera tutte le integrazioni dell'utente corrente.
    """
    integrations = await db.query(Integration).filter(Integration.user_id == current_user.id).offset(skip).limit(limit).all()
    return integrations

@router.post("/", response_model=IntegrationSchema)
async def create_integration(
    *,
    db: AsyncSession = Depends(get_db),
    integration_in: IntegrationCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Crea una nuova integrazione per l'utente corrente.
    """
    # Verifica i limiti del piano di abbonamento
    integrations_count = await db.query(Integration).filter(Integration.user_id == current_user.id).count()
    
    if current_user.subscription_plan == "free" and integrations_count >= 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Il piano Free permette solo 1 integrazione. Passa a un piano superiore per aggiungerne altre."
        )
    elif current_user.subscription_plan == "basic" and integrations_count >= 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Il piano Basic permette solo 2 integrazioni. Passa a un piano superiore per aggiungerne altre."
        )
    
    integration = Integration(
        **integration_in.dict(),
        user_id=current_user.id,
    )
    db.add(integration)
    await db.commit()
    await db.refresh(integration)
    return integration

@router.get("/{integration_id}", response_model=IntegrationSchema)
async def read_integration(
    *,
    db: AsyncSession = Depends(get_db),
    integration_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Recupera un'integrazione specifica tramite ID.
    """
    integration = await db.query(Integration).filter(Integration.id == integration_id, Integration.user_id == current_user.id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integrazione non trovata",
        )
    return integration

@router.put("/{integration_id}", response_model=IntegrationSchema)
async def update_integration(
    *,
    db: AsyncSession = Depends(get_db),
    integration_id: UUID,
    integration_in: IntegrationUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Aggiorna un'integrazione.
    """
    integration = await db.query(Integration).filter(Integration.id == integration_id, Integration.user_id == current_user.id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integrazione non trovata",
        )
    
    update_data = integration_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(integration, field, value)
    
    await db.commit()
    await db.refresh(integration)
    return integration

@router.delete("/{integration_id}", response_model=IntegrationSchema)
async def delete_integration(
    *,
    db: AsyncSession = Depends(get_db),
    integration_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Elimina un'integrazione.
    """
    integration = await db.query(Integration).filter(Integration.id == integration_id, Integration.user_id == current_user.id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integrazione non trovata",
        )
    
    await db.delete(integration)
    await db.commit()
    return integration

@router.get("/providers/{type}", response_model=List[Dict[str, Any]])
async def list_integration_providers(
    *,
    type: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Elenca i provider disponibili per un tipo di integrazione.
    """
    providers = {
        "marketplace": [
            {"id": "shopify", "name": "Shopify", "description": "Piattaforma e-commerce all-in-one"},
            {"id": "woocommerce", "name": "WooCommerce", "description": "Plugin e-commerce per WordPress"},
            {"id": "amazon", "name": "Amazon", "description": "Marketplace globale"},
            {"id": "ebay", "name": "eBay", "description": "Marketplace globale"},
        ],
        "payment": [
            {"id": "stripe", "name": "Stripe", "description": "Soluzioni di pagamento online"},
            {"id": "paypal", "name": "PayPal", "description": "Sistema di pagamento online"},
        ],
        "crm": [
            {"id": "hubspot", "name": "HubSpot", "description": "Piattaforma CRM e marketing"},
            {"id": "salesforce", "name": "Salesforce", "description": "Piattaforma CRM enterprise"},
        ],
        "shipping": [
            {"id": "dhl", "name": "DHL", "description": "Servizio di spedizione globale"},
            {"id": "ups", "name": "UPS", "description": "Servizio di spedizione globale"},
            {"id": "fedex", "name": "FedEx", "description": "Servizio di spedizione globale"},
        ],
    }
    
    if type not in providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo di integrazione non valido. Tipi disponibili: {', '.join(providers.keys())}"
        )
    
    return providers[type]
