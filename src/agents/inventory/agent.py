import logging
from typing import Any, Dict, List, Optional

from src.mcp.client import mcp_client

logger = logging.getLogger(__name__)

class InventoryAgent:
    """
    Agente AI specializzato per la gestione dell'inventario.
    """
    
    async def predict_demand(
        self,
        product_id: str,
        store_id: str,
        days_ahead: int = 30,
    ) -> Dict[str, Any]:
        """
        Prevede la domanda futura per un prodotto.
        
        Args:
            product_id: ID del prodotto
            store_id: ID del negozio
            days_ahead: Numero di giorni per cui prevedere la domanda
        
        Returns:
            Previsione della domanda
        """
        parameters = {
            "product_id": product_id,
            "store_id": store_id,
            "days_ahead": days_ahead,
        }
        
        result = await mcp_client.call_function("inventory_predict_demand", parameters)
        return result
    
    async def recommend_restock(
        self,
        store_id: str,
        threshold: int = 5,
    ) -> Dict[str, Any]:
        """
        Raccomanda prodotti da riordinare in base alle scorte e alla domanda prevista.
        
        Args:
            store_id: ID del negozio
            threshold: Soglia di scorta minima
        
        Returns:
            Lista di prodotti da riordinare
        """
        parameters = {
            "store_id": store_id,
            "threshold": threshold,
        }
        
        result = await mcp_client.call_function("inventory_recommend_restock", parameters)
        return result
    
    async def optimize_inventory(
        self,
        store_id: str,
    ) -> Dict[str, Any]:
        """
        Ottimizza i livelli di inventario per bilanciare costi di magazzino e disponibilità.
        
        Args:
            store_id: ID del negozio
        
        Returns:
            Raccomandazioni per l'ottimizzazione dell'inventario
        """
        parameters = {
            "store_id": store_id,
        }
        
        result = await mcp_client.call_function("inventory_optimize", parameters)
        return result
    
    async def analyze_trends(
        self,
        store_id: str,
        period: str = "last_30_days",
    ) -> Dict[str, Any]:
        """
        Analizza le tendenze dell'inventario nel tempo.
        
        Args:
            store_id: ID del negozio
            period: Periodo di analisi (last_7_days, last_30_days, last_90_days, last_year)
        
        Returns:
            Analisi delle tendenze dell'inventario
        """
        parameters = {
            "store_id": store_id,
            "period": period,
        }
        
        result = await mcp_client.call_function("inventory_analyze_trends", parameters)
        return result

# Istanza dell'agente di inventario
inventory_agent = InventoryAgent()
