import logging
from typing import Any, Dict, List, Optional, Union

from src.mcp.client import mcp_client

logger = logging.getLogger(__name__)

class AgentManager:
    """
    Gestisce gli agenti AI specializzati utilizzando il protocollo MCP.
    """
    
    async def run_agent(
        self,
        agent_type: str,
        input_data: Dict[str, Any],
        store_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Esegue un agente AI specializzato.
        
        Args:
            agent_type: Tipo di agente (inventory, pricing, customer_service, marketing)
            input_data: Dati di input per l'agente
            store_id: ID del negozio (opzionale)
            user_id: ID dell'utente (opzionale)
        
        Returns:
            Risultato dell'esecuzione dell'agente
        """
        # Mappa i tipi di agente alle funzioni MCP
        agent_functions = {
            "inventory": "inventory_agent",
            "pricing": "pricing_agent",
            "customer_service": "customer_service_agent",
            "marketing": "marketing_agent",
            "email": "email_agent",
        }
        
        if agent_type not in agent_functions:
            logger.error(f"Tipo di agente non valido: {agent_type}")
            return {"error": f"Tipo di agente non valido: {agent_type}"}
        
        # Prepara i parametri per la chiamata MCP
        parameters = {
            "input": input_data,
        }
        
        if store_id:
            parameters["store_id"] = store_id
        
        if user_id:
            parameters["user_id"] = user_id
        
        # Chiama la funzione MCP
        function_name = agent_functions[agent_type]
        result = await mcp_client.call_function(function_name, parameters)
        
        return result
    
    async def get_agent_capabilities(self, agent_type: str) -> Dict[str, Any]:
        """
        Ottiene le capacità di un agente AI specializzato.
        
        Args:
            agent_type: Tipo di agente (inventory, pricing, customer_service, marketing)
        
        Returns:
            Capacità dell'agente
        """
        # Mappa i tipi di agente alle funzioni MCP
        agent_functions = {
            "inventory": "inventory_agent_capabilities",
            "pricing": "pricing_agent_capabilities",
            "customer_service": "customer_service_agent_capabilities",
            "marketing": "marketing_agent_capabilities",
            "email": "email_agent_capabilities",
        }
        
        if agent_type not in agent_functions:
            logger.error(f"Tipo di agente non valido: {agent_type}")
            return {"error": f"Tipo di agente non valido: {agent_type}"}
        
        # Chiama la funzione MCP
        function_name = agent_functions[agent_type]
        result = await mcp_client.call_function(function_name, {})
        
        return result

# Istanza del gestore degli agenti
agent_manager = AgentManager()
