import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reservationsApi } from '../services/bookiaApi';
import { quantityOptions } from '../services/reservations';

function reserveErrorText(err) {
  if (err?.status === 409) return 'Ya no quedan suficientes ejemplares en esta tienda.';
  if (err?.status === 400 && /active reservations/.test(err.message)) {
    return 'Ya tienes 10 reservas activas. Recoge o cancela alguna para reservar otra.';
  }
  return err?.message || 'No se pudo reservar.';
}

// "Reservar" control on an offer card. Anonymous visitors are sent to the login screen;
// accounts that are not readers (admins, store owners) do not see it.
export default function ReserveButton({ offer, bookId, onReserved }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const options = quantityOptions(offer.stock);

  if (isAuthenticated && user?.role !== 'reader') return null;
  if (options.length === 0 && !feedback) return null;

  async function reserve() {
    if (!isAuthenticated) {
      navigate('/ingresar', { state: { from: { pathname: `/libros/${bookId}` } } });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const reservation = await reservationsApi.create(offer._id, quantity);
      setFeedback({ type: 'success' });
      setQuantity(1);
      onReserved?.(offer._id, reservation?.quantity ?? quantity);
    } catch (err) {
      setFeedback({ type: 'error', text: reserveErrorText(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-leather-100 pt-3">
      {options.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated && options.length > 1 && (
            <label className="flex items-center gap-2 text-sm text-stone-600">
              Cantidad
              <select
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="input w-auto py-1.5"
                aria-label="Cantidad a reservar"
              >
                {options.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" onClick={reserve} disabled={busy} className="btn-primary">
            {busy ? 'Reservando…' : 'Reservar'}
          </button>
        </div>
      )}
      {feedback?.type === 'success' && (
        <p role="status" className="text-sm text-sage-700">
          ¡Listo! Tienes 48 horas para recogerlo y pagarlo en la tienda.{' '}
          <Link to="/mis-reservas" className="font-semibold underline">
            Ver mis reservas
          </Link>
        </p>
      )}
      {feedback?.type === 'error' && (
        <p role="alert" className="text-sm text-red-700">
          {feedback.text}
        </p>
      )}
      {!isAuthenticated && (
        <p className="text-xs text-stone-500">Inicia sesión para apartar el libro por 48 horas.</p>
      )}
    </div>
  );
}
