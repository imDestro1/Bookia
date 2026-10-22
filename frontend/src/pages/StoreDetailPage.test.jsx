import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StoreDetailPage from './StoreDetailPage';
import { storesApi } from '../services/bookiaApi';
import { ROUTER_FUTURE } from '../services/routerFuture';

vi.mock('../services/bookiaApi', () => ({ storesApi: { getById: vi.fn() } }));

function renderPage() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE} initialEntries={['/establecimientos/s1']}>
      <Routes>
        <Route path="establecimientos/:id" element={<StoreDetailPage />} />
        <Route path="libros/:id" element={<p>Detalle del libro</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StoreDetailPage', () => {
  it('links each book row to the book detail page', async () => {
    storesApi.getById.mockResolvedValue({
      _id: 's1',
      name: 'Librería Centro',
      offers: [
        {
          _id: 'o1',
          price: 100,
          stock: 3,
          book: { _id: 'b1', title: 'Aura', author: 'Carlos Fuentes' },
        },
        { _id: 'o2', price: 50, stock: 0, book: null },
      ],
    });
    renderPage();

    const link = await screen.findByRole('link', { name: 'Aura' });
    expect(link).toHaveAttribute('href', '/libros/b1');
    expect(screen.getByText('Libro no disponible')).toBeInTheDocument();
    expect(screen.queryAllByRole('link', { name: /libro/i })).toHaveLength(0);

    await userEvent.click(link);
    expect(screen.getByText('Detalle del libro')).toBeInTheDocument();
  });
});
