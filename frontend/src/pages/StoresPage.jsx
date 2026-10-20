import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessages';
import { useAsync } from '../hooks/useAsync';
import { storesApi } from '../services/bookiaApi';

export default function StoresPage() {
  const { data, loading, error, reload } = useAsync(({ signal }) => storesApi.list({ signal }), []);
  const stores = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-bold text-leather-800">Establecimientos</h1>
        <p className="mt-1 text-stone-600">
          Librerías y papelerías de Huauchinango registradas en BOOKIA.
        </p>
      </header>
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && stores.length === 0 && (
        <EmptyState title="Aún no hay establecimientos registrados" />
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <li key={store._id}>
            <Link
              to={`/establecimientos/${store._id}`}
              className="card block h-full p-5 transition hover:border-leather-300 hover:shadow-md"
            >
              <h2 className="font-serif text-lg font-bold text-ink">{store.name}</h2>
              <p className="mt-2 text-sm text-stone-600">{store.address}</p>
              {store.phone && <p className="mt-1 text-sm text-stone-600">Tel. {store.phone}</p>}
              {store.schedule && <p className="mt-1 text-xs text-stone-500">{store.schedule}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
