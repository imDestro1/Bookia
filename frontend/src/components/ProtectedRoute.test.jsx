import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';

function renderWithAuth(auth, path = '/admin') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
        <Routes>
          <Route path="/admin/login" element={<p>Página de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<p>Panel privado</p>} />
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin/libros" element={<p>Solo administradores</p>} />
            </Route>
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

  it('lets store owners into the panel', () => {
    renderWithAuth({ status: 'authenticated', isAdmin: false, isStoreOwner: true });
    expect(screen.getByText('Panel privado')).toBeInTheDocument();
  });

  it('keeps readers out even when they are signed in', () => {
    renderWithAuth({ status: 'authenticated', isAdmin: false, isStoreOwner: false });
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Panel privado')).not.toBeInTheDocument();
  });

  it('sends store owners back to /admin from admin-only sections', () => {
    renderWithAuth(
      { status: 'authenticated', isAdmin: false, isStoreOwner: true },
      '/admin/libros',
    );
    expect(screen.getByText('Panel privado')).toBeInTheDocument();
    expect(screen.queryByText('Solo administradores')).not.toBeInTheDocument();
  });

  it('opens admin-only sections for admins', () => {
    renderWithAuth({ status: 'authenticated', isAdmin: true }, '/admin/libros');
    expect(screen.getByText('Solo administradores')).toBeInTheDocument();
  });
});
