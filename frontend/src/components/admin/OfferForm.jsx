import { useState } from 'react';
import { parseStock } from '../../services/format';

// Form to attach a new offer (price + stock) plus a store (`stores`) and/or a book (`books`).
// Pass only `books` when the store is fixed (store owner panel), only `stores` when the book is.
export default function OfferForm({ stores, books, onSubmit }) {
  const [storeId, setStoreId] = useState('');
  const [bookId, setBookId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [stockError, setStockError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const parsed = parseStock(stock);
    if (parsed.error) {
      setStockError(parsed.error);
      return;
    }
    setStockError('');
    setSaving(true);
    try {
      const target = {};
      if (books) target.book_id = bookId;
      if (stores) target.store_id = storeId;
      await onSubmit({ ...target, price: Number(price), stock: parsed.value });
      setStoreId('');
      setBookId('');
      setPrice('');
      setStock('1');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-4 sm:items-end">
      {books && (
        <div className="sm:col-span-2">
          <label htmlFor="offer-book-id" className="label">
            Libro *
          </label>
          <select
            id="offer-book-id"
            required
            className="input"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
          >
            <option value="">Selecciona…</option>
            {books.map((book) => (
              <option key={book._id} value={book._id}>
                {book.title} — {book.author}
              </option>
            ))}
          </select>
        </div>
      )}
      {stores && (
        <div className="sm:col-span-2">
          <label htmlFor="offer-store" className="label">
            Establecimiento *
          </label>
          <select
            id="offer-store"
            required
            className="input"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          >
            <option value="">Selecciona…</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="offer-price" className="label">
          Precio (MXN) *
        </label>
        <input
          id="offer-price"
          type="number"
          min="0"
          step="any"
          required
          className="input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="offer-stock" className="label">
          Existencias *
        </label>
        <input
          id="offer-stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          required
          aria-invalid={Boolean(stockError)}
          aria-describedby={stockError ? 'offer-stock-error' : undefined}
          className="input"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        {stockError && (
          <p id="offer-stock-error" role="alert" className="mt-1 text-xs text-red-700">
            {stockError}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="btn-primary sm:col-span-4 sm:justify-self-start"
        disabled={saving}
      >
        {saving ? 'Guardando…' : 'Agregar oferta'}
      </button>
    </form>
  );
}
