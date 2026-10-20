import { Link, useParams } from 'react-router-dom';
import AvailabilityBadge from '../components/AvailabilityBadge';
import BackLink from '../components/BackLink';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessages';
import { useAsync } from '../hooks/useAsync';
import { booksApi } from '../services/bookiaApi';
import { formatPrice, offerStock } from '../services/format';

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-leather-600">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

function sortOffers(offers) {
  return [...offers].sort(
    (a, b) => Number(offerStock(b) > 0) - Number(offerStock(a) > 0) || a.price - b.price,
  );
}

export default function BookDetailPage() {
  const { id } = useParams();
  const {
    data: book,
    loading,
    error,
    reload,
  } = useAsync(({ signal }) => booksApi.getById(id, { signal }), [id]);

  if (loading) return <LoadingState />;
  if (error) {
    return error.status === 404 ? (
      <EmptyState title="Libro no encontrado">
        <BackLink to="/">Volver a la búsqueda</BackLink>
      </EmptyState>
    ) : (
      <ErrorState error={error} onRetry={reload} />
    );
  }

  const offers = sortOffers(book.offers ?? []);

  return (
    <div className="space-y-6">
      <BackLink to="/">Volver a la búsqueda</BackLink>
      <article className="card p-6 sm:p-8">
        {book.genre && (
          <span className="rounded-full bg-leather-50 px-2.5 py-0.5 text-xs font-semibold text-leather-700">
            {book.genre}
          </span>
        )}
        <h1 className="mt-3 font-serif text-3xl font-bold text-ink sm:text-4xl">{book.title}</h1>
        <p className="mt-1 text-lg text-stone-600">{book.author}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Meta label="Editorial" value={book.publisher} />
          <Meta label="Edición" value={book.edition} />
          <Meta label="ISBN" value={book.isbn} />
          <Meta label="Género" value={book.genre} />
        </dl>
      </article>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-bold text-leather-800">Dónde conseguirlo</h2>
        {offers.length === 0 ? (
          <EmptyState title="Ningún establecimiento lo ofrece por ahora" />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {offers.map((offer) => (
              <li key={offer._id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/establecimientos/${offer.store?._id}`}
                    className="font-serif text-lg font-bold text-ink hover:text-leather-700"
                  >
                    {offer.store?.name}
                  </Link>
                  <AvailabilityBadge stock={offer.stock} />
                </div>
                <p className="text-2xl font-bold text-leather-700">{formatPrice(offer.price)}</p>
                <div className="space-y-1 text-sm text-stone-600">
                  {offer.store?.address && <p>{offer.store.address}</p>}
                  {offer.store?.phone && (
                    <p>
                      Tel.{' '}
                      <a
                        href={`tel:${offer.store.phone}`}
                        className="text-leather-600 hover:underline"
                      >
                        {offer.store.phone}
                      </a>
                    </p>
                  )}
                  {offer.store?.schedule && <p>Horario: {offer.store.schedule}</p>}
                </div>
                {offer.store?.maps_url && (
                  <a
                    href={offer.store.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary self-start"
                  >
                    Ver en mapa
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
