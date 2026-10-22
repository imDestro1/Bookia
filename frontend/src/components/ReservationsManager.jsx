import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { useNotice } from '../hooks/useNotice';
import { reservationsApi, storesApi } from '../services/bookiaApi';
import { formatDateTime, formatPrice } from '../services/format';
import { RESERVATION_STATUS, managerActions } from '../services/reservations';
import Notice from './admin/Notice';
import ReservationStatusBadge from './ReservationStatusBadge';
import { EmptyState, ErrorState, LoadingState } from './StatusMessages';

// Reservation desk for admins (every store, with a store filter) and store owners
// (the API only returns their store's reservations, so `showStoreFilter` is off for them).
export default function ReservationsManager({ showStoreFilter = false }) {
  const [status, setStatus] = useState('pendiente');
  const [storeId, setStoreId] = useState('');
  const [busyId, setBusyId] = useState(null);
  const { notice, success, fail, clear } = useNotice();
  const stores = useAsync(
    ({ signal }) => (showStoreFilter ? storesApi.list({ signal }) : Promise.resolve([])),
    [showStoreFilter],
  );
  const { data, loading, error, reload } = useAsync(
    ({ signal }) => reservationsApi.manage({ status, store_id: storeId }, { signal }),
    [status, storeId],
  );
  const items = data?.items ?? [];

  async function changeStatus(reservation, nextStatus) {
    setBusyId(reservation._id);
    clear();
    try {
      await reservationsApi.setStatus(reservation._id, nextStatus);
      success(
        `Reserva de «${reservation.book?.title ?? 'libro'}» marcada como ${RESERVATION_STATUS[
          nextStatus
        ].label.toLowerCase()}.`,
      );
      reload();
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="reservation-status" className="label">
            Estado
          </label>
          <select
            id="reservation-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="input w-auto"
          >
            <option value="">Todos</option>
            {Object.entries(RESERVATION_STATUS).map(([value, info]) => (
              <option key={value} value={value}>
                {info.label}
              </option>
            ))}
          </select>
        </div>
        {showStoreFilter && (
          <div>
            <label htmlFor="reservation-store" className="label">
              Establecimiento
            </label>
            <select
              id="reservation-store"
              value={storeId}
              onChange={(event) => setStoreId(event.target.value)}
              className="input w-auto"
            >
              <option value="">Todos</option>
              {(stores.data ?? []).map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="button" className="btn-secondary ml-auto" onClick={reload}>
          Actualizar
        </button>
      </div>
      <Notice notice={notice} onClose={clear} />
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="No hay reservas con este filtro" />
      )}
      {!loading && !error && items.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
              <tr>
                <th className="px-4 py-3">Libro</th>
                <th className="px-4 py-3">Lector</th>
                {showStoreFilter && <th className="px-4 py-3">Tienda</th>}
                <th className="px-4 py-3">Cant.</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Vence</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-100">
              {items.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {reservation.book?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <p>{reservation.user?.name || '—'}</p>
                    <p className="text-xs text-stone-500">{reservation.user?.email}</p>
                  </td>
                  {showStoreFilter && <td className="px-4 py-3">{reservation.store?.name}</td>}
                  <td className="px-4 py-3">{reservation.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {typeof reservation.price === 'number'
                      ? formatPrice(reservation.price * reservation.quantity)
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDateTime(reservation.expires_at)}
                  </td>
                  <td className="px-4 py-3">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {managerActions(reservation).map(([nextStatus, label]) => (
                        <button
                          key={nextStatus}
                          type="button"
                          disabled={busyId === reservation._id}
                          onClick={() => changeStatus(reservation, nextStatus)}
                          className={`btn px-2.5 py-1 text-xs ${
                            nextStatus === 'cancelada'
                              ? 'border border-red-200 bg-white text-red-700 hover:bg-red-50'
                              : 'btn-secondary'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
