import { describe, expect, it, vi } from 'vitest';
import { ApiError, buildQuery, http, request } from './apiClient';
import { jsonResponse, mockFetch } from '../test/mockFetch';

describe('buildQuery', () => {
  it('skips empty values and encodes the rest', () => {
    expect(buildQuery({ q: 'cien años', genre: '', page: 2, x: null, y: undefined })).toBe(
      '?q=cien+a%C3%B1os&page=2',
    );
  });

  it('returns empty string when nothing to send', () => {
    expect(buildQuery()).toBe('');
    expect(buildQuery({ q: '' })).toBe('');
  });
});

describe('request', () => {
  it('sends GET with credentials and parses JSON', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ status: 'ok' }));
    const data = await request('/health');
    expect(data).toEqual({ status: 'ok' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/health');
    expect(options.credentials).toBe('include');
    expect(options.method).toBe('GET');
    expect(options.body).toBeUndefined();
  });

  it('serializes JSON bodies with content type', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ ok: true }, 201));
    await http.post('/books', { title: 'Pedro Páramo' });
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ title: 'Pedro Páramo' });
  });

  it('supports PUT and DELETE helpers and 204 responses', async () => {
    const fetchMock = mockFetch(() => ({ ok: true, status: 204, text: () => Promise.resolve('') }));
    await expect(http.put('/stores/1', { name: 'A' })).resolves.toBeNull();
    await expect(http.delete('/stores/1')).resolves.toBeNull();
    expect(fetchMock.mock.calls.map(([, o]) => o.method)).toEqual(['PUT', 'DELETE']);
  });

  it('returns empty body as null and non-JSON text as string', async () => {
    mockFetch(() => ({ ok: true, status: 200, text: () => Promise.resolve('') }));
    await expect(request('/x')).resolves.toBeNull();
    mockFetch(() => ({ ok: true, status: 200, text: () => Promise.resolve('plain') }));
    await expect(request('/x')).resolves.toBe('plain');
  });

  it('throws ApiError with the server message', async () => {
    mockFetch(() => jsonResponse({ message: 'No autorizado' }, 401));
    const error = await request('/auth/me').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe('No autorizado');
  });

  it('falls back to a generic message when the body has none', async () => {
    mockFetch(() => ({ ok: false, status: 500, text: () => Promise.resolve('boom') }));
    await expect(request('/x')).rejects.toMatchObject({ status: 500, message: 'Error 500' });
  });

  it('wraps network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    await expect(request('/x')).rejects.toMatchObject({ status: 0, name: 'ApiError' });
  });

  it('rethrows aborts untouched', async () => {
    const abort = new DOMException('aborted', 'AbortError');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(abort)),
    );
    await expect(request('/x')).rejects.toBe(abort);
  });
});
