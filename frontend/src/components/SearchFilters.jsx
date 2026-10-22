import { useEffect, useRef, useState } from 'react';

const EMPTY = { q: '', genre: '', publisher: '', store_id: '', min_price: '', max_price: '' };
const FILTER_FIELDS = ['genre', 'publisher', 'store_id', 'min_price', 'max_price'];

const FilterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

const CloseIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

// Human label for an applied filter, shown as a removable chip.
function chipLabel(key, value, stores) {
  if (key === 'store_id') return stores.find((store) => store._id === value)?.name ?? 'Librería';
  if (key === 'min_price') return `Desde $${value}`;
  if (key === 'max_price') return `Hasta $${value}`;
  return value;
}

// Search box with a "Filtros" button; the filters live in a side drawer that opens on demand.
// Local state is committed on submit via onApply.
export default function SearchFilters({
  filters,
  genres = [],
  publishers = [],
  stores = [],
  onApply,
  onClear,
}) {
  const [values, setValues] = useState({ ...EMPTY, ...filters });
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const activeFilters = FILTER_FIELDS.filter((key) => filters?.[key]);

  // While the drawer is open: focus it, lock page scroll and close on Escape.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    drawerRef.current?.querySelector('select, input')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKey(event) {
      if (event.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [drawerOpen]);

  useEffect(() => {
    setValues({ ...EMPTY, ...filters });
  }, [filters]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const min = values.min_price === '' ? null : Number(values.min_price);
    const max = values.max_price === '' ? null : Number(values.max_price);
    if ((min !== null && min < 0) || (max !== null && max < 0)) {
      setError('Los precios no pueden ser negativos.');
      return;
    }
    if (min !== null && max !== null && min > max) {
      setError('El precio mínimo no puede ser mayor que el máximo.');
      return;
    }
    setError('');
    setDrawerOpen(false);
    onApply(values);
  }

  function removeFilter(key) {
    onApply({ ...EMPTY, ...filters, [key]: '' });
  }

  function handleClear() {
    setValues(EMPTY);
    setError('');
    setDrawerOpen(false);
    onClear?.();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-3 sm:p-4" role="search">
      <div className="flex gap-2">
        <label htmlFor="q" className="sr-only">
          Título o autor
        </label>
        <input
          id="q"
          name="q"
          type="search"
          value={values.q}
          onChange={handleChange}
          placeholder="Busca por título o autor…"
          className="input min-w-0 py-3 text-base"
        />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="filters-drawer"
          aria-label={activeFilters.length ? `Filtros, ${activeFilters.length} activos` : 'Filtros'}
          className="btn-secondary relative shrink-0 py-3"
        >
          <FilterIcon />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilters.length > 0 && (
            <span
              className="grid h-5 min-w-5 place-items-center rounded-full bg-leather-600 px-1.5 text-[11px] font-bold text-white"
              aria-hidden="true"
            >
              {activeFilters.length}
            </span>
          )}
        </button>
        <button type="submit" className="btn-primary shrink-0 py-3 sm:px-8">
          Buscar
        </button>
      </div>

      {error && !drawerOpen && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {activeFilters.length > 0 && (
        <ul aria-label="Filtros activos" className="mt-3 flex flex-wrap items-center gap-2">
          {activeFilters.map((key) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => removeFilter(key)}
                className="flex items-center gap-1 rounded-full bg-leather-50 py-1 pl-3 pr-2 text-sm font-medium text-leather-800 ring-1 ring-leather-200 transition hover:bg-leather-100"
                aria-label={`Quitar filtro ${chipLabel(key, filters[key], stores)}`}
              >
                {chipLabel(key, filters[key], stores)}
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={handleClear}
              className="px-1 text-sm font-semibold text-leather-600 hover:underline"
            >
              Limpiar filtros
            </button>
          </li>
        </ul>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 animate-[fade-in_200ms_ease-out] bg-leather-900/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            id="filters-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-drawer-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm animate-[drawer-in_220ms_ease-out] flex-col bg-paper shadow-2xl sm:rounded-l-3xl"
          >
            <div className="flex items-center justify-between border-b border-leather-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-leather-500">
                  Afina tu búsqueda
                </p>
                <h2 id="filters-drawer-title" className="font-serif text-2xl font-bold text-ink">
                  Filtros
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar filtros"
                className="grid h-10 w-10 place-items-center rounded-full text-leather-700 hover:bg-leather-100"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div>
                <label htmlFor="genre" className="label">
                  Género
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={values.genre}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Todos</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="publisher" className="label">
                  Editorial
                </label>
                <select
                  id="publisher"
                  name="publisher"
                  value={values.publisher}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Todas</option>
                  {publishers.map((publisher) => (
                    <option key={publisher} value={publisher}>
                      {publisher}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="store_id" className="label">
                  Establecimiento
                </label>
                <select
                  id="store_id"
                  name="store_id"
                  value={values.store_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Todos</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <fieldset>
                <legend className="label">Precio (MXN)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="min_price" className="mb-1 block text-xs text-stone-500">
                      Precio mín.
                    </label>
                    <input
                      id="min_price"
                      name="min_price"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={values.min_price}
                      onChange={handleChange}
                      placeholder="$0"
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="max_price" className="mb-1 block text-xs text-stone-500">
                      Precio máx.
                    </label>
                    <input
                      id="max_price"
                      name="max_price"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={values.max_price}
                      onChange={handleChange}
                      placeholder="Sin límite"
                      className="input"
                    />
                  </div>
                </div>
              </fieldset>
              {error && (
                <p role="alert" className="text-sm font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-leather-100 bg-white px-5 py-4">
              <button type="button" onClick={handleClear} className="btn-secondary flex-1">
                Limpiar
              </button>
              <button type="submit" className="btn-primary flex-1">
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
