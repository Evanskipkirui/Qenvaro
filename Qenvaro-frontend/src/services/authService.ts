// ============================================================
// AUTH SERVICE
// ============================================================
// Tries the real Go backend first.
// Falls back to mock accounts when the backend is not running.
//
// DEMO ACCOUNTS (mock fallback):
//   Customer : alex@example.com   / password123
//   Admin    : admin@qenvaro.com  / admin123
// ============================================================

import { User } from '../types';
import { apiRequest } from './api';

interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'admin';
  };
}

// Mock users used when the backend is offline
const mockUsers = [
  { id: 1, name: 'Alex Johnson',  email: 'alex@example.com',  password: 'password123', role: 'customer' as const },
  { id: 2, name: 'Admin User',    email: 'admin@qenvaro.com', password: 'admin123',    role: 'admin'    as const },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── POST /api/auth/login ─────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    return {
      id: data.user.id,
      fullName: data.user.name,
      email: data.user.email,
      role: data.user.role,
    };
  } catch (err) {
    // If the backend returned 401 (wrong password), re-throw — don't fall back
    if (err instanceof Error && err.message.includes('401')) {
      throw new Error('Invalid email or password');
    }
    // Backend offline — use mock accounts
    console.warn('Backend unavailable — using mock login');
    await delay(500);
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    return { id: user.id, fullName: user.name, email: user.email, role: user.role };
  }
}

// ── POST /api/auth/register ──────────────────────────────────
export async function registerUser(
  fullName: string,
  email: string,
  password: string
): Promise<User> {
  try {
    const data = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: fullName, email, password }),
    });
    localStorage.setItem('token', data.token);
    return {
      id: data.user.id,
      fullName: data.user.name,
      email: data.user.email,
      role: data.user.role,
    };
  } catch (err) {
    // Re-throw real API errors (e.g. email already exists)
    if (err instanceof Error && err.message.includes('API error')) throw err;
    // Backend offline — create a mock user locally
    console.warn('Backend unavailable — using mock register');
    await delay(600);
    const exists = mockUsers.find((u) => u.email === email);
    if (exists) throw new Error('An account with this email already exists');
    return { id: Date.now(), fullName, email, role: 'customer' };
  }
}

export function logoutUser(): void {
  localStorage.removeItem('token');
}
