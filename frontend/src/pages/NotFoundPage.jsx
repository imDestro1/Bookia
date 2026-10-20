import BackLink from '../components/BackLink';
import { EmptyState } from '../components/StatusMessages';

export default function NotFoundPage() {
  return (
    <EmptyState title="Página no encontrada">
      <BackLink to="/">Ir al inicio</BackLink>
    </EmptyState>
  );
}
