import { vi } from 'vitest';

// Builds a minimal Response-like object for fetch mocks.
export function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  };
}

// Stubs global fetch with a handler (url, options) => response.
export function mockFetch(handler) {
  const fn = vi.fn((url, options) => Promise.resolve(handler(String(url), options)));
  vi.stubGlobal('fetch', fn);
  return fn;
}
