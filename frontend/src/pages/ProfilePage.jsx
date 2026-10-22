import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState, LoadingState } from '../components/StatusMessages';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/useAuth';
import { favoritesApi } from '../services/bookiaApi';

const ROLE_LABELS = { admin: 'Administrador', reader: 'Lector', store_owner: 'Dueño de tienda' };

function formatJoinDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-MX', { dateStyle: 'long' });
}

// Signed-in user's profile: account details, a name editor and shortcuts.
export default function ProfilePage() {
  const { user, status, isAuthenticated, isAdmin, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const favorites = useAsync(
    ({ signal }) => (isAuthenticated ? favoritesApi.list({ signal }) : Promise.resolve(null)),
    [isAuthenticated],
  );

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  if (status === 'loading') return <LoadingState />;
  if (!isAuthenticated) {
    return (
      <EmptyState title="Inicia sesión para ver tu perfil">
        <Link to="/ingresar" className="btn-primary mt-3">
          Inicia sesión o crea una cuenta
        </Link>
      </EmptyState>
    );
  }

  const trimmedName = name.trim();
  const canSave = trimmedName !== '' && trimmedName !== (user?.name ?? '') && !saving;
  const displayName = user?.name || user?.email || '';
  const joinDate = formatJoinDate(user?.created_at);
  const favoriteCount = favorites.data?.items?.length;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile({ name: trimmedName });
      setFeedback({ type: 'success', text: 'Tu nombre se actualizó.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'No se pudo guardar el nombre.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-leather-400 font-serif text-3xl font-bold uppercase text-leather-900">
          {displayName.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-bold text-leather-800">{displayName}</h1>
          <p className="truncate text-sm text-stone-600">{user?.email}</p>
          <p className="mt-2 flex flex-wrap justify-center gap-2 text-xs sm:justify-start">
            <span className="rounded-full bg-leather-100 px-2.5 py-1 font-semibold text-leather-800">
              {ROLE_LABELS[user?.role] ?? user?.role}
            </span>
            {joinDate && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-600">
                Miembro desde {joinDate}
              </span>
            )}
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-5">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 md:col-span-3">
          <h2 className="font-serif text-xl font-bold text-leather-800">Datos de la cuenta</h2>
          <div>
            <label htmlFor="profile-name" className="label">
              Nombre
            </label>
            <input
              id="profile-name"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="label">
              Correo electrónico
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              disabled
              className="input bg-stone-50 text-stone-500"
            />
          </div>
          {feedback && (
            <p
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={`text-sm ${feedback.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}
            >
              {feedback.text}
            </p>
          )}
          <button type="submit" disabled={!canSave} className="btn-primary">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>

        <section className="card space-y-3 p-6 md:col-span-2">
          <h2 className="font-serif text-xl font-bold text-leather-800">Accesos</h2>
          <Link to="/favoritos" className="btn-secondary w-full justify-between">
            <span>Mis favoritos</span>
            {typeof favoriteCount === 'number' && (
              <span className="rounded-full bg-leather-100 px-2 text-xs text-leather-800">
                {favoriteCount}
              </span>
            )}
          </Link>
          {user?.role === 'reader' && (
            <Link to="/mis-reservas" className="btn-secondary w-full">
              Mis reservas
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="btn-secondary w-full">
              Panel de administración
            </Link>
          )}
          <button type="button" onClick={handleLogout} className="btn-secondary w-full">
            Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  );
}
