import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { LoadingState } from '../components/StatusMessages';
import { useAuth } from '../hooks/useAuth';

// Mandatory screen for accounts created by an admin: the panel stays closed until the
// initial password is replaced. Other signed-in users can also change it from here.
export default function ChangePasswordPage() {
  const { status, isAuthenticated, canManage, mustChangePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Verificando sesión…" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const home = canManage ? '/admin' : '/perfil';
  const redirectTo = location.state?.from?.pathname || home;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="mx-auto max-w-md">
      <section className="card space-y-4 border-t-4 border-t-leather-700 p-6 sm:p-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-leather-800">Cambia tu contraseña</h1>
          <p className="mt-1 text-sm text-stone-600">
            {mustChangePassword
              ? 'Tu cuenta se creó con una contraseña inicial. Elige una nueva para entrar a tu panel.'
              : 'Elige una nueva contraseña para tu cuenta.'}
          </p>
        </div>
        <ChangePasswordForm
          submitLabel={mustChangePassword ? 'Guardar y continuar' : 'Cambiar contraseña'}
          onChanged={() => navigate(redirectTo, { replace: true })}
        />
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-semibold text-leather-600 hover:underline"
        >
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
