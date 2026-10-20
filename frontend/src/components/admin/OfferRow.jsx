import { useState } from 'react';
import { formatPrice, parseStock } from '../../services/format';
import AvailabilityBadge from '../AvailabilityBadge';

// One offer row with inline editing of price and stock.
export default function OfferRow({ offer, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(offer.price));
  const [stock, setStock] = useState(String(offer.stock ?? 0));
  const [stockError, setStockError] = useState('');

  async function handleSave() {
    const parsed = parseStock(stock);
    if (parsed.error) {
      setStockError(parsed.error);
      return;
    }
    setStockError('');
    await onSave(offer, { price: Number(price), stock: parsed.value });
    setEditing(false);
  }

  function handleCancel() {
    setPrice(String(offer.price));
    setStock(String(offer.stock ?? 0));
    setStockError('');
    setEditing(false);
  }

  return (
    <tr>
      <td className="px-4 py-3 font-semibold">{offer.store?.name}</td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            type="number"
            min="0"
            step="any"
            aria-label="Precio"
            className="input w-28"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        ) : (
          formatPrice(offer.price)
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              aria-label="Existencias"
              aria-invalid={Boolean(stockError)}
              className="input w-24"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            {stockError && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {stockError}
              </p>
            )}
          </div>
        ) : (
          <AvailabilityBadge stock={offer.stock} />
        )}
      </td>
      <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
        {editing ? (
          <>
            <button
              type="button"
              className="font-semibold text-leather-600 hover:underline"
              onClick={handleSave}
            >
              Guardar
            </button>
            <button
              type="button"
              className="font-semibold text-stone-500 hover:underline"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="font-semibold text-leather-600 hover:underline"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
            <button
              type="button"
              className="font-semibold text-red-600 hover:underline"
              onClick={() => onDelete(offer)}
            >
              Eliminar
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
