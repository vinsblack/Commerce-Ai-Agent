import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Dashboard from './Dashboard';

// Crea un client di query per i test
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Dashboard Component', () => {
  test('renderizza correttamente con i widget principali', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    );
    
    // Verifica che il titolo della pagina sia presente
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Verifica che i widget principali siano presenti
    expect(screen.getByText('Vendite totali')).toBeInTheDocument();
    expect(screen.getByText('Ordini totali')).toBeInTheDocument();
    expect(screen.getByText('Clienti totali')).toBeInTheDocument();
    
    // Verifica che i grafici siano presenti
    expect(screen.getByText('Vendite recenti')).toBeInTheDocument();
    expect(screen.getByText('Prodotti più venduti')).toBeInTheDocument();
  });
});
