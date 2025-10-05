import { apiGet, apiPost } from '../apiConfig';
import { type User } from '../../types/usuarios'; // Assuming User type is defined in types/usuarios.ts

// Define a type for login response, e.g., including a token
interface LoginResponse {
  token: string;
  user?: User; // backend may or may not return user in login
}

// Define a type for registration response
interface RegisterResponse {
  message: string;
  user?: User;
}

// Function to handle user login (DNI o email)
export async function loginUser(userData: { dni?: string; email?: string; password: string }): Promise<LoginResponse> {
  const USERS_API_URL = import.meta.env.VITE_API_USUARIOS_COMPRAS || '';
  const url = `${USERS_API_URL}/auth/login`;
  return apiPost<LoginResponse>(url, userData);
}

// Function to handle user registration
export async function registerUser(userData: { nombre: string; apellido: string; email: string; password: string; distrito: string; dni: string }): Promise<RegisterResponse> {
  const USERS_API_URL = import.meta.env.VITE_API_USUARIOS_COMPRAS || '';
  const url = `${USERS_API_URL}/auth/register`;
  return apiPost<RegisterResponse>(url, userData);
}

// Get current user profile (requires Bearer token)
export async function getUserMe(token: string): Promise<User> {
  const USERS_API_URL = import.meta.env.VITE_API_USUARIOS_COMPRAS || '';
  const url = `${USERS_API_URL}/user/me`;
  return apiGet<User>(url, { headers: { 'Authorization': `Bearer ${token}` } });
}
