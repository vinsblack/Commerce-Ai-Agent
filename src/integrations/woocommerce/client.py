import logging
from typing import Any, Dict, List, Optional

from woocommerce import API
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class WooCommerceClient:
    """
    Client per l'integrazione con WooCommerce.
    """
    
    def __init__(
        self,
        url: str,
        consumer_key: str,
        consumer_secret: str,
        version: str = "wc/v3",
    ):
        """
        Inizializza il client WooCommerce.
        
        Args:
            url: URL del sito WordPress con WooCommerce
            consumer_key: Consumer Key di WooCommerce
            consumer_secret: Consumer Secret di WooCommerce
            version: Versione dell'API WooCommerce
        """
        self.url = url
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.version = version
        
        # Inizializza il client WooCommerce
        self.wcapi = API(
            url=url,
            consumer_key=consumer_key,
            consumer_secret=consumer_secret,
            version=version,
            timeout=30,
        )
    
    def get_products(self, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Recupera i prodotti dal negozio WooCommerce.
        
        Args:
            params: Parametri di query (opzionale)
        
        Returns:
            Lista di prodotti
        """
        try:
            response = self.wcapi.get("products", params=params)
            
            if response.status_code != 200:
                logger.error(f"Errore nel recupero dei prodotti WooCommerce: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nel recupero dei prodotti WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nel recupero dei prodotti WooCommerce: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dei prodotti WooCommerce: {str(e)}",
            )
    
    def get_product(self, product_id: int) -> Dict[str, Any]:
        """
        Recupera un prodotto specifico dal negozio WooCommerce.
        
        Args:
            product_id: ID del prodotto
        
        Returns:
            Dettagli del prodotto
        """
        try:
            response = self.wcapi.get(f"products/{product_id}")
            
            if response.status_code != 200:
                logger.error(f"Errore nel recupero del prodotto WooCommerce {product_id}: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nel recupero del prodotto WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nel recupero del prodotto WooCommerce {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero del prodotto WooCommerce: {str(e)}",
            )
    
    def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo prodotto nel negozio WooCommerce.
        
        Args:
            product_data: Dati del prodotto
        
        Returns:
            Dettagli del prodotto creato
        """
        try:
            response = self.wcapi.post("products", product_data)
            
            if response.status_code != 201:
                logger.error(f"Errore nella creazione del prodotto WooCommerce: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nella creazione del prodotto WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nella creazione del prodotto WooCommerce: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione del prodotto WooCommerce: {str(e)}",
            )
    
    def update_product(self, product_id: int, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aggiorna un prodotto nel negozio WooCommerce.
        
        Args:
            product_id: ID del prodotto
            product_data: Dati del prodotto da aggiornare
        
        Returns:
            Dettagli del prodotto aggiornato
        """
        try:
            response = self.wcapi.put(f"products/{product_id}", product_data)
            
            if response.status_code != 200:
                logger.error(f"Errore nell'aggiornamento del prodotto WooCommerce {product_id}: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nell'aggiornamento del prodotto WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nell'aggiornamento del prodotto WooCommerce {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'aggiornamento del prodotto WooCommerce: {str(e)}",
            )
    
    def delete_product(self, product_id: int, force: bool = False) -> Dict[str, Any]:
        """
        Elimina un prodotto dal negozio WooCommerce.
        
        Args:
            product_id: ID del prodotto
            force: Se True, elimina definitivamente il prodotto invece di spostarlo nel cestino
        
        Returns:
            Risposta dell'eliminazione
        """
        try:
            response = self.wcapi.delete(f"products/{product_id}", params={"force": force})
            
            if response.status_code not in [200, 202]:
                logger.error(f"Errore nell'eliminazione del prodotto WooCommerce {product_id}: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nell'eliminazione del prodotto WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nell'eliminazione del prodotto WooCommerce {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'eliminazione del prodotto WooCommerce: {str(e)}",
            )
    
    def get_orders(self, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Recupera gli ordini dal negozio WooCommerce.
        
        Args:
            params: Parametri di query (opzionale)
        
        Returns:
            Lista di ordini
        """
        try:
            response = self.wcapi.get("orders", params=params)
            
            if response.status_code != 200:
                logger.error(f"Errore nel recupero degli ordini WooCommerce: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nel recupero degli ordini WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nel recupero degli ordini WooCommerce: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero degli ordini WooCommerce: {str(e)}",
            )
    
    def get_order(self, order_id: int) -> Dict[str, Any]:
        """
        Recupera un ordine specifico dal negozio WooCommerce.
        
        Args:
            order_id: ID dell'ordine
        
        Returns:
            Dettagli dell'ordine
        """
        try:
            response = self.wcapi.get(f"orders/{order_id}")
            
            if response.status_code != 200:
                logger.error(f"Errore nel recupero dell'ordine WooCommerce {order_id}: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nel recupero dell'ordine WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nel recupero dell'ordine WooCommerce {order_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dell'ordine WooCommerce: {str(e)}",
            )
    
    def get_customers(self, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Recupera i clienti dal negozio WooCommerce.
        
        Args:
            params: Parametri di query (opzionale)
        
        Returns:
            Lista di clienti
        """
        try:
            response = self.wcapi.get("customers", params=params)
            
            if response.status_code != 200:
                logger.error(f"Errore nel recupero dei clienti WooCommerce: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nel recupero dei clienti WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nel recupero dei clienti WooCommerce: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dei clienti WooCommerce: {str(e)}",
            )
    
    def get_customer(self, customer_id: int) -> Dict[str, Any]:
        """
        Recupera un cliente specifico dal negozio WooCommerce.
        
        Args:
            customer_id: ID del cliente
        
        Returns:
            Dettagli del cliente
        """
        try:
            response = self.wcapi.get(f"customers/{customer_id}")
            
            if response.status_code != 200:
                logger.error(f"Errore nel recupero del cliente WooCommerce {customer_id}: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Errore nel recupero del cliente WooCommerce: {response.text}",
                )
            
            return response.json()
        except Exception as e:
            logger.error(f"Errore nel recupero del cliente WooCommerce {customer_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero del cliente WooCommerce: {str(e)}",
            )
