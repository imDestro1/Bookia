import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ReserveButton from './ReserveButton';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';
import { jsonResponse, mockFetch } from '../test/mockFetch';

const OFFER = { _id: 'o1', price: 120, stock: 3 };
const READER = { isAuthenticated: true, user: { _id: 'u1', role: 'reader' } };

function renderButton(auth, offer = OFFER, onReserved = vi.fn()) {
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter future={ROUTER_FUTURE} initialEntries={['/libros/b1']}>
        <Routes>
          <Route
            path="/libros/:id"
            element={<ReserveButton offer={offer} bookId="b1" onReserved={onReserved} />}
          />
          <Route path="/ingresar" element={<p>Pantalla de ingreso</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return onReserved;
}

describe('ReserveButton', () => {
  it('sends anonymous visitors to the login screen', async () => {
    renderButton({ isAuthenticated: false, user: null });
    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }));
    expect(screen.getByText('Pantalla de ingreso')).toBeInTheDocument();
  });

  it('reserves the chosen quantity for a reader', async () => {
    const fetch = mockFetch(() => jsonResponse({ _id: 'r1', quantity: 2 }, 201));
    const onReserved = renderButton(READER);
    await userEvent.selectOptions(screen.getByLabelText('Cantidad a reservar'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }));

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/reservations');
    expect(JSON.parse(options.body)).toEqual({ offer_id: 'o1', quantity: 2 });
    expect(onReserved).toHaveBeenCalledWith('o1', 2);
    expect(await screen.findByRole('link', { name: 'Ver mis reservas' })).toHaveAttribute(
      'href',
      '/mis-reservas',
    );
  });

  it('shows the API error when there are not enough copies', async () => {
    mockFetch(() => jsonResponse({ message: 'Not enough copies available' }, 409));
    renderButton(READER);
    await userEvent.click(screen.getByRole('button', { name: 'Reservar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya no quedan suficientes ejemplares',
    );
  });

  it('is hidden for admins', () => {
    renderButton({ isAuthenticated: true, user: { role: 'admin' } });
    expect(screen.queryByRole('button', { name: 'Reservar' })).not.toBeInTheDocument();
  });

  it('is hidden when the offer is sold out', () => {
    renderButton(READER, { ...OFFER, stock: 0 });
    expect(screen.queryByRole('button', { name: 'Reservar' })).not.toBeInTheDocument();
  });
});
