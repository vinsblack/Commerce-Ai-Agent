import logging
from typing import Any, Dict, List, Optional

from src.mcp.client import mcp_client

logger = logging.getLogger(__name__)

class EmailAgent:
    """
    Agente AI specializzato per la gestione delle email.
    """
    
    async def generate_response(
        self,
        email_content: str,
        customer_id: Optional[str] = None,
        store_id: str = None,
        tone: str = "professional",  # professional, friendly, formal
    ) -> Dict[str, Any]:
        """
        Genera una risposta a un'email.
        
        Args:
            email_content: Contenuto dell'email ricevuta
            customer_id: ID del cliente (opzionale)
            store_id: ID del negozio
            tone: Tono della risposta
        
        Returns:
            Risposta all'email
        """
        parameters = {
            "email_content": email_content,
            "store_id": store_id,
            "tone": tone,
        }
        
        if customer_id:
            parameters["customer_id"] = customer_id
        
        result = await mcp_client.call_function("email_generate_response", parameters)
        return result
    
    async def classify_email(
        self,
        email_content: str,
    ) -> Dict[str, Any]:
        """
        Classifica un'email per tipo (domanda, reclamo, feedback, ordine, ecc.).
        
        Args:
            email_content: Contenuto dell'email
        
        Returns:
            Classificazione dell'email
        """
        parameters = {
            "email_content": email_content,
        }
        
        result = await mcp_client.call_function("email_classify", parameters)
        return result
    
    async def extract_info(
        self,
        email_content: str,
    ) -> Dict[str, Any]:
        """
        Estrae informazioni rilevanti da un'email.
        
        Args:
            email_content: Contenuto dell'email
        
        Returns:
            Informazioni estratte dall'email
        """
        parameters = {
            "email_content": email_content,
        }
        
        result = await mcp_client.call_function("email_extract_info", parameters)
        return result
    
    async def generate_follow_up(
        self,
        customer_id: str,
        store_id: str,
        order_id: Optional[str] = None,
        days_since_purchase: Optional[int] = None,
        purpose: str = "satisfaction",  # satisfaction, review_request, upsell
    ) -> Dict[str, Any]:
        """
        Genera un'email di follow-up dopo un acquisto.
        
        Args:
            customer_id: ID del cliente
            store_id: ID del negozio
            order_id: ID dell'ordine (opzionale)
            days_since_purchase: Giorni trascorsi dall'acquisto (opzionale)
            purpose: Scopo dell'email di follow-up
        
        Returns:
            Email di follow-up
        """
        parameters = {
            "customer_id": customer_id,
            "store_id": store_id,
            "purpose": purpose,
        }
        
        if order_id:
            parameters["order_id"] = order_id
        
        if days_since_purchase:
            parameters["days_since_purchase"] = days_since_purchase
        
        result = await mcp_client.call_function("email_generate_follow_up", parameters)
        return result
    
    async def summarize_thread(
        self,
        email_thread: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Riassume un thread di email.
        
        Args:
            email_thread: Lista di email nel thread
        
        Returns:
            Riassunto del thread
        """
        parameters = {
            "email_thread": email_thread,
        }
        
        result = await mcp_client.call_function("email_summarize_thread", parameters)
        return result

# Istanza dell'agente email
email_agent = EmailAgent()
