import { describe, expect, it } from 'vitest';
import { isActiveReservation, managerActions, quantityOptions } from './reservations';

describe('reservation helpers', () => {
  it('offers quantities up to the stock, capped at 5', () => {
    expect(quantityOptions(0)).toEqual([]);
    expect(quantityOptions(2)).toEqual([1, 2]);
    expect(quantityOptions(40)).toEqual([1, 2, 3, 4, 5]);
    expect(quantityOptions('x')).toEqual([]);
  });

  it('treats pending and confirmed reservations as active', () => {
    expect(isActiveReservation({ status: 'pendiente' })).toBe(true);
    expect(isActiveReservation({ status: 'confirmada' })).toBe(true);
    expect(isActiveReservation({ status: 'vencida' })).toBe(false);
  });

  it('lists the manager actions allowed from each status', () => {
    expect(managerActions({ status: 'pendiente' }).map(([s]) => s)).toEqual([
      'confirmada',
      'entregada',
      'cancelada',
    ]);
    expect(managerActions({ status: 'confirmada' }).map(([s]) => s)).toEqual([
      'entregada',
      'cancelada',
    ]);
    expect(managerActions({ status: 'entregada' })).toEqual([]);
  });
});
