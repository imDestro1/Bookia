import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ReservationsManager from './ReservationsManager';
import { jsonResponse, mockFetch } from '../test/mockFetch';

const RESERVATION = {
  _id: 'r1',
  book: { title: 'Aura' },
  user: { name: 'Ana', email: 'ana@test.dev' },
  store: { name: 'Librería Centro' },
  quantity: 1,
  price: 100,
  status: 'pendiente',
  expires_at: '2026-10-24T12:00:00.000Z',
};

describe('ReservationsManager', () => {
  it('lists pending reservations and confirms one', async () => {
    const fetch = mockFetch((url, options) => {
      if (url.includes('/stores')) return jsonResponse([{ _id: 's1', name: 'Librería Centro' }]);
      if (options?.method === 'PATCH')
        return jsonResponse({ ...RESERVATION, status: 'confirmada' });
      return jsonResponse({ items: [RESERVATION] });
    });
    render(<ReservationsManager showStoreFilter />);

    const row = (await screen.findByText('Aura')).closest('tr');
    expect(within(row).getByText('ana@test.dev')).toBeInTheDocument();
    expect(fetch.mock.calls.some(([url]) => url.includes('status=pendiente'))).toBe(true);

    await userEvent.click(within(row).getByRole('button', { name: 'Confirmar' }));
    const patch = fetch.mock.calls.find(([, options]) => options?.method === 'PATCH');
    expect(patch[0]).toContain('/api/reservations/r1/status');
    expect(JSON.parse(patch[1].body)).toEqual({ status: 'confirmada' });
    expect(await screen.findByText(/marcada como confirmada/)).toBeInTheDocument();
  });

  it('hides the store filter for store owners', async () => {
    mockFetch(() => jsonResponse({ items: [] }));
    render(<ReservationsManager />);
    expect(await screen.findByText('No hay reservas con este filtro')).toBeInTheDocument();
    expect(screen.queryByLabelText('Establecimiento')).not.toBeInTheDocument();
  });
});
