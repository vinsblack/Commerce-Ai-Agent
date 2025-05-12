import logging
from typing import Any, Dict, List, Optional

import shopify
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class ShopifyClient:
    """
    Client per l'integrazione con Shopify.
    """
    
    def __init__(
        self,
        api_key: str,
        api_secret: str,
        shop_url: str,
        access_token: Optional[str] = None,
    ):
        """
        Inizializza il client Shopify.
        
        Args:
            api_key: API Key di Shopify
            api_secret: API Secret di Shopify
            shop_url: URL del negozio Shopify (es. my-store.myshopify.com)
            access_token: Token di accesso (opzionale)
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.shop_url = shop_url
        self.access_token = access_token
        
        # Configura la sessione Shopify
        shopify.Session.setup(api_key=api_key, secret=api_secret)
        
        if access_token:
            self.session = shopify.Session(shop_url, "2023-07", access_token)
            shopify.ShopifyResource.activate_session(self.session)
    
    def create_auth_url(self, redirect_uri: str, scopes: List[str]) -> str:
        """
        Crea un URL di autorizzazione OAuth.
        
        Args:
            redirect_uri: URI di reindirizzamento dopo l'autorizzazione
            scopes: Permessi richiesti
        
        Returns:
            URL di autorizzazione
        """
        session = shopify.Session(self.shop_url, "2023-07")
        return session.create_permission_url(scopes, redirect_uri)
    
    def request_access_token(self, code: str) -> str:
        """
        Richiede un token di accesso utilizzando il codice di autorizzazione.
        
        Args:
            code: Codice di autorizzazione
        
        Returns:
            Token di accesso
        """
        session = shopify.Session(self.shop_url, "2023-07")
        access_token = session.request_token(code)
        self.access_token = access_token
        
        # Attiva la sessione
        self.session = session
        shopify.ShopifyResource.activate_session(self.session)
        
        return access_token
    
    def get_products(self, limit: int = 50, page: int = 1) -> List[Dict[str, Any]]:
        """
        Recupera i prodotti dal negozio Shopify.
        
        Args:
            limit: Numero massimo di prodotti da recuperare
            page: Pagina da recuperare
        
        Returns:
            Lista di prodotti
        """
        try:
            products = shopify.Product.find(limit=limit, page=page)
            return [product.to_dict() for product in products]
        except Exception as e:
            logger.error(f"Errore nel recupero dei prodotti Shopify: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dei prodotti Shopify: {str(e)}",
            )
    
    def get_product(self, product_id: int) -> Dict[str, Any]:
        """
        Recupera un prodotto specifico dal negozio Shopify.
        
        Args:
            product_id: ID del prodotto
        
        Returns:
            Dettagli del prodotto
        """
        try:
            product = shopify.Product.find(product_id)
            return product.to_dict()
        except Exception as e:
            logger.error(f"Errore nel recupero del prodotto Shopify {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero del prodotto Shopify: {str(e)}",
            )
    
    def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuovo prodotto nel negozio Shopify.
        
        Args:
            product_data: Dati del prodotto
        
        Returns:
            Dettagli del prodotto creato
        """
        try:
            product = shopify.Product()
            
            # Imposta i dati del prodotto
            for key, value in product_data.items():
                setattr(product, key, value)
            
            # Salva il prodotto
            product.save()
            
            return product.to_dict()
        except Exception as e:
            logger.error(f"Errore nella creazione del prodotto Shopify: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nella creazione del prodotto Shopify: {str(e)}",
            )
    
    def update_product(self, product_id: int, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aggiorna un prodotto nel negozio Shopify.
        
        Args:
            product_id: ID del prodotto
            product_data: Dati del prodotto da aggiornare
        
        Returns:
            Dettagli del prodotto aggiornato
        """
        try:
            product = shopify.Product.find(product_id)
            
            # Aggiorna i dati del prodotto
            for key, value in product_data.items():
                setattr(product, key, value)
            
            # Salva le modifiche
            product.save()
            
            return product.to_dict()
        except Exception as e:
            logger.error(f"Errore nell'aggiornamento del prodotto Shopify {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'aggiornamento del prodotto Shopify: {str(e)}",
            )
    
    def delete_product(self, product_id: int) -> bool:
        """
        Elimina un prodotto dal negozio Shopify.
        
        Args:
            product_id: ID del prodotto
        
        Returns:
            True se l'eliminazione è avvenuta con successo
        """
        try:
            product = shopify.Product.find(product_id)
            return product.destroy()
        except Exception as e:
            logger.error(f"Errore nell'eliminazione del prodotto Shopify {product_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nell'eliminazione del prodotto Shopify: {str(e)}",
            )
    
    def get_orders(self, limit: int = 50, page: int = 1, status: str = "any") -> List[Dict[str, Any]]:
        """
        Recupera gli ordini dal negozio Shopify.
        
        Args:
            limit: Numero massimo di ordini da recuperare
            page: Pagina da recuperare
            status: Stato degli ordini (any, open, closed, cancelled)
        
        Returns:
            Lista di ordini
        """
        try:
            orders = shopify.Order.find(limit=limit, page=page, status=status)
            return [order.to_dict() for order in orders]
        except Exception as e:
            logger.error(f"Errore nel recupero degli ordini Shopify: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero degli ordini Shopify: {str(e)}",
            )
    
    def get_order(self, order_id: int) -> Dict[str, Any]:
        """
        Recupera un ordine specifico dal negozio Shopify.
        
        Args:
            order_id: ID dell'ordine
        
        Returns:
            Dettagli dell'ordine
        """
        try:
            order = shopify.Order.find(order_id)
            return order.to_dict()
        except Exception as e:
            logger.error(f"Errore nel recupero dell'ordine Shopify {order_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dell'ordine Shopify: {str(e)}",
            )
    
    def get_customers(self, limit: int = 50, page: int = 1) -> List[Dict[str, Any]]:
        """
        Recupera i clienti dal negozio Shopify.
        
        Args:
            limit: Numero massimo di clienti da recuperare
            page: Pagina da recuperare
        
        Returns:
            Lista di clienti
        """
        try:
            customers = shopify.Customer.find(limit=limit, page=page)
            return [customer.to_dict() for customer in customers]
        except Exception as e:
            logger.error(f"Errore nel recupero dei clienti Shopify: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero dei clienti Shopify: {str(e)}",
            )
    
    def get_customer(self, customer_id: int) -> Dict[str, Any]:
        """
        Recupera un cliente specifico dal negozio Shopify.
        
        Args:
            customer_id: ID del cliente
        
        Returns:
            Dettagli del cliente
        """
        try:
            customer = shopify.Customer.find(customer_id)
            return customer.to_dict()
        except Exception as e:
            logger.error(f"Errore nel recupero del cliente Shopify {customer_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Errore nel recupero del cliente Shopify: {str(e)}",
            )
    
    def close_session(self):
        """
        Chiude la sessione Shopify.
        """
        shopify.ShopifyResource.clear_session()
