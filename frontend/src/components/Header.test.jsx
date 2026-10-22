import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Header from './Header';
import { AuthContext } from '../context/authContext';
import { ROUTER_FUTURE } from '../services/routerFuture';
import { jsonResponse, mockFetch } from '../test/mockFetch';

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

function renderHeader(path = '/', auth = { isAuthenticated: false, isAdmin: false }) {
  mockFetch(() => jsonResponse({ genres: ['Novela', 'Poesía'], publishers: [] }));
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter future={ROUTER_FUTURE} initialEntries={[path]}>
        <Header />
        <Routes>
          <Route
            path="*"
            element={
              <>
                <LocationProbe />
                <input id="q" aria-label="Búsqueda de la página" />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('Header categories menu', () => {
  it('is hidden until the button opens it, and filters by the chosen genre', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Categorías' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Poesía' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/?genre=Poes%C3%ADa');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on outside click and on Escape', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Categorías' });
    await userEvent.click(toggle);
    await userEvent.click(screen.getByTestId('location'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(toggle);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('Header search', () => {
  it('stays hidden until the search icon opens it, then searches and closes', async () => {
    renderHeader('/establecimientos');
    expect(screen.queryByRole('search')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    const input = screen.getByLabelText('Buscar libros');
    expect(input).toHaveFocus();

    await userEvent.type(input, 'Rulfo{Enter}');
    expect(screen.getByTestId('location')).toHaveTextContent('/?q=Rulfo');
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });

  it('closes with Escape or the close button', async () => {
    renderHeader('/favoritos');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('search')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar búsqueda' }));
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });

  it('on the home page focuses the page search instead of opening a second bar', async () => {
    Element.prototype.scrollIntoView = () => {};
    renderHeader('/');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Búsqueda de la página')).toHaveFocus();
  });
});

describe('Header account link', () => {
  it('opens the profile page from the avatar of a signed-in reader', async () => {
    renderHeader('/', {
      isAuthenticated: true,
      isAdmin: false,
      user: { name: 'Ana Lectora', email: 'ana@test.dev', role: 'reader' },
    });
    const profileLink = screen.getByRole('link', { name: 'Mi perfil' });
    expect(profileLink).toHaveTextContent('A');
    await userEvent.click(profileLink);
    expect(screen.getByTestId('location')).toHaveTextContent('/perfil');
  });

  it('hides favorites and the profile for a store owner, and links to their store panel', async () => {
    renderHeader('/', {
      isAuthenticated: true,
      isAdmin: false,
      isStoreOwner: true,
      user: { name: 'Rosa Dueña', email: 'rosa@test.dev', role: 'store_owner', store_id: 's1' },
    });
    expect(screen.queryByRole('link', { name: 'Favoritos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Mi perfil' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument();
    expect(screen.getByText('Hola, Rosa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Mi tienda' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/admin');
  });

  it('keeps favorites for readers', async () => {
    renderHeader('/', {
      isAuthenticated: true,
      isAdmin: false,
      user: { name: 'Ana', email: 'ana@test.dev', role: 'reader' },
    });
    expect(await screen.findByRole('link', { name: 'Favoritos' })).toHaveAttribute(
      'href',
      '/favoritos',
    );
    expect(screen.queryByRole('link', { name: 'Mi tienda' })).not.toBeInTheDocument();
  });
});
