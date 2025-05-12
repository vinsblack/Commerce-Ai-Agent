import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_plan: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verifica se l'utente è già autenticato al caricamento
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Configura axios con il token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Recupera i dati dell'utente
          const response = await axios.get('/api/v1/users/me');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token non valido o scaduto
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/login', {
        username: email, // L'API FastAPI OAuth2 usa 'username'
        password,
      });
      
      const { access_token } = response.data;
      
      // Salva il token
      localStorage.setItem('token', access_token);
      
      // Configura axios con il token
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Recupera i dati dell'utente
      const userResponse = await axios.get('/api/v1/users/me');
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Credenziali non valide');
    }
  };

  const register = async (email: string, password: string, full_name: string) => {
    try {
      // Registra l'utente
      await axios.post('/api/v1/auth/register', {
        username: email, // L'API FastAPI OAuth2 usa 'username'
        password,
        full_name,
      });
      
      // Effettua il login automaticamente
      await login(email, password);
    } catch (error) {
      throw new Error('Errore durante la registrazione');
    }
  };

  const logout = () => {
    // Rimuovi il token
    localStorage.removeItem('token');
    
    // Rimuovi l'header di autorizzazione
    delete axios.defaults.headers.common['Authorization'];
    
    // Aggiorna lo stato
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
