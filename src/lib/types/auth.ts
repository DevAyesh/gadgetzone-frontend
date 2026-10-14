export interface UserProfile {
  _id: string;
  userId?: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  avatar?: string;
  phoneNumber?: string;
  address_line1?: string;
  address_line2?: string;
  city?: number | null;
  province?: number | null;
  gender?: number | null;
  isEmailVerified: boolean;
  isActive: boolean;
  isRemoved?: boolean;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requireOtp?: boolean;
  requireVerification?: boolean;
  email?: string;
  token?: string;
  data?: UserProfile & { token?: string; requireOtp?: boolean; email?: string };
  _id?: string;
  userId?: number;
  name?: string;
  role?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: UserProfile & { token?: string; isValid?: boolean };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
