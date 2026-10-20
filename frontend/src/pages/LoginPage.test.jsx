import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';

function renderPage(auth) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated: false, ...auth }}>
      <MemoryRouter future={ROUTER_FUTURE}>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('LoginPage', () => {
  it('signs a reader in and offers a separate admin access', async () => {
    const login = vi.fn().mockResolvedValue({});
    renderPage({ login });
    expect(screen.getByRole('link', { name: 'Soy administrador' })).toHaveAttribute(
      'href',
      '/admin/login',
    );
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@bookia.mx');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(login).toHaveBeenCalledWith('ana@bookia.mx', 'secret123');
  });

  it('creates an account and shows a friendly error for taken emails', async () => {
    const register = vi.fn().mockRejectedValue(Object.assign(new Error('x'), { status: 409 }));
    renderPage({ register });
    await userEvent.click(screen.getByRole('tab', { name: 'Crear cuenta' }));
    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@bookia.mx');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(register).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@bookia.mx',
      password: 'secret123',
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(/ya tiene una cuenta/);
  });
});
