import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { loginUser, registerUser, getUserMe } from '../services/usuarios_y_compras/usuariosAPI';
import { type User } from '../types/usuarios'; // Import User type

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: { dni?: string; email?: string; password: string }) => Promise<void>;
  logout: () => void;
  register: (userData: { nombre: string; apellido: string; email: string; password: string; distrito: string; dni: string }) => Promise<void>;
  error: string | null; // Add error state
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to handle user login
  const login = async (userData: { dni?: string; email?: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(userData);
      // Store token
      localStorage.setItem('authToken', response.token);
      // Fetch profile using token
      const profile = await getUserMe(response.token);
      setUser(profile);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión.');
      setIsLoading(false);
    }
  };

  // Function to handle user logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken'); // Remove token on logout
    setIsLoading(false);
  };

  // Function to handle user registration
  const register = async (userData: { nombre: string; apellido: string; email: string; password: string; distrito: string; dni: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(userData);
      alert(response.message || 'Registro exitoso. Por favor, inicia sesión.');
      setIsLoading(false);
      // The component calling register should handle navigation to login
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Error al registrarse.');
      setIsLoading(false);
    }
  };

  // Initialize auth state by checking for existing token
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      (async () => {
        try {
          const profile = await getUserMe(token);
          setUser(profile);
        } catch (e) {
          console.error('Failed to fetch profile', e);
          logout();
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
