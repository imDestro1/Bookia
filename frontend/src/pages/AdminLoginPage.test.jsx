import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminLoginPage from './AdminLoginPage';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';

function renderPage(auth) {
  return render(
    <AuthContext.Provider value={{ canManage: false, ...auth }}>
      <MemoryRouter initialEntries={['/admin/login']} future={ROUTER_FUTURE}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<p>Panel</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

async function submit(email, password) {
  await userEvent.type(screen.getByLabelText('Correo electrónico'), email);
  await userEvent.type(screen.getByLabelText('Contraseña'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('AdminLoginPage', () => {
  it('signs a store owner in through the admin portal and opens the panel', async () => {
    const login = vi.fn().mockResolvedValue({ role: 'store_owner', store_id: 's1' });
    renderPage({ login });
    expect(screen.getByText(/dueños de tienda/i)).toBeInTheDocument();
    await submit('rosa@bookia.mx', 'secret123');
    expect(login).toHaveBeenCalledWith('rosa@bookia.mx', 'secret123', 'admin');
    expect(await screen.findByText('Panel')).toBeInTheDocument();
  });

  it('explains that reader accounts have no panel access', async () => {
    const login = vi.fn().mockRejectedValue(Object.assign(new Error('x'), { status: 403 }));
    renderPage({ login });
    await submit('ana@bookia.mx', 'secret123');
    expect(await screen.findByRole('alert')).toHaveTextContent(/no tiene acceso al panel/);
  });

  it('redirects signed-in panel users straight to /admin', () => {
    renderPage({ canManage: true, login: vi.fn() });
    expect(screen.getByText('Panel')).toBeInTheDocument();
  });
});
