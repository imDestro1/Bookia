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
  updateMe: (profile) => http.patch('/auth/me', profile),
};

export const favoritesApi = {
  list: (options) => http.get('/favorites', options),
  add: (bookId) => http.put(`/favorites/${encodeURIComponent(bookId)}`),
  remove: (bookId) => http.delete(`/favorites/${encodeURIComponent(bookId)}`),
};

export const auditApi = {
  list: (limit = 50) => http.get('/audit-logs', { params: { limit } }),
};

// Store owner accounts (admin only).
export const usersApi = {
  list: (options) => http.get('/users', options),
  create: (account) => http.post('/users', account),
  update: (id, changes) => http.patch(`/users/${encodeURIComponent(id)}`, changes),
  remove: (id) => http.delete(`/users/${encodeURIComponent(id)}`),
};

export const reservationsApi = {
  create: (offerId, quantity) => http.post('/reservations', { offer_id: offerId, quantity }),
  mine: (options) => http.get('/reservations/mine', options),
  cancel: (id) => http.patch(`/reservations/${encodeURIComponent(id)}/cancel`),
  manage: (params, options) => http.get('/reservations/manage', { ...options, params }),
  setStatus: (id, status) =>
    http.patch(`/reservations/${encodeURIComponent(id)}/status`, { status }),
};
