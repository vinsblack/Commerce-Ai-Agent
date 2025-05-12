import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Componente di test per accedere al contesto
const TestComponent = () => {
  const { isAuthenticated, login, logout, user } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Autenticato' : 'Non autenticato'}</div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  test('fornisce lo stato di autenticazione iniziale', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Non autenticato');
  });
  
  test('aggiorna lo stato dopo il login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticato');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });
  
  test('aggiorna lo stato dopo il logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Prima effettua il login
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticato');
    });
    
    // Poi effettua il logout
    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Non autenticato');
    });
  });
});
