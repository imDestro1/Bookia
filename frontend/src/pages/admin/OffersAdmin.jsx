import { useState } from 'react';
import Notice from '../../components/admin/Notice';
import OfferForm from '../../components/admin/OfferForm';
import OfferRow from '../../components/admin/OfferRow';
import { EmptyState, ErrorState, LoadingState } from '../../components/StatusMessages';
import { useAsync } from '../../hooks/useAsync';
import { useNotice } from '../../hooks/useNotice';
import { booksApi, offersApi, storesApi } from '../../services/bookiaApi';

async function loadCatalog({ signal }) {
  const [books, stores] = await Promise.all([
    booksApi.search({ limit: 100 }, { signal }),
    storesApi.list({ signal }),
  ]);
  return { books: books?.items ?? [], stores: Array.isArray(stores) ? stores : [] };
}

export default function OffersAdmin() {
  const [bookId, setBookId] = useState('');
  const { notice, success, fail, clear } = useNotice();
  const catalog = useAsync(loadCatalog, []);
  const detail = useAsync(
    ({ signal }) => (bookId ? booksApi.getById(bookId, { signal }) : Promise.resolve(null)),
    [bookId],
  );

  const stores = catalog.data?.stores ?? [];
  const offers = detail.data?.offers ?? [];
  const usedStores = new Set(offers.map((offer) => offer.store?._id));
  const freeStores = stores.filter((store) => !usedStores.has(store._id));

  async function handleCreate(payload) {
    try {
      await offersApi.create({ ...payload, book_id: bookId });
      success('Oferta agregada.');
      detail.reload();
    } catch (err) {
      fail(err);
    }
  }

  async function handleUpdate(offer, changes) {
    try {
      await offersApi.update(offer._id, {
        book_id: bookId,
        store_id: offer.store?._id,
        ...changes,
      });
      success('Oferta actualizada.');
      detail.reload();
    } catch (err) {
      fail(err);
    }
  }

  async function handleDelete(offer) {
    if (!window.confirm(`¿Eliminar la oferta de "${offer.store?.name}"?`)) return;
    try {
      await offersApi.remove(offer._id);
      success('Oferta eliminada.');
      detail.reload();
    } catch (err) {
      fail(err);
    }
  }

  if (catalog.loading) return <LoadingState />;
  if (catalog.error) return <ErrorState error={catalog.error} onRetry={catalog.reload} />;

  return (
    <section className="space-y-4">
      <Notice notice={notice} onClose={clear} />
      <div className="card p-5">
        <label htmlFor="offer-book" className="label">
          Libro
        </label>
        <select
          id="offer-book"
          className="input"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
        >
          <option value="">Selecciona un libro…</option>
          {catalog.data.books.map((book) => (
            <option key={book._id} value={book._id}>
              {book.title} — {book.author}
            </option>
          ))}
        </select>
      </div>

      {!bookId && <EmptyState title="Selecciona un libro para ver y editar sus ofertas" />}
      {bookId && detail.loading && <LoadingState />}
      {bookId && detail.error && <ErrorState error={detail.error} onRetry={detail.reload} />}
      {bookId && detail.data && (
        <>
          <div className="card p-5">
            <h3 className="mb-3 font-serif text-lg font-bold text-leather-800">Nueva oferta</h3>
            {freeStores.length === 0 ? (
              <p className="text-sm text-stone-600">
                Todos los establecimientos ya tienen una oferta para este libro.
              </p>
            ) : (
              <OfferForm stores={freeStores} onSubmit={handleCreate} />
            )}
          </div>
          {offers.length === 0 ? (
            <EmptyState title="Este libro aún no tiene ofertas" />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
                  <tr>
                    <th className="px-4 py-3">Establecimiento</th>
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
                      onSave={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
