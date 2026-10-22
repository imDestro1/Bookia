import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ReaderRoute from './components/ReaderRoute';
import BookDetailPage from './pages/BookDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import StoreDetailPage from './pages/StoreDetailPage';
import StoresPage from './pages/StoresPage';
import AdminLayout, { AdminIndexRedirect } from './pages/admin/AdminLayout';
import AuditLogAdmin from './pages/admin/AuditLogAdmin';
import BooksAdmin from './pages/admin/BooksAdmin';
import MyStoreAdmin from './pages/admin/MyStoreAdmin';
import OffersAdmin from './pages/admin/OffersAdmin';
import StoreOwnersAdmin from './pages/admin/StoreOwnersAdmin';
import StoresAdmin from './pages/admin/StoresAdmin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="libros/:id" element={<BookDetailPage />} />
        <Route path="establecimientos" element={<StoresPage />} />
        <Route path="establecimientos/:id" element={<StoreDetailPage />} />
        <Route path="ingresar" element={<LoginPage />} />
        <Route element={<ReaderRoute />}>
          <Route path="favoritos" element={<FavoritesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminIndexRedirect />} />
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="libros" element={<BooksAdmin />} />
              <Route path="establecimientos" element={<StoresAdmin />} />
              <Route path="ofertas" element={<OffersAdmin />} />
              <Route path="duenos" element={<StoreOwnersAdmin />} />
              <Route path="bitacora" element={<AuditLogAdmin />} />
            </Route>
            <Route element={<ProtectedRoute role="store_owner" />}>
              <Route path="mi-tienda" element={<MyStoreAdmin />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
