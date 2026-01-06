/**
 * User model representing a system administrator
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLoginAt?: string;
}

/**
 * Authentication token information
 */
export interface AuthToken {
  token: string;
  expiresIn: number;
  refreshToken?: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}
