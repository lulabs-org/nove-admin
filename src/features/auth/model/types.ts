export type LoginType =
  | 'username_password'
  | 'email_password'
  | 'email_code'
  | 'phone_password'
  | 'phone_code';

export interface LoginRequest {
  type: LoginType;
  username?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  password: string;
  code?: string;
}

export interface UserProfile {
  name: string;
  bio: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export interface User {
  id: string;
  email: string;
  countryCode?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  username?: string | null;
  profile?: UserProfile | null;
  roles?: string[];
  permissions?: string[];
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}
