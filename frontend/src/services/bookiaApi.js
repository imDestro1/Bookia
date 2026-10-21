// Resource-level API functions, one per endpoint in api/API_CONTRACT.md.
import { http } from './apiClient';

export const booksApi = {
  search: (params, options) => http.get('/books', { ...options, params }),
  filters: (options) => http.get('/books/filters', options),
  getById: (id, options) => http.get(`/books/${encodeURIComponent(id)}`, options),
  create: (book) => http.post('/books', book),
  update: (id, book) => http.put(`/books/${encodeURIComponent(id)}`, book),
  remove: (id) => http.delete(`/books/${encodeURIComponent(id)}`),
};

export const storesApi = {
  list: (options) => http.get('/stores', options),
  getById: (id, options) => http.get(`/stores/${encodeURIComponent(id)}`, options),
  create: (store) => http.post('/stores', store),
  update: (id, store) => http.put(`/stores/${encodeURIComponent(id)}`, store),
  remove: (id) => http.delete(`/stores/${encodeURIComponent(id)}`),
};

export const offersApi = {
  create: (offer) => http.post('/offers', offer),
  update: (id, offer) => http.put(`/offers/${encodeURIComponent(id)}`, offer),
  remove: (id) => http.delete(`/offers/${encodeURIComponent(id)}`),
};

export const authApi = {
  login: (email, password, portal) => http.post('/auth/login', { email, password, portal }),
  register: (account) => http.post('/auth/register', account),
  logout: () => http.post('/auth/logout'),
  me: () => http.get('/auth/me'),
};

export const favoritesApi = {
  list: (options) => http.get('/favorites', options),
  add: (bookId) => http.put(`/favorites/${encodeURIComponent(bookId)}`),
  remove: (bookId) => http.delete(`/favorites/${encodeURIComponent(bookId)}`),
};

export const auditApi = {
  list: (limit = 50) => http.get('/audit-logs', { params: { limit } }),
};
