import { describe, expect, it } from 'vitest';
import { validateInitialOffer } from './offerValidation';

const valid = { enabled: true, store_id: 's1', price: '150', stock: '2' };

describe('validateInitialOffer', () => {
  it('accepts a complete offer or a skipped one', () => {
    expect(validateInitialOffer(valid)).toBe('');
    expect(validateInitialOffer({ enabled: false, store_id: '', price: '', stock: '' })).toBe('');
  });

  it.each([
    [{ store_id: '' }, /librería/],
    [{ price: '0' }, /mayor a 0/],
    [{ price: '' }, /mayor a 0/],
    [{ stock: '1.5' }, /entero/],
    [{ stock: '-1' }, /entero/],
  ])('rejects %o', (patch, message) => {
    expect(validateInitialOffer({ ...valid, ...patch })).toMatch(message);
  });
});
