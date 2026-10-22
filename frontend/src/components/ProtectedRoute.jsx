import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingState } from './StatusMessages';

// Renders child routes only for signed-in admins and store owners; otherwise redirects to login.
// With `role`, only that role gets through and the other panel users go back to /admin.
// Accounts that still use the initial password are sent to the change-password screen first.
export default function ProtectedRoute({ role, children }) {
  const { status, isAdmin, isStoreOwner, mustChangePassword } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Verificando sesión…" />;
  if (status !== 'authenticated' || !(isAdmin || isStoreOwner)) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (mustChangePassword) {
    return <Navigate to="/cambiar-contrasena" replace state={{ from: location }} />;
  }
  const allowed = { admin: isAdmin, store_owner: isStoreOwner };
  if (role && !allowed[role]) return <Navigate to="/admin" replace />;
  return children ?? <Outlet />;
}
