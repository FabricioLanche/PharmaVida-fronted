import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authContext'; // Import the useAuth hook

const Login: React.FC = () => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, user } = useAuth(); // Get login function, loading state, error, and user from auth context
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dni || !password) {
      // Error state is managed by useAuth, but we can show a local message too if needed
      // For now, rely on the error state from context
      return;
    }

    // Call the login function from the auth context with correct arguments
    await login({ dni, password });
  };

  // Redirect to home if user is already logged in and not loading
  useEffect(() => {
    // If user is logged in (user is not null) and not currently loading, redirect to home.
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]); // Depend on user and isLoading

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="dni">DNI:</label>
          <input
            type="text"
            id="dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            disabled={isLoading} // Disable input while loading
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading} // Disable input while loading
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
      <br />
      <Link to="/">Volver al Inicio</Link>
    </div>
  );
};

export default Login;
