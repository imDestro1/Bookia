import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const MIN_PASSWORD_LENGTH = 8;

// Asks for the current password and a new one (twice). Calls `onChanged(user)` on success.
export default function ChangePasswordForm({ submitLabel = 'Cambiar contraseña', onChanged }) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function validate() {
    if (next.length < MIN_PASSWORD_LENGTH) {
      return `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (next === current) return 'La nueva contraseña debe ser distinta de la actual.';
    if (next !== confirm) return 'Las contraseñas nuevas no coinciden.';
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setFeedback({ type: 'error', text: problem });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const user = await changePassword({ current_password: current, new_password: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      setFeedback({ type: 'success', text: 'Tu contraseña se actualizó.' });
      onChanged?.(user);
    } catch (err) {
      const text =
        err.status === 400 && err.message === 'Current password is incorrect'
          ? 'La contraseña actual no es correcta.'
          : err.message || 'No se pudo cambiar la contraseña.';
      setFeedback({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="current-password" className="label">
          Contraseña actual
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label htmlFor="new-password" className="label">
          Nueva contraseña
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="input"
        />
        <p className="mt-1 text-xs text-stone-500">
          Mínimo {MIN_PASSWORD_LENGTH} caracteres y distinta de la actual.
        </p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="label">
          Confirma la nueva contraseña
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
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
      <button
        type="submit"
        disabled={saving || !current || !next || !confirm}
        className="btn-primary"
      >
        {saving ? 'Guardando…' : submitLabel}
      </button>
    </form>
  );
}
