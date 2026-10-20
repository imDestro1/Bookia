import { EmptyState, ErrorState, LoadingState } from '../../components/StatusMessages';
import { useAsync } from '../../hooks/useAsync';
import { auditApi } from '../../services/bookiaApi';
import { formatDateTime } from '../../services/format';

const ACTION_LABELS = { create: 'Creación', update: 'Actualización', delete: 'Eliminación' };
const ENTITY_LABELS = { book: 'Libro', store: 'Establecimiento', offer: 'Oferta' };
const ACTION_TONES = {
  create: 'bg-sage-100 text-sage-700',
  update: 'bg-leather-50 text-leather-700',
  delete: 'bg-red-50 text-red-700',
};

function userLabel(user) {
  if (!user) return '—';
  if (typeof user === 'object') return user.email || user._id;
  return user;
}

export default function AuditLogAdmin() {
  const { data, loading, error, reload } = useAsync(() => auditApi.list(50), []);
  const logs = Array.isArray(data) ? data : (data?.items ?? []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-600">Últimos 50 movimientos registrados.</p>
        <button type="button" className="btn-secondary" onClick={reload}>
          Actualizar
        </button>
      </div>
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && logs.length === 0 && (
        <EmptyState title="Sin movimientos registrados" />
      )}
      {!loading && logs.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-100">
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_TONES[log.action] ?? ''}`}
                    >
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">{ENTITY_LABELS[log.entity] ?? log.entity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{log.entity_id}</td>
                  <td className="px-4 py-3">{userLabel(log.user_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
