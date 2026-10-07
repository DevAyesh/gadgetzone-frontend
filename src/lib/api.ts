// Central API helper — all calls go to your Render backend
// Set NEXT_PUBLIC_API_URL in your frontend .env.local file
import type {
  CustomerProduct,
  CustomerProductApiResponse,
  CustomerProductResponse,
  CustomerProductsApiResponse,
  CustomerProductsResponse,
} from "@/lib/types/customer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiRequestOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

const normalizeProduct = (
  product: CustomerProductApiResponse,
): CustomerProduct => {
  const id = product.id ?? product._id;
  if (!id) {
    throw new ApiError("Product response is missing an id", 502);
  }

  return { ...product, id };
};

// Helper to get the auth token stored in localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getErrorMessage = async (response: Response) => {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = body.message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  } catch {
    // An error response is not required to be JSON.
  }

  return 'Request failed with status ' + response.status;
};

// Base fetch wrapper
export const apiFetch = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const token = getToken();

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
};

// ─── Product Endpoints ──────────────────────────────────────────────────────

export const getProducts = (options?: ApiRequestOptions) =>
  apiFetch<CustomerProductsApiResponse>('/api/products', options)
    .then((products): CustomerProductsResponse => products.map(normalizeProduct));

export const getProductById = (id: string, options?: ApiRequestOptions) =>
  apiFetch<CustomerProductApiResponse>(
    '/api/products/' + encodeURIComponent(id),
    options,
  ).then((product): CustomerProductResponse => normalizeProduct(product));

export const getProductBySlug = (slug: string, options?: ApiRequestOptions) =>
  apiFetch<CustomerProductApiResponse>(
    '/api/products/slug/' + encodeURIComponent(slug),
    options,
  ).then((product): CustomerProductResponse => normalizeProduct(product));

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
