import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StoreOwnersAdmin from './StoreOwnersAdmin';
import { jsonResponse, mockFetch } from '../../test/mockFetch';

const STORES = [
  { _id: 's1', name: 'Librería Centro' },
  { _id: 's2', name: 'El Rincón' },
];
const ROSA = {
  _id: 'u2',
  email: 'rosa@bookia.mx',
  name: 'Rosa',
  role: 'store_owner',
  store_id: 's1',
  store: { _id: 's1', name: 'Librería Centro' },
};

function setup({ createStatus = 201 } = {}) {
  let owners = [ROSA];
  const fetchMock = mockFetch((url, options) => {
    if (url.endsWith('/api/stores')) return jsonResponse(STORES);
    if (url.endsWith('/api/users') && options.method === 'GET')
      return jsonResponse({ items: owners });
    if (url.endsWith('/api/users') && options.method === 'POST') {
      if (createStatus !== 201) return jsonResponse({ message: 'Email existente' }, createStatus);
      const body = JSON.parse(options.body);
      const user = { _id: 'u3', role: 'store_owner', ...body, store: STORES[1] };
      owners = [...owners, user];
      return jsonResponse({ user }, 201);
    }
    if (url.endsWith('/api/users/u2') && options.method === 'PATCH') {
      owners = [{ ...ROSA, store_id: 's2', store: STORES[1] }];
      return jsonResponse({ user: owners[0] });
    }
    if (url.endsWith('/api/users/u2') && options.method === 'DELETE') {
      owners = [];
      return { ok: true, status: 204, text: () => Promise.resolve('') };
    }
    return jsonResponse({ message: 'No encontrado' }, 404);
  });
  render(<StoreOwnersAdmin />);
  return fetchMock;
}

async function fillCreateForm(user) {
  await user.click(await screen.findByRole('button', { name: 'Nuevo dueño' }));
  await user.type(screen.getByLabelText(/Nombre/), 'Luis');
  await user.type(screen.getByLabelText(/Correo electrónico/), 'luis@bookia.mx');
  await user.type(screen.getByLabelText(/Contraseña inicial/), 'secret123');
  await user.selectOptions(screen.getByLabelText('Librería *'), 's2');
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
}

describe('StoreOwnersAdmin', () => {
  it('lists owner accounts with their store', async () => {
    setup();
    const row = (await screen.findByText('rosa@bookia.mx')).closest('tr');
    expect(within(row).getByText('Librería Centro')).toBeInTheDocument();
  });

  it('creates an owner account for the chosen store', async () => {
    const user = userEvent.setup();
    const fetchMock = setup();
    await fillCreateForm(user);
    expect(await screen.findByText('Cuenta creada para luis@bookia.mx.')).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([, options]) => options.method === 'POST');
    expect(JSON.parse(post[1].body)).toEqual({
      name: 'Luis',
      email: 'luis@bookia.mx',
      password: 'secret123',
      store_id: 's2',
    });
    expect(await screen.findByText('luis@bookia.mx')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Crear cuenta' })).not.toBeInTheDocument();
  });

  it('shows a friendly error when the email already exists', async () => {
    const user = userEvent.setup();
    setup({ createStatus: 409 });
    await fillCreateForm(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con ese correo.',
    );
  });

  it('reassigns an owner to another store', async () => {
    const user = userEvent.setup();
    const fetchMock = setup();
    const row = (await screen.findByText('rosa@bookia.mx')).closest('tr');
    await user.click(within(row).getByRole('button', { name: 'Cambiar librería' }));
    await user.selectOptions(within(row).getByLabelText('Librería de Rosa'), 's2');
    await user.click(within(row).getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Librería de Rosa actualizada.')).toBeInTheDocument();
    const patch = fetchMock.mock.calls.find(([, options]) => options.method === 'PATCH');
    expect(JSON.parse(patch[1].body)).toEqual({ store_id: 's2' });
    expect(await within(row).findByText('El Rincón')).toBeInTheDocument();
  });

  it('deletes an owner account only after confirming', async () => {
    const user = userEvent.setup();
    const confirm = vi
      .spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const fetchMock = setup();
    const row = (await screen.findByText('rosa@bookia.mx')).closest('tr');
    await user.click(within(row).getByRole('button', { name: 'Eliminar' }));
    expect(fetchMock.mock.calls.some(([, options]) => options.method === 'DELETE')).toBe(false);
    await user.click(within(row).getByRole('button', { name: 'Eliminar' }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('Cuenta eliminada.')).toBeInTheDocument();
    expect(await screen.findByText('Aún no hay dueños de tienda registrados')).toBeInTheDocument();
  });
});
