import logging
from typing import Any, Dict, List, Optional

from src.mcp.client import mcp_client

logger = logging.getLogger(__name__)

class MarketingAgent:
    """
    Agente AI specializzato per il marketing.
    """
    
    async def generate_product_description(
        self,
        product_id: str,
        store_id: str,
        tone: str = "professional",  # professional, friendly, persuasive
        length: str = "medium",  # short, medium, long
    ) -> Dict[str, Any]:
        """
        Genera una descrizione ottimizzata per un prodotto.
        
        Args:
            product_id: ID del prodotto
            store_id: ID del negozio
            tone: Tono della descrizione
            length: Lunghezza della descrizione
        
        Returns:
            Descrizione del prodotto
        """
        parameters = {
            "product_id": product_id,
            "store_id": store_id,
            "tone": tone,
            "length": length,
        }
        
        result = await mcp_client.call_function("marketing_generate_description", parameters)
        return result
    
    async def optimize_seo(
        self,
        text: str,
        keywords: List[str],
    ) -> Dict[str, Any]:
        """
        Ottimizza un testo per il SEO.
        
        Args:
            text: Testo da ottimizzare
            keywords: Parole chiave per il SEO
        
        Returns:
            Testo ottimizzato per il SEO
        """
        parameters = {
            "text": text,
            "keywords": keywords,
        }
        
        result = await mcp_client.call_function("marketing_optimize_seo", parameters)
        return result
    
    async def generate_campaign(
        self,
        store_id: str,
        objective: str,  # sales, awareness, engagement
        target_audience: Optional[Dict[str, Any]] = None,
        budget: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Genera una campagna di marketing.
        
        Args:
            store_id: ID del negozio
            objective: Obiettivo della campagna
            target_audience: Pubblico target (opzionale)
            budget: Budget della campagna (opzionale)
        
        Returns:
            Piano della campagna di marketing
        """
        parameters = {
            "store_id": store_id,
            "objective": objective,
        }
        
        if target_audience:
            parameters["target_audience"] = target_audience
        
        if budget:
            parameters["budget"] = budget
        
        result = await mcp_client.call_function("marketing_generate_campaign", parameters)
        return result
    
    async def analyze_performance(
        self,
        store_id: str,
        period: str = "last_30_days",  # last_7_days, last_30_days, last_90_days, last_year
    ) -> Dict[str, Any]:
        """
        Analizza le performance di marketing.
        
        Args:
            store_id: ID del negozio
            period: Periodo di analisi
        
        Returns:
            Analisi delle performance di marketing
        """
        parameters = {
            "store_id": store_id,
            "period": period,
        }
        
        result = await mcp_client.call_function("marketing_analyze_performance", parameters)
        return result
    
    async def generate_social_post(
        self,
        product_id: Optional[str] = None,
        store_id: str = None,
        platform: str = "instagram",  # instagram, facebook, twitter, linkedin
        objective: str = "engagement",  # engagement, sales, awareness
    ) -> Dict[str, Any]:
        """
        Genera un post per i social media.
        
        Args:
            product_id: ID del prodotto (opzionale)
            store_id: ID del negozio
            platform: Piattaforma social
            objective: Obiettivo del post
        
        Returns:
            Post per i social media
        """
        parameters = {
            "store_id": store_id,
            "platform": platform,
            "objective": objective,
        }
        
        if product_id:
            parameters["product_id"] = product_id
        
        result = await mcp_client.call_function("marketing_generate_social_post", parameters)
        return result

# Istanza dell'agente di marketing
marketing_agent = MarketingAgent()
