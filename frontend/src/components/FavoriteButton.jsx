import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { favoritesApi } from '../services/bookiaApi';

// Heart toggle for a book; anonymous readers are sent to the login screen.
export default function FavoriteButton({ bookId }) {
  const { isAuthenticated, isStoreOwner } = useAuth();
  // Store owners have no favorites list (the API answers 403).
  const enabled = isAuthenticated && !isStoreOwner;
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    favoritesApi
      .list({ signal: controller.signal })
      .then((data) => setSaved((data?.items ?? []).some((book) => book._id === bookId)))
      .catch(() => {});
    return () => controller.abort();
  }, [enabled, bookId]);

  async function toggle() {
    if (!isAuthenticated) {
      navigate('/ingresar', { state: { from: { pathname: `/libros/${bookId}` } } });
      return;
    }
    setBusy(true);
    try {
      const data = saved ? await favoritesApi.remove(bookId) : await favoritesApi.add(bookId);
      setSaved((data?.book_ids ?? []).includes(bookId));
    } finally {
      setBusy(false);
    }
  }

  if (isStoreOwner) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={saved ? 'btn-primary' : 'btn-secondary'}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 21s-7-4.4-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z" />
      </svg>
      {saved ? 'En favoritos' : 'Guardar en favoritos'}
    </button>
  );
}
