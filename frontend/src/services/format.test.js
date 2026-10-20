import { describe, expect, it } from 'vitest';
import { countAvailableStores, formatDateTime, formatPrice, lowestPrice } from './format';

describe('format helpers', () => {
  it('formats prices in MXN', () => {
    expect(formatPrice(150)).toMatch(/\$150\.00 MXN/);
    expect(formatPrice(null)).toBe('—');
    expect(formatPrice('abc')).toBe('—');
  });

  it('formats dates and handles invalid input', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('not a date')).toBe('—');
    expect(formatDateTime('2026-01-15T10:00:00Z')).toMatch(/2026/);
  });

  it('counts distinct stores with availability', () => {
    const offers = [
      { _id: 'o1', is_available: true, store: { _id: 's1' } },
      { _id: 'o2', is_available: false, store: { _id: 's2' } },
      { _id: 'o3', is_available: true, store: { _id: 's3' } },
    ];
    expect(countAvailableStores(offers)).toBe(2);
    expect(countAvailableStores()).toBe(0);
  });

  it('computes the lowest price', () => {
    expect(lowestPrice({ min_price: 99 })).toBe(99);
    expect(
      lowestPrice({
        offers: [
          { price: 50, is_available: false },
          { price: 120, is_available: true },
          { price: 80, is_available: true },
        ],
      }),
    ).toBe(80);
    expect(lowestPrice({ offers: [{ price: 70, is_available: false }] })).toBe(70);
    expect(lowestPrice({ offers: [] })).toBeNull();
    expect(lowestPrice(null)).toBeNull();
  });
});
