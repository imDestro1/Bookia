import { useState } from 'react';
import Notice from '../../components/admin/Notice';
import ResourceForm from '../../components/admin/ResourceForm';
import Pagination from '../../components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../../components/StatusMessages';
import { useAsync } from '../../hooks/useAsync';
import { useNotice } from '../../hooks/useNotice';
import { booksApi } from '../../services/bookiaApi';

const LIMIT = 20;
const BOOK_FIELDS = [
  { name: 'title', label: 'Título', required: true, wide: true },
  { name: 'author', label: 'Autor', required: true },
  { name: 'genre', label: 'Género' },
  { name: 'publisher', label: 'Editorial' },
  { name: 'edition', label: 'Edición' },
  { name: 'isbn', label: 'ISBN' },
];

export default function BooksAdmin() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const { notice, success, fail, clear } = useNotice();
  const { data, loading, error, reload } = useAsync(
    ({ signal }) => booksApi.search({ q: search, page, limit: LIMIT }, { signal }),
    [search, page],
  );
  const books = data?.items ?? [];

  async function handleSave(payload) {
    if (editing._id) await booksApi.update(editing._id, payload);
    else await booksApi.create(payload);
    success(editing._id ? 'Libro actualizado.' : 'Libro creado.');
    setEditing(null);
    reload();
  }

  async function handleDelete(book) {
    if (!window.confirm(`¿Eliminar "${book.title}"? También se eliminarán sus ofertas.`)) return;
    try {
      await booksApi.remove(book._id);
      success('Libro eliminado.');
      reload();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <section className="space-y-4">
      <Notice notice={notice} onClose={clear} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
        >
          <label htmlFor="admin-book-search" className="sr-only">
            Buscar libro
          </label>
          <input
            id="admin-book-search"
            type="search"
            className="input"
            placeholder="Buscar por título o autor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-secondary">
            Buscar
          </button>
        </form>
        <button type="button" className="btn-primary" onClick={() => setEditing({})}>
          Nuevo libro
        </button>
      </div>

      {editing && (
        <ResourceForm
          title={editing._id ? 'Editar libro' : 'Nuevo libro'}
          fields={BOOK_FIELDS}
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && books.length === 0 && <EmptyState title="No hay libros" />}
      {!loading && books.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Género</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-100">
              {books.map((book) => (
                <tr key={book._id}>
                  <td className="px-4 py-3 font-semibold">{book.title}</td>
                  <td className="px-4 py-3">{book.author}</td>
                  <td className="px-4 py-3">{book.genre}</td>
                  <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      className="font-semibold text-leather-600 hover:underline"
                      onClick={() => setEditing(book)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-red-600 hover:underline"
                      onClick={() => handleDelete(book)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} total={data?.total ?? 0} limit={LIMIT} onChange={setPage} />
    </section>
  );
}
