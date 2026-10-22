import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReservationStatusBadge from '../components/ReservationStatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessages';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';
import { reservationsApi } from '../services/bookiaApi';
import { formatCopies, formatDateTime, formatPrice } from '../services/format';
import { isActiveReservation } from '../services/reservations';

// Reader's reservations: what they set aside, where to pick it up and until when.
export default function MyReservationsPage() {
  const { status, isAuthenticated } = useAuth();
  const reservations = useAsync(
    ({ signal }) => (isAuthenticated ? reservationsApi.mine({ signal }) : Promise.resolve(null)),
    [isAuthenticated],
  );
  const [updated, setUpdated] = useState({});
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState(null);

  if (status === 'loading') return <LoadingState />;
  if (!isAuthenticated) {
    return (
      <EmptyState title="Inicia sesión para ver tus reservas">
        <Link to="/ingresar" className="btn-primary mt-3">
          Inicia sesión o crea una cuenta
        </Link>
      </EmptyState>
    );
  }
  if (reservations.loading) return <LoadingState />;
  if (reservations.error) {
    return <ErrorState error={reservations.error} onRetry={reservations.reload} />;
  }

  const items = (reservations.data?.items ?? []).map((item) => updated[item._id] ?? item);

  async function cancel(reservation) {
    setCancelling(reservation._id);
    setError(null);
    try {
      const result = await reservationsApi.cancel(reservation._id);
      setUpdated((prev) => ({ ...prev, [reservation._id]: { ...reservation, ...result } }));
    } catch (err) {
      setError(err.message || 'No se pudo cancelar la reserva.');
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-leather-800">Mis reservas</h1>
        <p className="mt-1 text-sm text-stone-600">
          Una reserva aparta los ejemplares 48 horas. Recógelos y págalos directamente en la tienda.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <EmptyState title="Aún no tienes reservas">
          Abre un libro y toca «Reservar» en la tienda donde quieras recogerlo.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((reservation) => {
            const active = isActiveReservation(reservation);
            return (
              <li key={reservation._id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/libros/${reservation.book_id}`}
                      className="font-serif text-lg font-bold text-ink hover:text-leather-700"
                    >
                      {reservation.book?.title ?? 'Libro no disponible'}
                    </Link>
                    {reservation.book?.author && (
                      <p className="text-sm text-stone-600">{reservation.book.author}</p>
                    )}
                  </div>
                  <ReservationStatusBadge status={reservation.status} />
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-leather-600">Tienda</dt>
                    <dd>
                      <Link
                        to={`/establecimientos/${reservation.store_id}`}
                        className="text-leather-700 hover:underline"
                      >
                        {reservation.store?.name ?? '—'}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-leather-600">Cantidad</dt>
                    <dd>{formatCopies(reservation.quantity)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-leather-600">Total</dt>
                    <dd>
                      {typeof reservation.price === 'number'
                        ? formatPrice(reservation.price * reservation.quantity)
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-leather-600">
                      {active ? 'Recoger antes de' : 'Reservado el'}
                    </dt>
                    <dd>
                      {formatDateTime(active ? reservation.expires_at : reservation.created_at)}
                    </dd>
                  </div>
                </dl>
                {active && reservation.store?.address && (
                  <p className="text-sm text-stone-600">{reservation.store.address}</p>
                )}
                {active && (
                  <button
                    type="button"
                    onClick={() => cancel(reservation)}
                    disabled={cancelling === reservation._id}
                    className="btn-secondary self-start"
                  >
                    {cancelling === reservation._id ? 'Cancelando…' : 'Cancelar reserva'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
