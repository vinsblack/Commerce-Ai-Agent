import logging
from typing import Any, Dict, List, Optional

import stripe
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class StripeClient:
    """
    Client per l'integrazione con Stripe.
    """
    
    def __init__(self, api_key: str):
        """
        Inizializza il client Stripe.
        
        Args:
            api_key: API Key di Stripe
        """
        self.api_key = api_key
        stripe.api_key = api_key
    
    def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo cliente su Stripe.
        
        Args:
            customer_data: Dati del cliente
        
        Returns:
            Dettagli del cliente creato
        """
        try:
            customer = stripe.Customer.create(**customer_data)
            return customer
        except stripe.error.StripeError as e:
            logger.error(f"Errore nella creazione del cliente Stripe: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione del cliente Stripe: {str(e)}",
            )
    
    def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """
        Recupera un cliente specifico da Stripe.
        
        Args:
            customer_id: ID del cliente Stripe
        
        Returns:
            Dettagli del cliente
        """
        try:
            customer = stripe.Customer.retrieve(customer_id)
            return customer
        except stripe.error.StripeError as e:
            logger.error(f"Errore nel recupero del cliente Stripe {customer_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero del cliente Stripe: {str(e)}",
            )
    
    def update_customer(self, customer_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aggiorna un cliente su Stripe.
        
        Args:
            customer_id: ID del cliente Stripe
            customer_data: Dati del cliente da aggiornare
        
        Returns:
            Dettagli del cliente aggiornato
        """
        try:
            customer = stripe.Customer.modify(customer_id, **customer_data)
            return customer
        except stripe.error.StripeError as e:
            logger.error(f"Errore nell'aggiornamento del cliente Stripe {customer_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'aggiornamento del cliente Stripe: {str(e)}",
            )
    
    def delete_customer(self, customer_id: str) -> Dict[str, Any]:
        """
        Elimina un cliente da Stripe.
        
        Args:
            customer_id: ID del cliente Stripe
        
        Returns:
            Conferma dell'eliminazione
        """
        try:
            deleted = stripe.Customer.delete(customer_id)
            return deleted
        except stripe.error.StripeError as e:
            logger.error(f"Errore nell'eliminazione del cliente Stripe {customer_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'eliminazione del cliente Stripe: {str(e)}",
            )
    
    def create_payment_method(self, payment_method_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo metodo di pagamento su Stripe.
        
        Args:
            payment_method_data: Dati del metodo di pagamento
        
        Returns:
            Dettagli del metodo di pagamento creato
        """
        try:
            payment_method = stripe.PaymentMethod.create(**payment_method_data)
            return payment_method
        except stripe.error.StripeError as e:
            logger.error(f"Errore nella creazione del metodo di pagamento Stripe: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione del metodo di pagamento Stripe: {str(e)}",
            )
    
    def attach_payment_method(self, payment_method_id: str, customer_id: str) -> Dict[str, Any]:
        """
        Associa un metodo di pagamento a un cliente.
        
        Args:
            payment_method_id: ID del metodo di pagamento
            customer_id: ID del cliente
        
        Returns:
            Dettagli del metodo di pagamento associato
        """
        try:
            payment_method = stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer_id,
            )
            return payment_method
        except stripe.error.StripeError as e:
            logger.error(f"Errore nell'associazione del metodo di pagamento Stripe {payment_method_id} al cliente {customer_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'associazione del metodo di pagamento Stripe: {str(e)}",
            )
    
    def create_payment_intent(self, payment_intent_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo intent di pagamento su Stripe.
        
        Args:
            payment_intent_data: Dati dell'intent di pagamento
        
        Returns:
            Dettagli dell'intent di pagamento creato
        """
        try:
            payment_intent = stripe.PaymentIntent.create(**payment_intent_data)
            return payment_intent
        except stripe.error.StripeError as e:
            logger.error(f"Errore nella creazione dell'intent di pagamento Stripe: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione dell'intent di pagamento Stripe: {str(e)}",
            )
    
    def confirm_payment_intent(self, payment_intent_id: str, confirmation_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Conferma un intent di pagamento su Stripe.
        
        Args:
            payment_intent_id: ID dell'intent di pagamento
            confirmation_data: Dati di conferma (opzionale)
        
        Returns:
            Dettagli dell'intent di pagamento confermato
        """
        try:
            if confirmation_data:
                payment_intent = stripe.PaymentIntent.confirm(payment_intent_id, **confirmation_data)
            else:
                payment_intent = stripe.PaymentIntent.confirm(payment_intent_id)
            
            return payment_intent
        except stripe.error.StripeError as e:
            logger.error(f"Errore nella conferma dell'intent di pagamento Stripe {payment_intent_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella conferma dell'intent di pagamento Stripe: {str(e)}",
            )
    
    def create_subscription(self, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo abbonamento su Stripe.
        
        Args:
            subscription_data: Dati dell'abbonamento
        
        Returns:
            Dettagli dell'abbonamento creato
        """
        try:
            subscription = stripe.Subscription.create(**subscription_data)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Errore nella creazione dell'abbonamento Stripe: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione dell'abbonamento Stripe: {str(e)}",
            )
    
    def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Recupera un abbonamento specifico da Stripe.
        
        Args:
            subscription_id: ID dell'abbonamento
        
        Returns:
            Dettagli dell'abbonamento
        """
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Errore nel recupero dell'abbonamento Stripe {subscription_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dell'abbonamento Stripe: {str(e)}",
            )
    
    def update_subscription(self, subscription_id: str, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aggiorna un abbonamento su Stripe.
        
        Args:
            subscription_id: ID dell'abbonamento
            subscription_data: Dati dell'abbonamento da aggiornare
        
        Returns:
            Dettagli dell'abbonamento aggiornato
        """
        try:
            subscription = stripe.Subscription.modify(subscription_id, **subscription_data)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Errore nell'aggiornamento dell'abbonamento Stripe {subscription_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'aggiornamento dell'abbonamento Stripe: {str(e)}",
            )
    
    def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Cancella un abbonamento su Stripe.
        
        Args:
            subscription_id: ID dell'abbonamento
        
        Returns:
            Dettagli dell'abbonamento cancellato
        """
        try:
            subscription = stripe.Subscription.delete(subscription_id)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Errore nella cancellazione dell'abbonamento Stripe {subscription_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella cancellazione dell'abbonamento Stripe: {str(e)}",
            )
