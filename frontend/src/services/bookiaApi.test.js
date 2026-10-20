import { describe, expect, it } from 'vitest';
import { auditApi, authApi, booksApi, offersApi, storesApi } from './bookiaApi';
import { jsonResponse, mockFetch } from '../test/mockFetch';

function calls(fetchMock) {
  return fetchMock.mock.calls.map(([url, options]) => `${options.method} ${url}`);
}

describe('bookiaApi', () => {
  it('maps book endpoints', async () => {
    const fetchMock = mockFetch(() => jsonResponse({}));
    await booksApi.search({ q: 'rulfo', genre: '', min_price: 100, page: 1, limit: 12 });
    await booksApi.filters();
    await booksApi.getById('abc');
    await booksApi.create({ title: 'T' });
    await booksApi.update('abc', { title: 'T' });
    await booksApi.remove('abc');
    expect(calls(fetchMock)).toEqual([
      'GET /api/books?q=rulfo&min_price=100&page=1&limit=12',
      'GET /api/books/filters',
      'GET /api/books/abc',
      'POST /api/books',
      'PUT /api/books/abc',
      'DELETE /api/books/abc',
    ]);
  });

  it('maps store, offer, auth and audit endpoints', async () => {
    const fetchMock = mockFetch(() => jsonResponse({}));
    await storesApi.list();
    await storesApi.getById('s1');
    await storesApi.create({ name: 'S' });
    await storesApi.update('s1', { name: 'S' });
    await storesApi.remove('s1');
    await offersApi.create({ book_id: 'b', store_id: 's', price: 10, is_available: true });
    await offersApi.update('o1', { price: 5 });
    await offersApi.remove('o1');
    await authApi.login('a@b.mx', 'secret');
    await authApi.me();
    await authApi.logout();
    await auditApi.list();
    expect(calls(fetchMock)).toEqual([
      'GET /api/stores',
      'GET /api/stores/s1',
      'POST /api/stores',
      'PUT /api/stores/s1',
      'DELETE /api/stores/s1',
      'POST /api/offers',
      'PUT /api/offers/o1',
      'DELETE /api/offers/o1',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/logout',
      'GET /api/audit-logs?limit=50',
    ]);
    expect(JSON.parse(fetchMock.mock.calls[8][1].body)).toEqual({
      email: 'a@b.mx',
      password: 'secret',
    });
  });
});
