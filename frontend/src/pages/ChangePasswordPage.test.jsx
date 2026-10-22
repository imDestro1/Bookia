import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ChangePasswordPage from './ChangePasswordPage';
import { AuthContext } from '../context/authContext';
import { ApiError } from '../services/apiClient';
import { ROUTER_FUTURE } from '../services/routerFuture';

const OWNER_AUTH = {
  status: 'authenticated',
  isAuthenticated: true,
  canManage: true,
  mustChangePassword: true,
  logout: vi.fn(),
};

function renderPage(auth) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/cambiar-contrasena']} future={ROUTER_FUTURE}>
        <Routes>
          <Route path="/cambiar-contrasena" element={<ChangePasswordPage />} />
          <Route path="/admin" element={<p>Panel privado</p>} />
          <Route path="/admin/login" element={<p>Página de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

async function fill(user, current, next, confirm = next) {
  await user.type(screen.getByLabelText('Contraseña actual'), current);
  await user.type(screen.getByLabelText('Nueva contraseña'), next);
  await user.type(screen.getByLabelText('Confirma la nueva contraseña'), confirm);
  await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }));
}

describe('ChangePasswordPage', () => {
  it('redirects anonymous visitors to the panel login', () => {
    renderPage({ status: 'anonymous', isAuthenticated: false });
    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  it('changes the initial password and opens the panel', async () => {
    const changePassword = vi.fn().mockResolvedValue({ must_change_password: false });
    renderPage({ ...OWNER_AUTH, changePassword });
    expect(screen.getByText(/contraseña inicial/)).toBeInTheDocument();
    await fill(userEvent.setup(), 'inicial123', 'nueva-segura');
    expect(changePassword).toHaveBeenCalledWith({
      current_password: 'inicial123',
      new_password: 'nueva-segura',
    });
    expect(await screen.findByText('Panel privado')).toBeInTheDocument();
  });

  it('validates locally before calling the API', async () => {
    const changePassword = vi.fn();
    renderPage({ ...OWNER_AUTH, changePassword });
    const user = userEvent.setup();
    await fill(user, 'inicial123', 'corta');
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 8/);
    await user.clear(screen.getByLabelText('Nueva contraseña'));
    await user.clear(screen.getByLabelText('Confirma la nueva contraseña'));
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva-segura');
    await user.type(screen.getByLabelText('Confirma la nueva contraseña'), 'otra-distinta');
    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/no coinciden/);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('explains a wrong current password', async () => {
    const changePassword = vi
      .fn()
      .mockRejectedValue(new ApiError('Current password is incorrect', 400));
    renderPage({ ...OWNER_AUTH, changePassword });
    await fill(userEvent.setup(), 'equivocada', 'nueva-segura');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La contraseña actual no es correcta.',
    );
    expect(screen.queryByText('Panel privado')).not.toBeInTheDocument();
  });
});
