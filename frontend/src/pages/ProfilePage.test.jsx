import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';
import { jsonResponse, mockFetch } from '../test/mockFetch';

const READER = {
  _id: 'u1',
  name: 'Ana',
  email: 'ana@test.dev',
  role: 'reader',
  created_at: '2026-10-20T12:00:00.000Z',
};

function renderProfile(auth) {
  mockFetch(() => jsonResponse({ items: [{ _id: 'b1', title: 'Aura', author: 'Fuentes' }] }));
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter future={ROUTER_FUTURE}>
        <ProfilePage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProfilePage', () => {
  it('asks anonymous visitors to sign in', () => {
    renderProfile({ status: 'anonymous', isAuthenticated: false });
    expect(screen.getByRole('link', { name: /Inicia sesión/ })).toHaveAttribute(
      'href',
      '/ingresar',
    );
  });

  it('shows the account details and saves a new name', async () => {
    const updateProfile = vi.fn().mockResolvedValue({ ...READER, name: 'Ana Lectora' });
    renderProfile({
      status: 'authenticated',
      isAuthenticated: true,
      isAdmin: false,
      user: READER,
      updateProfile,
      logout: vi.fn(),
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Ana' })).toBeInTheDocument();
    expect(screen.getByText('Lector')).toBeInTheDocument();
    expect(screen.getByText(/Miembro desde .*2026/)).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@test.dev');
    expect(await screen.findByText('1')).toBeInTheDocument();

    const save = screen.getByRole('button', { name: 'Guardar cambios' });
    expect(save).toBeDisabled();
    const nameInput = screen.getByLabelText('Nombre');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '  Ana Lectora ');
    await userEvent.click(save);

    expect(updateProfile).toHaveBeenCalledWith({ name: 'Ana Lectora' });
    expect(await screen.findByRole('status')).toHaveTextContent('Tu nombre se actualizó.');
  });
});
