import { describe, expect, it } from 'vitest';
import {
  countAvailableStores,
  formatBookAvailability,
  formatCopies,
  formatDateTime,
  formatPrice,
  formatStock,
  formatStores,
  lowestPrice,
  offerStock,
  parseStock,
  stockLevel,
  totalStock,
} from './format';

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
      { _id: 'o1', stock: 4, store: { _id: 's1' } },
      { _id: 'o2', stock: 0, store: { _id: 's2' } },
      { _id: 'o3', stock: 1, store: { _id: 's3' } },
      { _id: 'o4', stock: 2 },
    ];
    expect(countAvailableStores(offers)).toBe(3);
    expect(countAvailableStores()).toBe(0);
  });

  it('computes the lowest price', () => {
    expect(lowestPrice({ min_price: 99 })).toBe(99);
    expect(
      lowestPrice({
        offers: [
          { price: 50, stock: 0 },
          { price: 120, stock: 2 },
          { price: 80, stock: 5 },
        ],
      }),
    ).toBe(80);
    expect(lowestPrice({ offers: [{ price: 70, stock: 0 }] })).toBe(70);
    expect(lowestPrice({ offers: [] })).toBeNull();
    expect(lowestPrice(null)).toBeNull();
  });

  it('normalizes offer stock', () => {
    expect(offerStock({ stock: 3 })).toBe(3);
    expect(offerStock({ stock: '2' })).toBe(2);
    expect(offerStock({ stock: -1 })).toBe(0);
    expect(offerStock({})).toBe(0);
    expect(offerStock(null)).toBe(0);
  });

  it('pluralizes copies and stores', () => {
    expect(formatCopies(1)).toBe('1 ejemplar');
    expect(formatCopies(0)).toBe('0 ejemplares');
    expect(formatCopies(12)).toBe('12 ejemplares');
    expect(formatCopies('abc')).toBe('0 ejemplares');
    expect(formatStores(1)).toBe('1 librería');
    expect(formatStores(3)).toBe('3 librerías');
  });

  it('classifies and formats stock levels', () => {
    expect(stockLevel(0)).toBe('out');
    expect(stockLevel(undefined)).toBe('out');
    expect(stockLevel(1)).toBe('low');
    expect(stockLevel(2)).toBe('low');
    expect(stockLevel(3)).toBe('ok');
    expect(formatStock(0)).toBe('Agotado');
    expect(formatStock(1)).toBe('1 ejemplar');
    expect(formatStock(7)).toBe('7 ejemplares');
  });

  it('computes total stock from the API or the offers', () => {
    expect(totalStock({ total_stock: 9, offers: [{ stock: 1 }] })).toBe(9);
    expect(totalStock({ total_stock: null, offers: [{ stock: 2 }, { stock: 3 }] })).toBe(5);
    expect(totalStock({ offers: [{ stock: 0 }] })).toBe(0);
    expect(totalStock(null)).toBe(0);
  });

  it('summarizes book availability for search cards', () => {
    const book = {
      total_stock: 12,
      offers: [
        { stock: 5, store: { _id: 's1' } },
        { stock: 0, store: { _id: 's2' } },
        { stock: 4, store: { _id: 's3' } },
        { stock: 3, store: { _id: 's4' } },
      ],
    };
    expect(formatBookAvailability(book)).toBe('12 ejemplares en 3 librerías');
    expect(formatBookAvailability({ offers: [{ stock: 1, store: { _id: 's1' } }] })).toBe(
      '1 ejemplar en 1 librería',
    );
    expect(formatBookAvailability({ total_stock: 4 })).toBe('4 ejemplares');
    expect(formatBookAvailability({ total_stock: 0, offers: [] })).toBe('Agotado');
    expect(formatBookAvailability({})).toBe('Agotado');
  });

  it('validates stock input', () => {
    expect(parseStock('5')).toEqual({ value: 5 });
    expect(parseStock(' 0 ')).toEqual({ value: 0 });
    expect(parseStock('')).toEqual({ error: 'Indica las existencias.' });
    expect(parseStock(null).error).toBe('Indica las existencias.');
    expect(parseStock('1.5').error).toBe('Las existencias deben ser un número entero.');
    expect(parseStock('abc').error).toBe('Las existencias deben ser un número entero.');
    expect(parseStock('-2').error).toBe('Las existencias no pueden ser negativas.');
  });
});
