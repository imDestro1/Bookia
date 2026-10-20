// Display helpers shared across pages.

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

export function formatPrice(value) {
  const number = Number(value);
  if (value === null || value === undefined || Number.isNaN(number)) return '—';
  return `${currencyFormatter.format(number)} MXN`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

// Number of distinct stores where the book is currently available.
export function countAvailableStores(offers = []) {
  const ids = new Set(
    offers.filter((offer) => offer.is_available).map((offer) => offer.store?._id ?? offer._id),
  );
  return ids.size;
}

// Lowest price among available offers, falling back to any offer.
export function lowestPrice(book) {
  if (book?.min_price !== undefined && book?.min_price !== null) return book.min_price;
  const offers = book?.offers || [];
  const pool = offers.some((o) => o.is_available) ? offers.filter((o) => o.is_available) : offers;
  if (!pool.length) return null;
  return Math.min(...pool.map((o) => Number(o.price)));
}
