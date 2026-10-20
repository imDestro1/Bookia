import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import OfferForm from './OfferForm';

const STORES = [{ _id: 's1', name: 'Librería Centro' }];

describe('OfferForm', () => {
  it('submits the stock as an integer and never sends is_available', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    render(<OfferForm stores={STORES} onSubmit={onSubmit} />);
    await user.selectOptions(screen.getByLabelText(/Establecimiento/), 's1');
    await user.type(screen.getByLabelText(/Precio/), '199');
    const stock = screen.getByLabelText(/Existencias/);
    await user.clear(stock);
    await user.type(stock, '4');
    await user.click(screen.getByRole('button', { name: 'Agregar oferta' }));
    expect(onSubmit).toHaveBeenCalledWith({ store_id: 's1', price: 199, stock: 4 });
  });

  it('shows a Spanish error for a non-integer stock', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = render(<OfferForm stores={STORES} onSubmit={onSubmit} />);
    await user.selectOptions(screen.getByLabelText(/Establecimiento/), 's1');
    await user.type(screen.getByLabelText(/Precio/), '50');
    const stock = screen.getByLabelText(/Existencias/);
    await user.clear(stock);
    await user.type(stock, '1.5');
    // Bypass native constraint validation to exercise the component's own check.
    container.querySelector('form').noValidate = true;
    await user.click(screen.getByRole('button', { name: 'Agregar oferta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('número entero');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
