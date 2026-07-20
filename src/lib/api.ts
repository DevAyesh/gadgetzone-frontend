// Central API helper — all calls go to your Render backend
// Set NEXT_PUBLIC_API_URL in your frontend .env.local file
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper to get the auth token stored in localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Base fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

// ─── Product Endpoints ──────────────────────────────────────────────────────

export const getProducts = () => apiFetch('/api/products');

export const getProductById = (id: string) => apiFetch(`/api/products/${id}`);

// ─── User / Auth Endpoints ──────────────────────────────────────────────────

export const loginUser = (email: string, password: string) =>
  apiFetch('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (name: string, email: string, password: string) =>
  apiFetch('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getUserProfile = () => apiFetch('/api/users/profile');
