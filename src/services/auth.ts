import apiClient from './api';
import type { LoginRequest, LoginResponse, User } from '../types/auth';
import type { ApiResponse } from '../types/api';

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh'
    );
    return response.data.data;
  },
};
