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
  console.log('[loginUser] POST', url);
  return apiPost<LoginResponse>(url, userData);
}

// Function to handle user registration
export async function registerUser(userData: { nombre: string; apellido: string; email: string; password: string; distrito: string; dni: string }): Promise<RegisterResponse> {
  const USERS_API_URL = import.meta.env.VITE_API_USUARIOS_COMPRAS || '';
  const url = `${USERS_API_URL}/auth/register`;
  console.log('[registerUser] POST', url);
  return apiPost<RegisterResponse>(url, userData);
}

// Get current user profile (requires Bearer token)
export async function getUserMe(token: string): Promise<User> {
  const USERS_API_URL = import.meta.env.VITE_API_USUARIOS_COMPRAS || '';
  const urlUser = `${USERS_API_URL}/user/me`;
  const headers = { 'Authorization': `Bearer ${token}` } as Record<string, string>;
  console.log('[getUserMe] GET', urlUser);
  try {
    return await apiGet<User>(urlUser, { headers });
  } catch (e: any) {
    // Si el backend expone /auth/me en lugar de /user/me, intenta fallback
    if (typeof e?.message === 'string' && e.message.includes(' 404')) {
      const urlAuth = `${USERS_API_URL}/auth/me`;
      console.warn('[getUserMe] /user/me 404, intentando', urlAuth);
      return await apiGet<User>(urlAuth, { headers });
    }
    throw e;
  }
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  distrito?: string;
}

export async function updateUserMe(token: string, dto: UpdateUserDto): Promise<User> {
  const USERS_API_URL = import.meta.env.VITE_API_USUARIOS_COMPRAS || '';
  const url = `${USERS_API_URL}/user/me`;
  // We don't have apiPut with custom headers here; reuse fetch pattern via apiGet isn't proper. Use fetch directly.
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
  return res.json();
}
