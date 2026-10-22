import { useEffect, useRef, useState } from 'react';
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
  close: 'M6 6l12 12M18 6 6 18',
};

const quickLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-white/15 text-white' : 'text-leather-100 hover:bg-white/10 hover:text-white'
  }`;

// Main header: brand, quick access, a genre menu and a search box that opens on demand.
export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [genres, setGenres] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const activeGenre = searchParams.get('genre') ?? '';

  // Close the categories panel on outside click or Escape.
  useEffect(() => {
    if (!categoriesOpen) return undefined;
    function handlePointer(event) {
      if (!categoriesRef.current?.contains(event.target)) setCategoriesOpen(false);
    }
    function handleKey(event) {
      if (event.key === 'Escape') setCategoriesOpen(false);
    }
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [categoriesOpen]);

  // Focus the search box when it opens; Escape closes it.
  useEffect(() => {
    if (!searchOpen) return undefined;
    searchInputRef.current?.focus();
    function handleKey(event) {
      if (event.key === 'Escape') setSearchOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [searchOpen]);

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
    setSearchOpen(false);
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
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              aria-controls="header-search-panel"
              aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar'}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                searchOpen
                  ? 'bg-leather-300 text-leather-900'
                  : 'text-leather-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon path={searchOpen ? ICONS.close : ICONS.search} />
              <span className="hidden md:inline" aria-hidden="true">
                Buscar
              </span>
            </button>
            <div ref={categoriesRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen((open) => !open)}
                aria-expanded={categoriesOpen}
                aria-controls="category-panel"
                aria-haspopup="menu"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  categoriesOpen
                    ? 'bg-white/15 text-white'
                    : 'text-leather-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon path={ICONS.menu} />
                <span className="hidden sm:inline">Categorías</span>
              </button>
              {categoriesOpen && (
                <div
                  id="category-panel"
                  role="menu"
                  aria-label="Categorías"
                  className="absolute right-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-leather-100 bg-white p-3 text-ink shadow-xl sm:left-0 sm:right-auto"
                >
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-leather-600">
                    Explora por género
                  </p>
                  {genres.length === 0 ? (
                    <p className="px-2 py-1 text-sm text-stone-500">
                      Aún no hay géneros registrados.
                    </p>
                  ) : (
                    <ul className="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto">
                      {['', ...genres].map((genre) => (
                        <li key={genre || 'all'}>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => goToGenre(genre)}
                            className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition ${
                              activeGenre === genre
                                ? 'bg-leather-100 font-semibold text-leather-800'
                                : 'hover:bg-leather-50 hover:text-leather-700'
                            }`}
                          >
                            {genre || 'Todos los libros'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
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

      {/* Search panel: hidden until the search icon opens it, so the header stays light. */}
      <div
        id="header-search-panel"
        hidden={!searchOpen}
        className="animate-[header-search-in_180ms_ease-out] border-t border-white/5 bg-leather-800"
      >
        {searchOpen && (
          <form
            role="search"
            onSubmit={handleSearch}
            className="relative mx-auto flex max-w-3xl items-center gap-2 px-4 py-3"
          >
            <label htmlFor="header-search" className="sr-only">
              Buscar libros
            </label>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-leather-500">
                <Icon path={ICONS.search} />
              </span>
              <input
                ref={searchInputRef}
                id="header-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Título o autor…"
                className="w-full rounded-full border-0 bg-paper py-2.5 pl-11 pr-24 text-sm text-ink shadow-inner placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-leather-300 sm:text-base"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 rounded-full bg-leather-500 px-4 text-sm font-semibold text-white hover:bg-leather-600"
              >
                Buscar
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
