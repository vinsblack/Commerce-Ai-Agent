import logging
from typing import Any, Dict, List, Optional

from src.mcp.client import mcp_client

logger = logging.getLogger(__name__)

class CustomerServiceAgent:
    """
    Agente AI specializzato per il servizio clienti.
    """
    
    async def answer_query(
        self,
        query: str,
        customer_id: Optional[str] = None,
        store_id: str = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Risponde a una domanda di un cliente.
        
        Args:
            query: Domanda del cliente
            customer_id: ID del cliente (opzionale)
            store_id: ID del negozio
            context: Contesto aggiuntivo (opzionale)
        
        Returns:
            Risposta alla domanda
        """
        parameters = {
            "query": query,
            "store_id": store_id,
        }
        
        if customer_id:
            parameters["customer_id"] = customer_id
        
        if context:
            parameters["context"] = context
        
        result = await mcp_client.call_function("customer_service_answer", parameters)
        return result
    
    async def handle_complaint(
        self,
        complaint: str,
        customer_id: str,
        order_id: Optional[str] = None,
        store_id: str = None,
    ) -> Dict[str, Any]:
        """
        Gestisce un reclamo di un cliente.
        
        Args:
            complaint: Testo del reclamo
            customer_id: ID del cliente
            order_id: ID dell'ordine (opzionale)
            store_id: ID del negozio
        
        Returns:
            Risposta al reclamo e azioni consigliate
        """
        parameters = {
            "complaint": complaint,
            "customer_id": customer_id,
            "store_id": store_id,
        }
        
        if order_id:
            parameters["order_id"] = order_id
        
        result = await mcp_client.call_function("customer_service_handle_complaint", parameters)
        return result
    
    async def generate_response(
        self,
        message: str,
        customer_id: str,
        store_id: str,
        tone: str = "professional",  # professional, friendly, formal
    ) -> Dict[str, Any]:
        """
        Genera una risposta personalizzata a un messaggio del cliente.
        
        Args:
            message: Messaggio del cliente
            customer_id: ID del cliente
            store_id: ID del negozio
            tone: Tono della risposta
        
        Returns:
            Risposta personalizzata
        """
        parameters = {
            "message": message,
            "customer_id": customer_id,
            "store_id": store_id,
            "tone": tone,
        }
        
        result = await mcp_client.call_function("customer_service_generate_response", parameters)
        return result
    
    async def analyze_sentiment(
        self,
        text: str,
    ) -> Dict[str, Any]:
        """
        Analizza il sentiment di un testo.
        
        Args:
            text: Testo da analizzare
        
        Returns:
            Analisi del sentiment
        """
        parameters = {
            "text": text,
        }
        
        result = await mcp_client.call_function("customer_service_analyze_sentiment", parameters)
        return result

# Istanza dell'agente di servizio clienti
customer_service_agent = CustomerServiceAgent()
