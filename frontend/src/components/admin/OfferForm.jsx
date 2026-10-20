import { useState } from 'react';

// Form to attach a new offer (store + price + availability) to the selected book.
export default function OfferForm({ stores, onSubmit }) {
  const [storeId, setStoreId] = useState('');
  const [price, setPrice] = useState('');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ store_id: storeId, price: Number(price), is_available: available });
      setStoreId('');
      setPrice('');
      setAvailable(true);
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
      <label className="inline-flex items-center gap-2 py-2 text-sm">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
        />
        Disponible
      </label>
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
