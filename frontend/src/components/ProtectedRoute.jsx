import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingState } from './StatusMessages';

// Renders child routes only for authenticated admins; otherwise redirects to login.
export default function ProtectedRoute({ children }) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Verificando sesión…" />;
  if (status !== 'authenticated' || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children ?? <Outlet />;
}
