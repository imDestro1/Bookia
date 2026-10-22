// Low-level fetch wrapper for the BOOKIA REST API.

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Builds a query string skipping empty values.
export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function parseBody(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request(path, { method = 'GET', body, params, signal } = {}) {
  const headers = { Accept: 'application/json' };
  const options = { method, headers, credentials: 'include', signal };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}${buildQuery(params)}`, options);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  const data = await parseBody(response);
  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && data.message) || `Error ${response.status}`;
    throw new ApiError(message, response.status, data);
  }
  return data;
}

export const http = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
