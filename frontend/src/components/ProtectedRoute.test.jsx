import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';

function renderWithAuth(auth) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/admin']} future={ROUTER_FUTURE}>
        <Routes>
          <Route path="/admin/login" element={<p>Página de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<p>Panel privado</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a loader while the session is being checked', () => {
    renderWithAuth({ status: 'loading', isAdmin: false });
    expect(screen.getByRole('status')).toHaveTextContent(/Verificando sesión/);
  });

  it('redirects anonymous users to login', () => {
    renderWithAuth({ status: 'anonymous', isAdmin: false });
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Panel privado')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admin users to login', () => {
    renderWithAuth({ status: 'authenticated', isAdmin: false });
    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  it('renders the protected content for admins', () => {
    renderWithAuth({ status: 'authenticated', isAdmin: true });
    expect(screen.getByText('Panel privado')).toBeInTheDocument();
  });
});
