import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Reader-only pages (favorites, profile): store owners are sent to their panel instead.
export default function ReaderRoute({ children }) {
  const { isStoreOwner } = useAuth();
  if (isStoreOwner) return <Navigate to="/admin" replace />;
  return children ?? <Outlet />;
}
