import { useState } from 'react';
import Notice from '../../components/admin/Notice';
import OfferForm from '../../components/admin/OfferForm';
import OfferRow from '../../components/admin/OfferRow';
import ResourceForm from '../../components/admin/ResourceForm';
import { EmptyState, ErrorState, LoadingState } from '../../components/StatusMessages';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { useNotice } from '../../hooks/useNotice';
import { booksApi, offersApi, storesApi } from '../../services/bookiaApi';
import { STORE_FIELDS } from './storeFields';

function StoreSummary({ store }) {
  const rows = [
    ['Dirección', store.address],
    ['Teléfono', store.phone],
    ['Horario', store.schedule],
    ['Mapa', store.maps_url],
  ];
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-leather-600">
            {label}
          </dt>
          <dd className="break-words text-stone-700">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

// Store owner section: their store's data and offers. The store is always user.store_id.
export default function MyStoreAdmin() {
  const { user } = useAuth();
  const storeId = user?.store_id ?? '';
  const [editing, setEditing] = useState(false);
  const { notice, success, fail, clear } = useNotice();
  const detail = useAsync(
    ({ signal }) => (storeId ? storesApi.getById(storeId, { signal }) : Promise.resolve(null)),
    [storeId],
  );
  const catalog = useAsync(
    ({ signal }) => (storeId ? booksApi.search({ limit: 100 }, { signal }) : Promise.resolve(null)),
    [storeId],
  );

  if (!storeId) {
    return (
      <EmptyState title="Tu cuenta aún no tiene una librería asignada">
        Pide al administrador de BOOKIA que te asigne tu establecimiento.
      </EmptyState>
    );
  }
  if (detail.loading && !detail.data) return <LoadingState />;
  if (detail.error) return <ErrorState error={detail.error} onRetry={detail.reload} />;

  const store = detail.data;
  const offers = store?.offers ?? [];
  const usedBooks = new Set(offers.map((offer) => offer.book?._id));
  const freeBooks = (catalog.data?.items ?? []).filter((book) => !usedBooks.has(book._id));

  async function handleSaveStore(payload) {
    await storesApi.update(storeId, payload);
    success('Datos de la librería actualizados.');
    setEditing(false);
    detail.reload();
  }

  async function handleCreate(payload) {
    try {
      await offersApi.create({ ...payload, store_id: storeId });
      success('Oferta agregada.');
      detail.reload();
    } catch (err) {
      fail(err);
    }
  }

  async function handleUpdate(offer, changes) {
    try {
      await offersApi.update(offer._id, {
        book_id: offer.book?._id,
        store_id: storeId,
        ...changes,
      });
      success('Oferta actualizada.');
      detail.reload();
    } catch (err) {
      fail(err);
    }
  }

  async function handleDelete(offer) {
    const title = offer.book?.title ?? 'este libro';
    if (!window.confirm(`¿Eliminar la oferta de "${title}"?`)) return;
    try {
      await offersApi.remove(offer._id);
      success('Oferta eliminada.');
      detail.reload();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <section className="space-y-4">
      <Notice notice={notice} onClose={clear} />

      {editing ? (
        <ResourceForm
          title="Editar datos de la librería"
          fields={STORE_FIELDS}
          initial={store}
          onSubmit={handleSaveStore}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="card space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-leather-500">
                Tu librería
              </p>
              <h2 className="font-serif text-2xl font-bold text-leather-800">{store.name}</h2>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
              Editar datos
            </button>
          </div>
          <StoreSummary store={store} />
        </div>
      )}

      <div className="card p-5">
        <h3 className="mb-3 font-serif text-lg font-bold text-leather-800">Nueva oferta</h3>
        {catalog.loading && <LoadingState label="Cargando libros…" />}
        {catalog.error && <ErrorState error={catalog.error} onRetry={catalog.reload} />}
        {!catalog.loading &&
          !catalog.error &&
          (freeBooks.length === 0 ? (
            <p className="text-sm text-stone-600">
              Tu librería ya tiene una oferta para cada libro del catálogo.
            </p>
          ) : (
            <OfferForm books={freeBooks} onSubmit={handleCreate} />
          ))}
      </div>

      {offers.length === 0 ? (
        <EmptyState title="Tu librería aún no tiene ofertas" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
              <tr>
                <th className="px-4 py-3">Libro</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Existencias</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-100">
              {offers.map((offer) => (
                <OfferRow
                  key={offer._id}
                  offer={offer}
                  label={offer.book?.title ?? 'Libro no disponible'}
                  onSave={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
