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

// Copies of an offer, normalized to a non-negative integer.
export function offerStock(offer) {
  const stock = Math.floor(Number(offer?.stock));
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
}

// "1 ejemplar" / "3 ejemplares".
export function formatCopies(count) {
  const n = Math.max(0, Math.floor(Number(count)) || 0);
  return n === 1 ? '1 ejemplar' : `${n} ejemplares`;
}

// "1 librería" / "3 librerías".
export function formatStores(count) {
  return count === 1 ? '1 librería' : `${count} librerías`;
}

export const LOW_STOCK_THRESHOLD = 2;

// Stock level used to style badges: 'out' (0), 'low' (1-2) or 'ok'.
export function stockLevel(stock) {
  const n = Math.max(0, Math.floor(Number(stock)) || 0);
  if (n === 0) return 'out';
  return n <= LOW_STOCK_THRESHOLD ? 'low' : 'ok';
}

// Text for a single offer's stock: "3 ejemplares" or "Agotado".
export function formatStock(stock) {
  return stockLevel(stock) === 'out' ? 'Agotado' : formatCopies(stock);
}

// Number of distinct stores where the book has stock.
export function countAvailableStores(offers = []) {
  const ids = new Set(
    offers.filter((offer) => offerStock(offer) > 0).map((offer) => offer.store?._id ?? offer._id),
  );
  return ids.size;
}

// Total copies of a book: total_stock from the API, else the sum of offer stock.
export function totalStock(book) {
  const fromApi = Number(book?.total_stock);
  if (book?.total_stock !== undefined && book?.total_stock !== null && Number.isFinite(fromApi)) {
    return Math.max(0, fromApi);
  }
  return (book?.offers || []).reduce((sum, offer) => sum + offerStock(offer), 0);
}

// Summary for search cards: "12 ejemplares en 3 librerías" or "Agotado".
export function formatBookAvailability(book) {
  const total = totalStock(book);
  if (total === 0) return 'Agotado';
  const stores = countAvailableStores(book?.offers);
  return stores > 0 ? `${formatCopies(total)} en ${formatStores(stores)}` : formatCopies(total);
}

// Validates a stock input value; returns { value } or { error } (Spanish).
export function parseStock(input) {
  const text = String(input ?? '').trim();
  if (text === '') return { error: 'Indica las existencias.' };
  const n = Number(text);
  if (!Number.isInteger(n)) return { error: 'Las existencias deben ser un número entero.' };
  if (n < 0) return { error: 'Las existencias no pueden ser negativas.' };
  return { value: n };
}

// Lowest price among offers with stock, falling back to any offer.
export function lowestPrice(book) {
  if (book?.min_price !== undefined && book?.min_price !== null) return book.min_price;
  const offers = book?.offers || [];
  const inStock = offers.filter((o) => offerStock(o) > 0);
  const pool = inStock.length ? inStock : offers;
  if (!pool.length) return null;
  return Math.min(...pool.map((o) => Number(o.price)));
}
