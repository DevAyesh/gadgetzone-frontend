// Central API helper — all calls go to your backend
// Set NEXT_PUBLIC_API_URL in your frontend .env.local file
import type {
  CustomerProduct,
  CustomerProductApiResponse,
  CustomerProductResponse,
  CustomerProductsApiResponse,
  CustomerProductsResponse,
} from "@/lib/types/customer";
import type {
  UserProfile,
  AuthResponse,
  VerifyOtpResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from "@/lib/types/auth";
import type {
  Order,
  OrdersListResponse,
  AdminMetricsResponse,
  PayHereHashResponse,
} from "@/lib/types/order";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');


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

// Helper to get the auth token stored in localStorage or Zustand persist store
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;
    try {
      const persisted = localStorage.getItem('gadgetzone-auth');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed?.state?.token) return parsed.state.token;
      }
    } catch {
      // ignore JSON parse error
    }
  }
  return null;
};

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null) {
      if ('message' in body && typeof body.message === 'string' && body.message.trim()) {
        return body.message;
      }
      if ('error' in body && typeof body.error === 'string' && body.error.trim()) {
        return body.error;
      }
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

  // Client-side preflight check for admin endpoints:
  // If a non-admin client or unauthenticated caller attempts to call an admin API,
  // reject immediately before hitting the network to avoid tripping backend security alerts.
  const isAdminEndpoint = endpoint.includes('/admin') || (endpoint.startsWith('/api/users') && !endpoint.includes('/profile'));
  if (isAdminEndpoint && typeof window !== 'undefined') {
    let currentUser: any = null;
    try {
      const persisted = localStorage.getItem('gadgetzone-auth');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        currentUser = parsed?.state?.user;
      }
    } catch {
      // ignore JSON parse error
    }

    if (!token || !currentUser) {
      throw new ApiError('Authentication required: Admin access only.', 401);
    }

    const isAdmin = Boolean(
      (currentUser.isAdmin === true || currentUser.role?.toLowerCase() === 'admin') &&
      currentUser.isActive !== false &&
      !currentUser.isRemoved
    );

    if (!isAdmin) {
      console.warn(`[API GUARD] Blocked client request to admin endpoint ${endpoint} for non-admin user ${currentUser.email || 'unknown'}`);
      throw new ApiError('Forbidden: Admin access required', 403);
    }
  }

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (isFormData) {
    headers.delete('Content-Type');
  } else if (options.body && !headers.has('Content-Type')) {
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
    const errorMsg = await getErrorMessage(response);
    if (response.status === 401 && typeof window !== 'undefined') {
      const isCurrentAdminPath = window.location.pathname.startsWith('/admin');
      const isAdminApi = endpoint.includes('/admin');
      if (isCurrentAdminPath || isAdminApi) {
        localStorage.removeItem('token');
        localStorage.removeItem('gadgetzone-auth');
        document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    throw new ApiError(errorMsg, response.status);
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

// ─── Auth Endpoints ─────────────────────────────────────────────────────────

export const registerUser = (data: { name: string; email: string; password: string }) =>
  apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyRegisterOtp = (data: { email: string; otp: string }) =>
  apiFetch<VerifyOtpResponse>('/api/auth/verify-register-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const loginUser = (data: { email: string; password?: string; requireOtp?: boolean }) =>
  apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const sendLoginOtp = (data: { email: string }) =>
  apiFetch<{ success: boolean; message: string; data?: { email: string } }>('/api/auth/send-login-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyLoginOtp = (data: { email: string; otp: string }) =>
  apiFetch<AuthResponse>('/api/auth/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const forgotPassword = (data: { email: string }) =>
  apiFetch<ForgotPasswordResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyResetOtp = (data: { email: string; otp: string }) =>
  apiFetch<{ success: boolean; message: string; data?: { isValid: boolean } }>('/api/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const resetPassword = (data: { email: string; otp: string; newPassword: string }) =>
  apiFetch<ResetPasswordResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const resendOtp = (data: { email: string; purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET' }) =>
  apiFetch<{ success: boolean; message: string }>('/api/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const googleAuth = (idToken: string) =>
  apiFetch<AuthResponse>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });

// ─── Customer Profile Endpoints ─────────────────────────────────────────────

export const getUserProfile = () =>
  apiFetch<{ success: boolean; data: UserProfile }>('/api/users/profile');

export const updateUserProfile = (profileData: Partial<UserProfile>) =>
  apiFetch<{ success: boolean; data: UserProfile; message?: string }>('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });

// ─── Customer Order Endpoints ───────────────────────────────────────────────

export const createOrder = (orderData: {
  orderItems: Array<{ product?: string; id?: string; _id?: string; qty?: number; quantity?: number }>;
  shippingAddress: {
    address?: string;
    addressLine1?: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  paymentMethod: string;
  totalPrice?: number;
}) =>
  apiFetch<{ success: boolean; message?: string; data: Order; orderNumber?: string; _id?: string }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const getMyOrders = (page: number = 1, limit: number = 20) =>
  apiFetch<OrdersListResponse>(`/api/orders/myorders?page=${page}&limit=${limit}`);

export const getOrderById = (id: string) =>
  apiFetch<{ success: boolean; data: Order }>(`/api/orders/${encodeURIComponent(id)}`);

export const cancelOrder = (id: string, reason: string) =>
  apiFetch<{ success: boolean; message: string; data: Order }>(`/api/orders/${encodeURIComponent(id)}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });

export const markOrderPaymentFailed = (id: string, reason: string = 'Payment was not completed') =>
  apiFetch<{ success: boolean; message: string; data: Order }>(`/api/orders/${encodeURIComponent(id)}/payment-failed`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

// ─── Payment Endpoints ──────────────────────────────────────────────────────

export const generatePayHereHash = (data: { order_id: string; amount: number | string; currency?: string }) =>
  apiFetch<PayHereHashResponse>('/api/payments/hash', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const confirmPayment = (
  orderIdOrData: string | { orderId: string; paymentId?: string; status?: string },
  details?: { paymentId?: string; status?: string }
) => {
  const payload = typeof orderIdOrData === 'string'
    ? { orderId: orderIdOrData, ...(details || {}) }
    : orderIdOrData;

  return apiFetch<{ success: boolean; message: string; data: Order }>('/api/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ─── Admin Order Management Endpoints ───────────────────────────────────────


export const getAllOrdersAdmin = (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  const qStr = query.toString();
  return apiFetch<OrdersListResponse>(`/api/orders/admin${qStr ? `?${qStr}` : ''}`);
};

export const shipOrderAdmin = (id: string, carrier: string, trackingNumber: string, notes?: string) =>
  apiFetch<{ success: boolean; message: string; data: Order }>(`/api/orders/${encodeURIComponent(id)}/ship`, {
    method: 'PUT',
    body: JSON.stringify({ carrier, trackingNumber, notes }),
  });

export const deliverOrderAdmin = (id: string) =>
  apiFetch<{ success: boolean; message: string; data: Order }>(`/api/orders/${encodeURIComponent(id)}/deliver`, {
    method: 'PUT',
    body: JSON.stringify({ isDelivered: true }),
  });

export const payOrderAdmin = (id: string, paymentResult: Record<string, unknown> = {}) =>
  apiFetch<{ success: boolean; message: string; data: Order }>(`/api/orders/${encodeURIComponent(id)}/pay`, {
    method: 'PUT',
    body: JSON.stringify({ paymentResult }),
  });

export const getAdminMetrics = () =>
  apiFetch<AdminMetricsResponse>('/api/orders/admin/metrics');

export const getAdminDailySales = (days: number = 30) =>
  apiFetch<{ success: boolean; data: Array<{ date: string; totalRevenue: number; orderCount: number }> }>(`/api/orders/admin/sales/daily?days=${days}`);

export const getAdminMonthlySales = (months: number = 12) =>
  apiFetch<{ success: boolean; data: Array<{ month: string; totalRevenue: number; orderCount: number }> }>(`/api/orders/admin/sales/monthly?months=${months}`);

export interface TopSellingProduct {
  productId: string;
  name: string;
  totalQtySold: number;
  totalRevenue: number;
}

export const getAdminTopSellingProducts = (limit: number = 5) =>
  apiFetch<{ success: boolean; data: TopSellingProduct[] }>(`/api/orders/admin/sales/top-products?limit=${limit}`);

// ─── Admin Product Management Endpoints ─────────────────────────────────────

export const createProductAdmin = (data: FormData | {
  name: string;
  description: string;
  price: number;
  category: string;
  countInStock?: number;
  stock?: number;
  images?: string[];
  image_url?: string;
  imageUrl?: string;
}) =>
  apiFetch<{ success: boolean; message: string; data: CustomerProduct }>('/api/products/admin', {
    method: 'POST',
    body: typeof FormData !== 'undefined' && data instanceof FormData ? data : JSON.stringify(data),
  });

export const updateProductAdmin = (
  id: string,
  data: FormData | Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    countInStock?: number;
    stock?: number;
    images?: string[];
    image_url?: string;
    imageUrl?: string;
    removeImages?: string[];
    replaceImages?: boolean;
  }>
) =>
  apiFetch<{ success: boolean; message: string; data: CustomerProduct }>(`/api/products/admin/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: typeof FormData !== 'undefined' && data instanceof FormData ? data : JSON.stringify(data),
  });

export const deleteProductAdmin = (id: string, token?: string | null) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string }>(`/api/products/admin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
};

// ─── Admin User Management Endpoints ────────────────────────────────────────

export const getAllUsersAdmin = () =>
  apiFetch<{ success: boolean; data: UserProfile[] }>('/api/users');

export const deleteUserAdmin = (id: string, token?: string | null) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string }>(`/api/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
};

export const updateUserStatusAdmin = (id: string, isActive: boolean) =>
  apiFetch<{ success: boolean; message: string; data: UserProfile }>(`/api/users/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });

export const createAdminUser = (data: {
  name: string;
  email: string;
  password: string;
  isSuperAdmin?: boolean;
}) =>
  apiFetch<{ success: boolean; message: string; data: UserProfile }>('/api/users/admin', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateUserRoleAdmin = (
  id: string,
  role: 'customer' | 'admin',
  isSuperAdmin?: boolean
) =>
  apiFetch<{ success: boolean; message: string; data: UserProfile }>(`/api/users/${encodeURIComponent(id)}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role, isSuperAdmin }),
  });

// ─── Category Endpoints ─────────────────────────────────────────────────────

export interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  icon?: string;
  isRemoved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getCategories = async (options?: ApiRequestOptions): Promise<CategoryItem[]> => {
  const res = await apiFetch<CategoryItem[] | { success: boolean; data: CategoryItem[] }>('/api/categories', options);
  const items = Array.isArray(res) ? res : (res?.data || []);
  return items.map((cat: any) => ({ ...cat, id: cat.id || cat._id }));
};

export const getCategoryById = async (id: string, options?: ApiRequestOptions): Promise<CategoryItem> => {
  const res = await apiFetch<CategoryItem | { success: boolean; data: CategoryItem }>(
    `/api/categories/${encodeURIComponent(id)}`,
    options
  );
  const cat = (res as any)?.data || res;
  return { ...cat, id: cat.id || cat._id };
};

export const createCategoryAdmin = (
  data: { name: string; slug?: string; icon?: string },
  token?: string | null
) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string; data: CategoryItem }>('/api/categories', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};

export const updateCategoryAdmin = (
  id: string,
  data: { name?: string; slug?: string; icon?: string },
  token?: string | null
) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string; data: CategoryItem }>(
    `/api/categories/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    }
  );
};

export const deleteCategoryAdmin = (id: string, token?: string | null) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string }>(
    `/api/categories/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers,
    }
  );
};

// ─── Collection Endpoints ───────────────────────────────────────────────────

export interface CollectionItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isRemoved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getCollections = async (options?: ApiRequestOptions): Promise<CollectionItem[]> => {
  const res = await apiFetch<CollectionItem[] | { success: boolean; data: CollectionItem[] }>('/api/collections', options);
  const items = Array.isArray(res) ? res : (res?.data || []);
  return items.map((col: any) => ({ ...col, id: col.id || col._id }));
};

export const getCollectionById = async (id: string, options?: ApiRequestOptions): Promise<CollectionItem> => {
  const res = await apiFetch<CollectionItem | { success: boolean; data: CollectionItem; collection?: CollectionItem }>(
    `/api/collections/${encodeURIComponent(id)}`,
    options
  );
  const col = (res as any)?.collection || (res as any)?.data || res;
  return { ...col, id: col.id || col._id };
};

export const createCollectionAdmin = (
  data: { name: string; slug?: string; description?: string; image?: string },
  token?: string | null
) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string; data: CollectionItem }>('/api/collections', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};

export const updateCollectionAdmin = (
  id: string,
  data: { name?: string; slug?: string; description?: string; image?: string },
  token?: string | null
) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string; data: CollectionItem }>(
    `/api/collections/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    }
  );
};

export const deleteCollectionAdmin = (id: string, token?: string | null) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return apiFetch<{ success: boolean; message: string }>(
    `/api/collections/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers,
    }
  );
};



