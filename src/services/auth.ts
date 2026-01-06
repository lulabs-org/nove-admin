/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-06 09:06:54
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 02:41:24
 * @FilePath: /nove-admin/src/services/auth.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved. 
 */
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
    console.log('Login attempt with credentials:', credentials);
    console.log('API base URL:', apiClient.defaults.baseURL);
    
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/login',
        credentials
      );
      console.log('Login response:', response);
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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
