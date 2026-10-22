import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MyStoreAdmin from './MyStoreAdmin';
import { AuthContext } from '../../context/authContext';
import { jsonResponse, mockFetch } from '../../test/mockFetch';

const OWNER = { _id: 'u2', email: 'rosa@bookia.mx', role: 'store_owner', store_id: 's1' };
const STORE = {
  _id: 's1',
  name: 'Librería Centro',
  address: 'Av. Juárez 10',
  phone: '776 000 0000',
  schedule: 'L-V 9-18',
  maps_url: '',
  offers: [
    {
      _id: 'o1',
      price: 150,
      stock: 3,
      book: { _id: 'b1', title: 'Pedro Páramo', author: 'Rulfo' },
    },
  ],
};
const BOOKS = {
  items: [
    { _id: 'b1', title: 'Pedro Páramo', author: 'Rulfo' },
    { _id: 'b2', title: 'Aura', author: 'Fuentes' },
  ],
  total: 2,
};

function setup(user = OWNER) {
  const fetchMock = mockFetch((url, options) => {
    if (url.includes('/api/stores/s1')) return jsonResponse(options.method === 'PUT' ? {} : STORE);
    if (url.includes('/api/books')) return jsonResponse(BOOKS);
    if (url.includes('/api/offers')) return jsonResponse({}, options.method === 'POST' ? 201 : 200);
    return jsonResponse({ message: 'No encontrado' }, 404);
  });
  render(
    <AuthContext.Provider value={{ user, isStoreOwner: true }}>
      <MyStoreAdmin />
    </AuthContext.Provider>,
  );
  return fetchMock;
}

function requests(fetchMock, method) {
  return fetchMock.mock.calls
    .filter(([, options]) => options.method === method)
    .map(([url, options]) => ({ url, body: options.body && JSON.parse(options.body) }));
}

describe('MyStoreAdmin', () => {
  it('loads only the owner store and lists its offers by book', async () => {
    const fetchMock = setup();
    expect(await screen.findByRole('heading', { name: 'Librería Centro' })).toBeInTheDocument();
    expect(screen.getByText('Av. Juárez 10')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(within(table).getByText('Pedro Páramo')).toBeInTheDocument();
    const storeCalls = fetchMock.mock.calls.filter(([url]) => url.includes('/api/stores'));
    expect(storeCalls.every(([url]) => url.endsWith('/api/stores/s1'))).toBe(true);
    expect(screen.queryByLabelText(/Establecimiento/)).not.toBeInTheDocument();
  });

  it('adds an offer for a book the store does not sell yet, always for its own store', async () => {
    const user = userEvent.setup();
    const fetchMock = setup();
    const bookSelect = await screen.findByLabelText(/Libro/);
    expect(within(bookSelect).queryByRole('option', { name: /Pedro Páramo/ })).toBeNull();
    await user.selectOptions(bookSelect, 'b2');
    await user.type(screen.getByLabelText(/Precio/), '120');
    await user.click(screen.getByRole('button', { name: 'Agregar oferta' }));
    expect(await screen.findByText('Oferta agregada.')).toBeInTheDocument();
    expect(requests(fetchMock, 'POST')).toEqual([
      { url: '/api/offers', body: { book_id: 'b2', store_id: 's1', price: 120, stock: 1 } },
    ]);
  });

  it('edits the store data with PUT on its own id', async () => {
    const user = userEvent.setup();
    const fetchMock = setup();
    await user.click(await screen.findByRole('button', { name: 'Editar datos' }));
    const phone = screen.getByLabelText('Teléfono');
    await user.clear(phone);
    await user.type(phone, '776 111 2222');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Datos de la librería actualizados.')).toBeInTheDocument();
    const [put] = requests(fetchMock, 'PUT');
    expect(put.url).toBe('/api/stores/s1');
    expect(put.body).toMatchObject({ name: 'Librería Centro', phone: '776 111 2222' });
  });

  it('updates and deletes an offer of the store', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = setup();
    const row = within(await screen.findByRole('table'))
      .getByText('Pedro Páramo')
      .closest('tr');
    await user.click(within(row).getByRole('button', { name: 'Editar' }));
    const price = within(row).getByLabelText('Precio');
    await user.clear(price);
    await user.type(price, '175');
    await user.click(within(row).getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Oferta actualizada.')).toBeInTheDocument();
    expect(requests(fetchMock, 'PUT')).toEqual([
      { url: '/api/offers/o1', body: { book_id: 'b1', store_id: 's1', price: 175, stock: 3 } },
    ]);

    await user.click(within(row).getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Oferta eliminada.')).toBeInTheDocument();
    expect(requests(fetchMock, 'DELETE')).toEqual([{ url: '/api/offers/o1', body: undefined }]);
  });

  it('explains when the account has no store assigned yet', async () => {
    const fetchMock = setup({ ...OWNER, store_id: null });
    expect(await screen.findByText(/no tiene una librería asignada/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
