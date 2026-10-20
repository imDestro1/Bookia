import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessages';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';
import { favoritesApi } from '../services/bookiaApi';

export default function FavoritesPage() {
  const { status, isAuthenticated } = useAuth();
  const favorites = useAsync(
    ({ signal }) => (isAuthenticated ? favoritesApi.list({ signal }) : Promise.resolve(null)),
    [isAuthenticated],
  );

  if (status === 'loading') return <LoadingState />;
  if (!isAuthenticated) {
    return (
      <EmptyState title="Guarda tus libros favoritos">
        <Link to="/ingresar" className="btn-primary mt-3">
          Inicia sesión o crea una cuenta
        </Link>
      </EmptyState>
    );
  }
  if (favorites.loading) return <LoadingState />;
  if (favorites.error) return <ErrorState error={favorites.error} onRetry={favorites.reload} />;

  const items = favorites.data?.items ?? [];
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-bold text-leather-800">Mis favoritos</h1>
      {items.length === 0 ? (
        <EmptyState title="Aún no tienes favoritos">
          Abre un libro y toca «Guardar en favoritos».
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((book) => (
            <li key={book._id}>
              <Link
                to={`/libros/${book._id}`}
                className="card block p-5 transition hover:border-leather-300 hover:shadow-md"
              >
                {book.genre && (
                  <span className="text-xs font-semibold text-leather-600">{book.genre}</span>
                )}
                <p className="font-serif text-lg font-bold text-ink">{book.title}</p>
                <p className="text-sm text-stone-600">{book.author}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
