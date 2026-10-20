import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLoginPage() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname || '/admin';

  if (isAdmin) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password, 'admin');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.status === 401) setError('Correo o contraseña incorrectos.');
      else if (err.status === 403) setError('Esta cuenta no es de administrador.');
      else setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <form
        onSubmit={handleSubmit}
        className="card space-y-4 border-t-4 border-t-leather-700 bg-leather-50/40 p-6 sm:p-8"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-leather-500">
            Panel de establecimientos
          </p>
          <h1 className="font-serif text-2xl font-bold text-leather-800">
            Acceso de administración
          </h1>
          <p className="mt-1 text-sm text-stone-600">Inicia sesión para gestionar el catálogo.</p>
        </div>
        <div>
          <label htmlFor="email" className="label">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Iniciar sesión'}
        </button>
        <p className="text-center text-sm text-stone-600">
          ¿Eres lector?{' '}
          <Link to="/ingresar" className="font-semibold text-leather-600 hover:underline">
            Entra aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
