import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const EMPTY = { name: '', email: '', password: '' };

function errorMessage(err, mode) {
  if (mode === 'login' && err.status === 401) return 'Correo o contraseña incorrectos.';
  if (err.status === 409) return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if (err.status === 400 && mode === 'register') {
    return 'Revisa tus datos: la contraseña debe tener al menos 8 caracteres.';
  }
  return err.message;
}

// Reader access: sign in or create an account, with a separate entry for admins.
export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(location.state?.mode === 'register' ? 'register' : 'login');
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname || '/';
  const isRegister = mode === 'register';

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ ...values, name: values.name.trim(), email: values.email.trim() });
      } else {
        await login(values.email.trim(), values.password);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(errorMessage(err, mode));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-5">
      <section className="card overflow-hidden md:col-span-3">
        <div
          className="grid grid-cols-2 border-b border-leather-100 text-sm font-semibold"
          role="tablist"
        >
          {[
            ['login', 'Iniciar sesión'],
            ['register', 'Crear cuenta'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => switchMode(key)}
              className={`py-3 transition ${
                mode === key
                  ? 'border-b-2 border-leather-600 text-leather-700'
                  : 'text-stone-500 hover:text-leather-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-leather-800">
              {isRegister ? 'Crea tu cuenta de lector' : '¡Hola de nuevo!'}
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              {isRegister
                ? 'Guarda tus libros favoritos y encuéntralos rápido.'
                : 'Entra para ver tus favoritos. Buscar libros no requiere cuenta.'}
            </p>
          </div>
          {isRegister && (
            <div>
              <label htmlFor="name" className="label">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                value={values.name}
                onChange={handleChange}
                className="input"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="label">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 8 : undefined}
              value={values.password}
              onChange={handleChange}
              className="input"
            />
            {isRegister && <p className="mt-1 text-xs text-stone-500">Mínimo 8 caracteres.</p>}
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
            {submitting ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
          <p className="text-center text-sm text-stone-600">
            {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
              className="font-semibold text-leather-600 hover:underline"
            >
              {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </form>
      </section>

      <aside className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-br from-leather-800 to-leather-900 p-6 text-white shadow-lg md:col-span-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-leather-300">
            Establecimientos
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold">¿Eres administrador?</h2>
          <p className="mt-2 text-sm text-leather-100">
            Gestiona libros, precios y existencias de las librerías de Huauchinango.
          </p>
        </div>
        <Link to="/admin/login" className="btn bg-white text-leather-800 hover:bg-leather-100">
          Soy administrador
        </Link>
      </aside>
    </div>
  );
}
