import json
import logging
from typing import Any, Dict, List, Optional, Union

import httpx

from src.core.config import settings

logger = logging.getLogger(__name__)

class MCPClient:
    """
    Client per l'interazione con il Model Context Protocol (MCP).
    """
    def __init__(self, server_url: str = None):
        self.server_url = server_url or settings.MCP_SERVER_URL
        self.enabled = settings.MCP_ENABLED
    
    async def call_function(
        self,
        function_name: str,
        parameters: Dict[str, Any],
        timeout: int = 60
    ) -> Dict[str, Any]:
        """
        Chiama una funzione MCP sul server.
        """
        if not self.enabled:
            logger.warning("MCP è disabilitato nelle impostazioni")
            return {"error": "MCP è disabilitato nelle impostazioni"}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.server_url}/function/{function_name}",
                    json=parameters,
                    timeout=timeout
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Errore nella chiamata MCP: {response.status_code} - {response.text}")
                    return {"error": f"Errore nella chiamata MCP: {response.status_code}"}
        
        except Exception as e:
            logger.error(f"Eccezione durante la chiamata MCP: {str(e)}")
            return {"error": f"Eccezione durante la chiamata MCP: {str(e)}"}
    
    async def get_available_functions(self) -> List[Dict[str, Any]]:
        """
        Ottiene l'elenco delle funzioni disponibili sul server MCP.
        """
        if not self.enabled:
            logger.warning("MCP è disabilitato nelle impostazioni")
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.server_url}/functions")
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Errore nel recupero delle funzioni MCP: {response.status_code} - {response.text}")
                    return []
        
        except Exception as e:
            logger.error(f"Eccezione durante il recupero delle funzioni MCP: {str(e)}")
            return []

# Istanza del client MCP
mcp_client = MCPClient()
