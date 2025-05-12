import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { AuthProvider } from '../contexts/AuthContext';

// Mock dei componenti necessari
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
}));

describe('Layout Component', () => {
  test('renderizza correttamente con sidebar e appbar', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Verifica che il logo sia presente
    expect(screen.getByText('CommerceAI')).toBeInTheDocument();
    
    // Verifica che gli elementi del menu siano presenti
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Prodotti')).toBeInTheDocument();
    expect(screen.getByText('Ordini')).toBeInTheDocument();
    expect(screen.getByText('Clienti')).toBeInTheDocument();
    
    // Verifica che l'outlet sia renderizzato
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
