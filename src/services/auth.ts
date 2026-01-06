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

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Login attempt with credentials:', credentials);
    console.log('API base URL:', apiClient.defaults.baseURL);
    
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        credentials
      );
      console.log('Login response:', response);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },
};
