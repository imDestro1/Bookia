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
  it('submits the search text and selected filters', async () => {
    const { onApply, user } = renderFilters();
    await user.type(screen.getByPlaceholderText(/título o autor/i), 'Rulfo');
    await user.selectOptions(screen.getByLabelText('Género'), 'Novela');
    await user.selectOptions(screen.getByLabelText('Establecimiento'), 's1');
    await user.type(screen.getByLabelText('Precio máx.'), '250');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onApply).toHaveBeenCalledWith({
      ...EMPTY,
      q: 'Rulfo',
      genre: 'Novela',
      store_id: 's1',
      max_price: '250',
    });
  });

  it('rejects a minimum price greater than the maximum', async () => {
    const { onApply, user } = renderFilters();
    await user.type(screen.getByLabelText('Precio mín.'), '300');
    await user.type(screen.getByLabelText('Precio máx.'), '100');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/mínimo no puede ser mayor/);
  });

  it('shows values from the URL and clears them', async () => {
    const { onClear, user } = renderFilters({ filters: { ...EMPTY, q: 'Paz' } });
    expect(screen.getByPlaceholderText(/título o autor/i)).toHaveValue('Paz');
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClear).toHaveBeenCalled();
    expect(screen.getByPlaceholderText(/título o autor/i)).toHaveValue('');
  });
});
