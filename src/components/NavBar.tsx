import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/authContext';

const NavBar: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="w-full border-b" style={{ borderColor: 'var(--pv-border)', background: 'var(--pv-card)' }}>
      <nav className="page" style={{ paddingTop: 12, paddingBottom: 12 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-bold text-lg" style={{ color: 'var(--pv-green)' }}>PharmaVida</Link>
            <Link to="/" className="text-sm" style={{ color: 'var(--pv-orange)' }}>Buscar</Link>
            <Link to="/prescription" className="text-sm">Recetas</Link>
            <Link to="/analitica" className="text-sm">Analítica</Link>
            <Link to="/cart" className="text-sm">Carrito</Link>
          </div>
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="btn-orange px-3 py-1.5 text-sm">Login</Link>
                <Link to="/register" className="px-3 py-1.5 text-sm" style={{ background: 'var(--pv-green)', color: 'white', borderRadius: 12 }}>Registro</Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="px-3 py-1.5 text-sm">Perfil</Link>
                <button onClick={logout} className="px-3 py-1.5 text-sm" disabled={isLoading}>
                  Salir
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
