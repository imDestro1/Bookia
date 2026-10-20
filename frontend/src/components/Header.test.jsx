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

function renderHeader() {
  mockFetch(() => jsonResponse({ genres: ['Novela', 'Poesía'], publishers: [] }));
  return render(
    <AuthContext.Provider value={{ isAuthenticated: false, isAdmin: false }}>
      <MemoryRouter future={ROUTER_FUTURE}>
        <Header />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
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
