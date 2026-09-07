// ============================================================
// API BASE CONFIGURATION
// ============================================================
// This is the single place where the backend URL is defined.
// All service files import from here.
// ============================================================

export const API_BASE_URL = 'http://localhost:8080/api';

// A generic helper that wraps every fetch() call.
// It automatically:
//   1. Sets Content-Type to JSON
//   2. Attaches the JWT token from localStorage if it exists
//   3. Throws an error with the server's message if the request fails
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get the token from localStorage — stored there after login
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // If a token exists, attach it to every request automatically
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!response.ok) {
    // Try to read the error message from the backend JSON response
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
