import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { tabsForRole } from './adminTabs';

const tabClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-leather-600 text-white' : 'text-leather-700 hover:bg-leather-50'
  }`;

// /admin lands on the first section available to the signed-in role.
export function AdminIndexRedirect() {
  const { user } = useAuth();
  const [first] = tabsForRole(user?.role);
  return first ? <Navigate to={first.to} replace /> : <Navigate to="/" replace />;
}

export default function AdminLayout() {
  const { user, isStoreOwner } = useAuth();
  const tabs = tabsForRole(user?.role);
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-serif text-3xl font-bold text-leather-800">
          {isStoreOwner ? 'Panel de mi tienda' : 'Administración'}
        </h1>
        <p className="text-sm text-stone-600">Sesión: {user?.email}</p>
      </header>
      <nav
        aria-label="Secciones de administración"
        className="card flex gap-1 overflow-x-auto p-1.5"
      >
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={tabClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
