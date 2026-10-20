import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AvailabilityBadge from './AvailabilityBadge';

describe('AvailabilityBadge', () => {
  it('shows the number of copies in green when stock is plentiful', () => {
    render(<AvailabilityBadge stock={3} />);
    const badge = screen.getByText('3 ejemplares');
    expect(badge).toHaveClass('bg-sage-100');
    expect(screen.queryByText(/Pocas unidades/)).not.toBeInTheDocument();
  });

  it('uses the singular and the low-stock style for 1 copy', () => {
    render(<AvailabilityBadge stock={1} />);
    const badge = screen.getByText(/1 ejemplar/);
    expect(badge).toHaveClass('bg-amber-100');
    expect(screen.getByText(/Pocas unidades/)).toBeInTheDocument();
  });

  it('shows "Agotado" when there is no stock', () => {
    render(<AvailabilityBadge stock={0} />);
    expect(screen.getByText('Agotado')).toHaveClass('bg-stone-200');
  });

  it('treats a missing stock as sold out', () => {
    render(<AvailabilityBadge />);
    expect(screen.getByText('Agotado')).toBeInTheDocument();
  });
});
