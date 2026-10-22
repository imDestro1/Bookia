import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import MyReservationsPage from './MyReservationsPage';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';
import { jsonResponse, mockFetch } from '../test/mockFetch';

const RESERVATION = {
  _id: 'r1',
  book_id: 'b1',
  store_id: 's1',
  book: { _id: 'b1', title: 'Aura', author: 'Carlos Fuentes' },
  store: { _id: 's1', name: 'Librería Centro', address: 'Calle 1' },
  quantity: 2,
  price: 100,
  status: 'pendiente',
  expires_at: '2026-10-24T12:00:00.000Z',
  created_at: '2026-10-22T12:00:00.000Z',
};

function renderPage(auth) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter future={ROUTER_FUTURE}>
        <MyReservationsPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('MyReservationsPage', () => {
  it('asks anonymous visitors to sign in', () => {
    renderPage({ status: 'anonymous', isAuthenticated: false });
    expect(screen.getByRole('link', { name: /Inicia sesión/ })).toHaveAttribute(
      'href',
      '/ingresar',
    );
  });

  it('lists reservations and lets the reader cancel an active one', async () => {
    const fetch = mockFetch((url, options) =>
      options?.method === 'PATCH'
        ? jsonResponse({ ...RESERVATION, book: undefined, store: undefined, status: 'cancelada' })
        : jsonResponse({ items: [RESERVATION] }),
    );
    renderPage({ status: 'authenticated', isAuthenticated: true });

    expect(await screen.findByRole('link', { name: 'Aura' })).toHaveAttribute('href', '/libros/b1');
    expect(screen.getByText('2 ejemplares')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar reserva' }));
    expect(fetch.mock.calls[1][0]).toContain('/api/reservations/r1/cancel');
    expect(await screen.findByText('Cancelada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Aura' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar reserva' })).not.toBeInTheDocument();
  });

  it('shows an empty state without reservations', async () => {
    mockFetch(() => jsonResponse({ items: [] }));
    renderPage({ status: 'authenticated', isAuthenticated: true });
    expect(await screen.findByText('Aún no tienes reservas')).toBeInTheDocument();
  });
});
