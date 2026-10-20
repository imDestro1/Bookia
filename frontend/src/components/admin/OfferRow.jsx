import { useState } from 'react';
import { formatPrice } from '../../services/format';
import AvailabilityBadge from '../AvailabilityBadge';

// One offer row with inline editing of price and availability.
export default function OfferRow({ offer, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(offer.price));
  const [available, setAvailable] = useState(Boolean(offer.is_available));

  async function handleSave() {
    await onSave(offer, { price: Number(price), is_available: available });
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
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Disponible
          </label>
        ) : (
          <AvailabilityBadge available={offer.is_available} />
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
              onClick={() => setEditing(false)}
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
