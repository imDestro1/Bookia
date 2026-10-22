import ReservationsManager from '../../components/ReservationsManager';
import { useAuth } from '../../hooks/useAuth';

// Admins see every store's reservations; a store owner only sees their own store's.
export default function ReservationsAdmin() {
  const { isAdmin } = useAuth();
  return <ReservationsManager showStoreFilter={isAdmin} />;
}
