import { useState } from 'react';
import { parseStock } from '../../services/format';

// Form to attach a new offer (store + price + stock) to the selected book.
export default function OfferForm({ stores, onSubmit }) {
  const [storeId, setStoreId] = useState('');
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
      await onSubmit({ store_id: storeId, price: Number(price), stock: parsed.value });
      setStoreId('');
      setPrice('');
      setStock('1');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-4 sm:items-end">
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
