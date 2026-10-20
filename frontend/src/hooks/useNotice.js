import { useCallback, useState } from 'react';

// Small helper for success/error banners in the admin area.
export function useNotice() {
  const [notice, setNotice] = useState(null);
  const success = useCallback((text) => setNotice({ type: 'success', text }), []);
  const fail = useCallback(
    (error) => setNotice({ type: 'error', text: error?.message || 'Ocurrió un error.' }),
    [],
  );
  const clear = useCallback(() => setNotice(null), []);
  return { notice, success, fail, clear };
}
