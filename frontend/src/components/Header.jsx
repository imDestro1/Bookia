import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-leather-700 text-white' : 'text-leather-100 hover:bg-leather-700/60'
  }`;

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <header className="relative bg-leather-800 text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight">
          BOOK<span className="text-leather-300">IA</span>
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-leather-100 hover:bg-leather-700 md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <nav
          className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-14 z-20 flex-col gap-1 bg-leather-800 px-4 pb-4 md:static md:flex md:flex-row md:items-center md:p-0`}
        >
          <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
            Buscar libros
          </NavLink>
          <NavLink to="/establecimientos" className={linkClass} onClick={() => setOpen(false)}>
            Establecimientos
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                Administración
              </NavLink>
              <span className="hidden px-2 text-xs text-leather-200 lg:inline">{user?.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-leather-100 hover:bg-leather-700/60"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/admin/login" className={linkClass} onClick={() => setOpen(false)}>
              Acceso admin
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
