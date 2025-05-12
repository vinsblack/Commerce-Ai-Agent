import logging
from typing import Any, Dict, List, Optional

import paypalrestsdk
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class PayPalClient:
    """
    Client per l'integrazione con PayPal.
    """
    
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        mode: str = "sandbox",  # sandbox o live
    ):
        """
        Inizializza il client PayPal.
        
        Args:
            client_id: Client ID di PayPal
            client_secret: Client Secret di PayPal
            mode: Modalità di funzionamento (sandbox o live)
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.mode = mode
        
        # Configura il client PayPal
        paypalrestsdk.configure({
            "mode": mode,
            "client_id": client_id,
            "client_secret": client_secret,
        })
    
    def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo pagamento su PayPal.
        
        Args:
            payment_data: Dati del pagamento
        
        Returns:
            Dettagli del pagamento creato
        """
        try:
            payment = paypalrestsdk.Payment(payment_data)
            
            if payment.create():
                return payment.to_dict()
            else:
                logger.error(f"Errore nella creazione del pagamento PayPal: {payment.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nella creazione del pagamento PayPal: {payment.error}",
                )
        except Exception as e:
            logger.error(f"Errore nella creazione del pagamento PayPal: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione del pagamento PayPal: {str(e)}",
            )
    
    def execute_payment(self, payment_id: str, payer_id: str) -> Dict[str, Any]:
        """
        Esegue un pagamento su PayPal.
        
        Args:
            payment_id: ID del pagamento
            payer_id: ID del pagatore
        
        Returns:
            Dettagli del pagamento eseguito
        """
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                return payment.to_dict()
            else:
                logger.error(f"Errore nell'esecuzione del pagamento PayPal {payment_id}: {payment.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nell'esecuzione del pagamento PayPal: {payment.error}",
                )
        except Exception as e:
            logger.error(f"Errore nell'esecuzione del pagamento PayPal {payment_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'esecuzione del pagamento PayPal: {str(e)}",
            )
    
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Recupera un pagamento specifico da PayPal.
        
        Args:
            payment_id: ID del pagamento
        
        Returns:
            Dettagli del pagamento
        """
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            return payment.to_dict()
        except Exception as e:
            logger.error(f"Errore nel recupero del pagamento PayPal {payment_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero del pagamento PayPal: {str(e)}",
            )
    
    def create_billing_plan(self, billing_plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo piano di fatturazione su PayPal.
        
        Args:
            billing_plan_data: Dati del piano di fatturazione
        
        Returns:
            Dettagli del piano di fatturazione creato
        """
        try:
            billing_plan = paypalrestsdk.BillingPlan(billing_plan_data)
            
            if billing_plan.create():
                return billing_plan.to_dict()
            else:
                logger.error(f"Errore nella creazione del piano di fatturazione PayPal: {billing_plan.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nella creazione del piano di fatturazione PayPal: {billing_plan.error}",
                )
        except Exception as e:
            logger.error(f"Errore nella creazione del piano di fatturazione PayPal: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione del piano di fatturazione PayPal: {str(e)}",
            )
    
    def activate_billing_plan(self, billing_plan_id: str) -> bool:
        """
        Attiva un piano di fatturazione su PayPal.
        
        Args:
            billing_plan_id: ID del piano di fatturazione
        
        Returns:
            True se l'attivazione è avvenuta con successo
        """
        try:
            billing_plan = paypalrestsdk.BillingPlan.find(billing_plan_id)
            
            update = [
                {
                    "op": "replace",
                    "path": "/",
                    "value": {
                        "state": "ACTIVE"
                    }
                }
            ]
            
            if billing_plan.update(update):
                return True
            else:
                logger.error(f"Errore nell'attivazione del piano di fatturazione PayPal {billing_plan_id}: {billing_plan.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nell'attivazione del piano di fatturazione PayPal: {billing_plan.error}",
                )
        except Exception as e:
            logger.error(f"Errore nell'attivazione del piano di fatturazione PayPal {billing_plan_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'attivazione del piano di fatturazione PayPal: {str(e)}",
            )
    
    def create_billing_agreement(self, billing_agreement_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo accordo di fatturazione su PayPal.
        
        Args:
            billing_agreement_data: Dati dell'accordo di fatturazione
        
        Returns:
            Dettagli dell'accordo di fatturazione creato
        """
        try:
            billing_agreement = paypalrestsdk.BillingAgreement(billing_agreement_data)
            
            if billing_agreement.create():
                return billing_agreement.to_dict()
            else:
                logger.error(f"Errore nella creazione dell'accordo di fatturazione PayPal: {billing_agreement.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nella creazione dell'accordo di fatturazione PayPal: {billing_agreement.error}",
                )
        except Exception as e:
            logger.error(f"Errore nella creazione dell'accordo di fatturazione PayPal: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione dell'accordo di fatturazione PayPal: {str(e)}",
            )
    
    def execute_billing_agreement(self, token: str) -> Dict[str, Any]:
        """
        Esegue un accordo di fatturazione su PayPal.
        
        Args:
            token: Token dell'accordo di fatturazione
        
        Returns:
            Dettagli dell'accordo di fatturazione eseguito
        """
        try:
            billing_agreement = paypalrestsdk.BillingAgreement.execute(token)
            return billing_agreement.to_dict()
        except Exception as e:
            logger.error(f"Errore nell'esecuzione dell'accordo di fatturazione PayPal: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'esecuzione dell'accordo di fatturazione PayPal: {str(e)}",
            )
    
    def get_billing_agreement(self, billing_agreement_id: str) -> Dict[str, Any]:
        """
        Recupera un accordo di fatturazione specifico da PayPal.
        
        Args:
            billing_agreement_id: ID dell'accordo di fatturazione
        
        Returns:
            Dettagli dell'accordo di fatturazione
        """
        try:
            billing_agreement = paypalrestsdk.BillingAgreement.find(billing_agreement_id)
            return billing_agreement.to_dict()
        except Exception as e:
            logger.error(f"Errore nel recupero dell'accordo di fatturazione PayPal {billing_agreement_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dell'accordo di fatturazione PayPal: {str(e)}",
            )
    
    def cancel_billing_agreement(self, billing_agreement_id: str, cancel_note: Dict[str, str]) -> bool:
        """
        Cancella un accordo di fatturazione su PayPal.
        
        Args:
            billing_agreement_id: ID dell'accordo di fatturazione
            cancel_note: Nota di cancellazione
        
        Returns:
            True se la cancellazione è avvenuta con successo
        """
        try:
            billing_agreement = paypalrestsdk.BillingAgreement.find(billing_agreement_id)
            
            if billing_agreement.cancel(cancel_note):
                return True
            else:
                logger.error(f"Errore nella cancellazione dell'accordo di fatturazione PayPal {billing_agreement_id}: {billing_agreement.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nella cancellazione dell'accordo di fatturazione PayPal: {billing_agreement.error}",
                )
        except Exception as e:
            logger.error(f"Errore nella cancellazione dell'accordo di fatturazione PayPal {billing_agreement_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella cancellazione dell'accordo di fatturazione PayPal: {str(e)}",
            )
