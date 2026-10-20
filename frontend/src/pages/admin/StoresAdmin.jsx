import { useState } from 'react';
import Notice from '../../components/admin/Notice';
import ResourceForm from '../../components/admin/ResourceForm';
import { EmptyState, ErrorState, LoadingState } from '../../components/StatusMessages';
import { useAsync } from '../../hooks/useAsync';
import { useNotice } from '../../hooks/useNotice';
import { storesApi } from '../../services/bookiaApi';

const STORE_FIELDS = [
  { name: 'name', label: 'Nombre', required: true, wide: true },
  { name: 'address', label: 'Dirección', required: true, wide: true },
  { name: 'phone', label: 'Teléfono', type: 'tel' },
  { name: 'schedule', label: 'Horario' },
  { name: 'maps_url', label: 'Enlace de Google Maps', type: 'url', wide: true },
];

export default function StoresAdmin() {
  const [editing, setEditing] = useState(null);
  const { notice, success, fail, clear } = useNotice();
  const { data, loading, error, reload } = useAsync(({ signal }) => storesApi.list({ signal }), []);
  const stores = Array.isArray(data) ? data : [];

  async function handleSave(payload) {
    if (editing._id) await storesApi.update(editing._id, payload);
    else await storesApi.create(payload);
    success(editing._id ? 'Establecimiento actualizado.' : 'Establecimiento creado.');
    setEditing(null);
    reload();
  }

  async function handleDelete(store) {
    if (!window.confirm(`¿Eliminar "${store.name}"? También se eliminarán sus ofertas.`)) return;
    try {
      await storesApi.remove(store._id);
      success('Establecimiento eliminado.');
      reload();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <section className="space-y-4">
      <Notice notice={notice} onClose={clear} />
      <div className="flex justify-end">
        <button type="button" className="btn-primary" onClick={() => setEditing({})}>
          Nuevo establecimiento
        </button>
      </div>
      {editing && (
        <ResourceForm
          title={editing._id ? 'Editar establecimiento' : 'Nuevo establecimiento'}
          fields={STORE_FIELDS}
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && stores.length === 0 && <EmptyState title="No hay establecimientos" />}
      {!loading && stores.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-100">
              {stores.map((store) => (
                <tr key={store._id}>
                  <td className="px-4 py-3 font-semibold">{store.name}</td>
                  <td className="px-4 py-3">{store.address}</td>
                  <td className="px-4 py-3">{store.phone}</td>
                  <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      className="font-semibold text-leather-600 hover:underline"
                      onClick={() => setEditing(store)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-red-600 hover:underline"
                      onClick={() => handleDelete(store)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
