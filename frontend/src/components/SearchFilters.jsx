import { useEffect, useState } from 'react';

const EMPTY = { q: '', genre: '', publisher: '', store_id: '', min_price: '', max_price: '' };

// Search box plus filters. Local state is committed on submit via onApply.
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
    onApply(values);
  }

  function handleClear() {
    setValues(EMPTY);
    setError('');
    onClear?.();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-6" role="search">
      <div className="flex flex-col gap-3 sm:flex-row">
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
          className="input py-3 text-base"
        />
        <button type="submit" className="btn-primary py-3 sm:px-8">
          Buscar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
        <div>
          <label htmlFor="min_price" className="label">
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
          <label htmlFor="max_price" className="label">
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {error ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-semibold text-leather-600 hover:underline"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
