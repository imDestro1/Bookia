// Panel sections per role. The first tab is where /admin lands.
// To add a section, append it here and register its route in App.jsx.
export const ADMIN_TABS = {
  admin: [
    { to: 'libros', label: 'Libros' },
    { to: 'establecimientos', label: 'Establecimientos' },
    { to: 'ofertas', label: 'Ofertas' },
    { to: 'duenos', label: 'Dueños' },
    { to: 'bitacora', label: 'Bitácora' },
  ],
  store_owner: [{ to: 'mi-tienda', label: 'Mi tienda' }],
};

export function tabsForRole(role) {
  return ADMIN_TABS[role] ?? [];
}
