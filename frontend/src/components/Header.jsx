import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { booksApi } from '../services/bookiaApi';

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  menu: 'M4 7h16M4 12h16M4 17h10',
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm9 3-4.3-4.3',
  store: 'M4 10h16l-1.5-5h-13L4 10zm1 0v9h14v-9M9 19v-5h6v5',
  heart: 'M12 20s-7-4.4-9.3-9A5.4 5.4 0 0 1 12 5.5a5.4 5.4 0 0 1 9.3 5.5C19 15.6 12 20 12 20z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
};

const quickLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-white/15 text-white' : 'text-leather-100 hover:bg-white/10 hover:text-white'
  }`;

// Main header: brand + quick access, a big search bar and a genre (category) strip.
export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [genres, setGenres] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const activeGenre = searchParams.get('genre') ?? '';

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    booksApi
      .filters({ signal: controller.signal })
      .then((data) => setGenres(Array.isArray(data?.genres) ? data.genres : []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    navigate(`/${params.toString() ? `?${params}` : ''}`);
  }

  function goToGenre(genre) {
    setCategoriesOpen(false);
    navigate(genre ? `/?genre=${encodeURIComponent(genre)}` : '/');
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const firstName = (user?.name || user?.email || '').split(/[\s@]/)[0];

  return (
    <header className="sticky top-0 z-30 shadow-md">
      <div className="bg-leather-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight">
            BOOK<span className="text-leather-300">IA</span>
            <span className="ml-2 hidden align-middle font-sans text-[11px] font-medium uppercase tracking-widest text-leather-300 sm:inline">
              Huauchinango
            </span>
          </Link>
          <nav aria-label="Accesos" className="flex items-center gap-1">
            <NavLink to="/establecimientos" className={quickLinkClass}>
              <Icon path={ICONS.store} />
              <span className="hidden sm:inline">Librerías</span>
            </NavLink>
            <NavLink to="/favoritos" className={quickLinkClass}>
              <Icon path={ICONS.heart} />
              <span className="hidden sm:inline">Favoritos</span>
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={quickLinkClass}>
                <Icon path={ICONS.shield} />
                <span className="hidden md:inline">Administración</span>
              </NavLink>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <span className="flex items-center gap-1.5 px-2 text-sm text-leather-100">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-leather-400 text-xs font-bold uppercase text-leather-900">
                    {firstName.slice(0, 1)}
                  </span>
                  <span className="hidden lg:inline">Hola, {firstName}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-leather-100 hover:bg-white/10"
                >
                  Salir
                </button>
              </div>
            ) : (
              <NavLink to="/ingresar" className={quickLinkClass}>
                <Icon path={ICONS.user} />
                <span className="hidden sm:inline">Mi cuenta</span>
              </NavLink>
            )}
          </nav>
        </div>
      </div>

      <div className="bg-leather-800">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setCategoriesOpen((open) => !open)}
            aria-expanded={categoriesOpen}
            aria-controls="category-panel"
            className="flex shrink-0 items-center gap-2 rounded-full bg-leather-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-leather-600"
          >
            <Icon path={ICONS.menu} />
            <span className="hidden sm:inline">Categorías</span>
          </button>
          <form role="search" onSubmit={handleSearch} className="relative flex-1">
            <label htmlFor="header-search" className="sr-only">
              Buscar libros
            </label>
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-leather-500">
              <Icon path={ICONS.search} />
            </span>
            <input
              id="header-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="¿Qué libro buscas hoy?"
              className="w-full rounded-full border-0 bg-paper py-2.5 pl-11 pr-24 text-sm text-ink shadow-inner placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-leather-300 sm:text-base"
            />
            <button
              type="submit"
              className="absolute inset-y-1 right-1 rounded-full bg-leather-500 px-4 text-sm font-semibold text-white hover:bg-leather-600"
            >
              Buscar
            </button>
          </form>
        </div>

        {genres.length > 0 && (
          <div
            id="category-panel"
            className={`${categoriesOpen ? 'block' : 'hidden'} border-t border-white/10 md:block`}
          >
            <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-2 md:flex-nowrap md:overflow-x-auto">
              {['', ...genres].map((genre) => (
                <button
                  key={genre || 'all'}
                  type="button"
                  onClick={() => goToGenre(genre)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    activeGenre === genre
                      ? 'border-leather-300 bg-leather-300 text-leather-900'
                      : 'border-white/20 text-leather-100 hover:border-leather-300 hover:text-white'
                  }`}
                >
                  {genre || 'Todos'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
