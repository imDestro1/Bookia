import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchFilters from './SearchFilters';

const EMPTY = { q: '', genre: '', publisher: '', store_id: '', min_price: '', max_price: '' };

function renderFilters(props = {}) {
  const onApply = vi.fn();
  const onClear = vi.fn();
  render(
    <SearchFilters
      filters={EMPTY}
      genres={['Novela', 'Poesía']}
      publishers={['Planeta']}
      stores={[{ _id: 's1', name: 'Librería Centro' }]}
      onApply={onApply}
      onClear={onClear}
      {...props}
    />,
  );
  return { onApply, onClear, user: userEvent.setup() };
}

describe('SearchFilters', () => {
  it('keeps filters hidden until the Filtros button opens the drawer', async () => {
    const { user } = renderFilters();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Género')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Filtros/ }));
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('submits the search text and selected filters from the drawer', async () => {
    const { onApply, user } = renderFilters();
    await user.type(screen.getByPlaceholderText(/título o autor/i), 'Rulfo');
    await user.click(screen.getByRole('button', { name: /Filtros/ }));
    await user.selectOptions(screen.getByLabelText('Género'), 'Novela');
    await user.selectOptions(screen.getByLabelText('Establecimiento'), 's1');
    await user.type(screen.getByLabelText('Precio máx.'), '250');
    await user.click(screen.getByRole('button', { name: 'Ver resultados' }));
    expect(onApply).toHaveBeenCalledWith({
      ...EMPTY,
      q: 'Rulfo',
      genre: 'Novela',
      store_id: 's1',
      max_price: '250',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('rejects a minimum price greater than the maximum', async () => {
    const { onApply, user } = renderFilters();
    await user.click(screen.getByRole('button', { name: /Filtros/ }));
    await user.type(screen.getByLabelText('Precio mín.'), '300');
    await user.type(screen.getByLabelText('Precio máx.'), '100');
    await user.click(screen.getByRole('button', { name: 'Ver resultados' }));
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/mínimo no puede ser mayor/);
  });

  it('shows applied filters as chips that can be removed or cleared', async () => {
    const applied = { ...EMPTY, q: 'Paz', genre: 'Poesía', store_id: 's1' };
    const { onApply, onClear, user } = renderFilters({ filters: applied });
    expect(screen.getByPlaceholderText(/título o autor/i)).toHaveValue('Paz');
    expect(screen.getByRole('button', { name: 'Filtros, 2 activos' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar filtro Librería Centro' }));
    expect(onApply).toHaveBeenCalledWith({ ...applied, store_id: '' });

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClear).toHaveBeenCalled();
    expect(screen.getByPlaceholderText(/título o autor/i)).toHaveValue('');
  });
});
