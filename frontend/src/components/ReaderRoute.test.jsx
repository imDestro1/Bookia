import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ReaderRoute from './ReaderRoute';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';

function renderAt(path, auth) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
        <Routes>
          <Route path="/admin" element={<p>Panel de mi tienda</p>} />
          <Route element={<ReaderRoute />}>
            <Route path="/favoritos" element={<p>Mis favoritos</p>} />
            <Route path="/perfil" element={<p>Mi perfil</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ReaderRoute', () => {
  it.each(['/favoritos', '/perfil'])('sends store owners from %s to their panel', (path) => {
    renderAt(path, { isStoreOwner: true });
    expect(screen.getByText('Panel de mi tienda')).toBeInTheDocument();
  });

  it('renders reader pages for everyone else', () => {
    renderAt('/favoritos', { isStoreOwner: false });
    expect(screen.getByText('Mis favoritos')).toBeInTheDocument();
  });
});
