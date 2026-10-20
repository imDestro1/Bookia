import { Link, useParams } from 'react-router-dom';
import AvailabilityBadge from '../components/AvailabilityBadge';
import BackLink from '../components/BackLink';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessages';
import { useAsync } from '../hooks/useAsync';
import { storesApi } from '../services/bookiaApi';
import { formatPrice } from '../services/format';

export default function StoreDetailPage() {
  const { id } = useParams();
  const {
    data: store,
    loading,
    error,
    reload,
  } = useAsync(({ signal }) => storesApi.getById(id, { signal }), [id]);

  if (loading) return <LoadingState />;
  if (error) {
    return error.status === 404 ? (
      <EmptyState title="Establecimiento no encontrado">
        <BackLink to="/establecimientos">Ver todos los establecimientos</BackLink>
      </EmptyState>
    ) : (
      <ErrorState error={error} onRetry={reload} />
    );
  }

  const offers = store.offers ?? [];

  return (
    <div className="space-y-6">
      <BackLink to="/establecimientos">Todos los establecimientos</BackLink>
      <section className="card p-6 sm:p-8">
        <h1 className="font-serif text-3xl font-bold text-ink">{store.name}</h1>
        <div className="mt-3 space-y-1 text-stone-600">
          {store.address && <p>{store.address}</p>}
          {store.phone && (
            <p>
              Tel.{' '}
              <a href={`tel:${store.phone}`} className="text-leather-600 hover:underline">
                {store.phone}
              </a>
            </p>
          )}
          {store.schedule && <p>Horario: {store.schedule}</p>}
        </div>
        {store.maps_url && (
          <a
            href={store.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-4"
          >
            Ver en mapa
          </a>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-bold text-leather-800">
          Libros en este establecimiento
        </h2>
        {offers.length === 0 ? (
          <EmptyState title="Este establecimiento aún no tiene libros registrados" />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
                <tr>
                  <th className="px-4 py-3">Libro</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-leather-100">
                {offers.map((offer) => (
                  <tr key={offer._id}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/libros/${offer.book?._id}`}
                        className="font-semibold text-ink hover:text-leather-700"
                      >
                        {offer.book?.title}
                      </Link>
                      <p className="text-xs text-stone-500">{offer.book?.author}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-leather-700">
                      {formatPrice(offer.price)}
                    </td>
                    <td className="px-4 py-3">
                      <AvailabilityBadge available={offer.is_available} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
