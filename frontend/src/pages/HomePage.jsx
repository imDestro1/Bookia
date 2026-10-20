import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import SearchFilters from '../components/SearchFilters';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessages';
import { useAsync } from '../hooks/useAsync';
import { PAGE_SIZE, useSearchFilters } from '../hooks/useSearchFilters';
import { booksApi, storesApi } from '../services/bookiaApi';

async function loadFilterOptions({ signal }) {
  const [filterData, stores] = await Promise.all([
    booksApi.filters({ signal }).catch(() => ({ genres: [], publishers: [] })),
    storesApi.list({ signal }).catch(() => []),
  ]);
  return { ...filterData, stores: Array.isArray(stores) ? stores : [] };
}

export default function HomePage() {
  const { filters, page, applyFilters, setPage, clearFilters } = useSearchFilters();
  const options = useAsync(loadFilterOptions, []);
  const queryKey = JSON.stringify({ ...filters, page });
  const results = useAsync(
    ({ signal }) => booksApi.search({ ...filters, page, limit: PAGE_SIZE }, { signal }),
    [queryKey],
  );

  const items = results.data?.items ?? [];
  const total = results.data?.total ?? 0;
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-leather-700 to-leather-900 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-leather-200">
          Huauchinango, Puebla
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-5xl">
          Encuentra libros en Huauchinango
        </h1>
        <p className="mt-3 max-w-2xl text-leather-100">
          Consulta en un solo lugar qué librerías tienen el libro que buscas, a qué precio y si está
          disponible.
        </p>
      </section>

      <SearchFilters
        filters={filters}
        genres={options.data?.genres}
        publishers={options.data?.publishers}
        stores={options.data?.stores}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      <section aria-live="polite">
        {results.loading && <LoadingState label="Buscando libros…" />}
        {results.error && <ErrorState error={results.error} onRetry={results.reload} />}
        {!results.loading && !results.error && (
          <>
            <p className="mb-4 text-sm text-stone-600">
              {total === 1 ? '1 libro encontrado' : `${total} libros encontrados`}
            </p>
            {items.length === 0 ? (
              <EmptyState title="No encontramos libros">
                {hasFilters
                  ? 'Prueba con otras palabras o quita algunos filtros.'
                  : 'Aún no hay libros registrados.'}
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
            <Pagination
              page={results.data?.page ?? page}
              total={total}
              limit={results.data?.limit ?? PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}
