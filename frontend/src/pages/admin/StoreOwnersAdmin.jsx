import { useState } from 'react';
import Notice from '../../components/admin/Notice';
import { EmptyState, ErrorState, LoadingState } from '../../components/StatusMessages';
import { useAsync } from '../../hooks/useAsync';
import { useNotice } from '../../hooks/useNotice';
import { storesApi, usersApi } from '../../services/bookiaApi';

const EMPTY_OWNER = { name: '', email: '', password: '', store_id: '' };

function createErrorMessage(err) {
  if (err.status === 409) return 'Ya existe una cuenta con ese correo.';
  return err.message || 'No se pudo crear la cuenta.';
}

function StoreSelect({ id, stores, value, onChange, label = 'Librería' }) {
  return (
    <select id={id} required className="input" aria-label={label} value={value} onChange={onChange}>
      <option value="">Selecciona…</option>
      {stores.map((store) => (
        <option key={store._id} value={store._id}>
          {store.name}
        </option>
      ))}
    </select>
  );
}

// Create form for a store owner account: name, email, initial password and assigned store.
function OwnerForm({ stores, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY_OWNER);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim() });
    } catch (err) {
      setError(createErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="font-serif text-lg font-bold text-leather-800">Nuevo dueño de tienda</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="owner-name" className="label">
            Nombre *
          </label>
          <input
            id="owner-name"
            name="name"
            required
            maxLength={80}
            className="input"
            value={values.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="owner-email" className="label">
            Correo electrónico *
          </label>
          <input
            id="owner-email"
            name="email"
            type="email"
            autoComplete="off"
            required
            className="input"
            value={values.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="owner-password" className="label">
            Contraseña inicial *
          </label>
          <input
            id="owner-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={200}
            aria-describedby="owner-password-hint"
            className="input"
            value={values.password}
            onChange={handleChange}
          />
          <p id="owner-password-hint" className="mt-1 text-xs text-stone-500">
            Mínimo 8 caracteres. Compártela con el dueño por un medio seguro.
          </p>
        </div>
        <div>
          <label htmlFor="owner-store" className="label">
            Librería *
          </label>
          <select
            id="owner-store"
            name="store_id"
            required
            className="input"
            value={values.store_id}
            onChange={handleChange}
          >
            <option value="">Selecciona…</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Crear cuenta'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// One owner account with inline reassignment of its store (kept open if the change fails).
function OwnerRow({ owner, stores, onReassign, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [storeId, setStoreId] = useState(owner.store_id ?? '');

  async function handleSave() {
    if (await onReassign(owner, storeId)) setEditing(false);
  }

  function handleCancel() {
    setStoreId(owner.store_id ?? '');
    setEditing(false);
  }

  return (
    <tr>
      <td className="px-4 py-3 font-semibold">
        {owner.name}
        {owner.must_change_password && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Debe cambiar contraseña
          </span>
        )}
      </td>
      <td className="px-4 py-3">{owner.email}</td>
      <td className="px-4 py-3">
        {editing ? (
          <StoreSelect
            id={`owner-store-${owner._id}`}
            label={`Librería de ${owner.name}`}
            stores={stores}
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          />
        ) : (
          (owner.store?.name ?? <span className="text-stone-500">Sin librería asignada</span>)
        )}
      </td>
      <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
        {editing ? (
          <>
            <button
              type="button"
              className="font-semibold text-leather-600 hover:underline disabled:opacity-50"
              disabled={!storeId}
              onClick={handleSave}
            >
              Guardar
            </button>
            <button
              type="button"
              className="font-semibold text-stone-500 hover:underline"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="font-semibold text-leather-600 hover:underline"
              onClick={() => setEditing(true)}
            >
              Cambiar librería
            </button>
            <button
              type="button"
              className="font-semibold text-red-600 hover:underline"
              onClick={() => onDelete(owner)}
            >
              Eliminar
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

async function loadOwnersAndStores({ signal }) {
  const [owners, stores] = await Promise.all([
    usersApi.list({ signal }),
    storesApi.list({ signal }),
  ]);
  return { owners: owners?.items ?? [], stores: Array.isArray(stores) ? stores : [] };
}

// Admin section to manage store owner accounts and the store each one runs.
export default function StoreOwnersAdmin() {
  const [creating, setCreating] = useState(false);
  const { notice, success, fail, clear } = useNotice();
  const { data, loading, error, reload } = useAsync(loadOwnersAndStores, []);
  const owners = data?.owners ?? [];
  const stores = data?.stores ?? [];

  async function handleCreate(account) {
    const result = await usersApi.create(account);
    success(`Cuenta creada para ${result?.user?.email ?? account.email}.`);
    setCreating(false);
    reload();
  }

  async function handleReassign(owner, storeId) {
    try {
      await usersApi.update(owner._id, { store_id: storeId });
      success(`Librería de ${owner.name} actualizada.`);
      reload();
      return true;
    } catch (err) {
      fail(err);
      return false;
    }
  }

  async function handleDelete(owner) {
    if (!window.confirm(`¿Eliminar la cuenta de "${owner.email}"? Ya no podrá entrar al panel.`)) {
      return;
    }
    try {
      await usersApi.remove(owner._id);
      success('Cuenta eliminada.');
      reload();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <section className="space-y-4">
      <Notice notice={notice} onClose={clear} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-600">
          Cada dueño entra por el acceso al panel y solo gestiona su librería y sus ofertas.
        </p>
        <button
          type="button"
          className="btn-primary"
          disabled={loading || stores.length === 0}
          onClick={() => setCreating(true)}
        >
          Nuevo dueño
        </button>
      </div>
      {!loading && !error && stores.length === 0 && (
        <p className="text-sm text-stone-600">
          Primero registra un establecimiento para poder asignarle un dueño.
        </p>
      )}
      {creating && (
        <OwnerForm stores={stores} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}
      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && owners.length === 0 && (
        <EmptyState title="Aún no hay dueños de tienda registrados" />
      )}
      {!loading && owners.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-leather-50 text-xs uppercase tracking-wide text-leather-700">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Librería</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-100">
              {owners.map((owner) => (
                <OwnerRow
                  key={owner._id}
                  owner={owner}
                  stores={stores}
                  onReassign={handleReassign}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
