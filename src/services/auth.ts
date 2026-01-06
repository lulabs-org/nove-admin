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
import type { LoginRequest, LoginResponse, User } from '../types/auth';
import { AuthService } from './generated/services/AuthService';
import { UserService } from './generated/services/UserService';
import { OpenAPI } from './generated/core/OpenAPI';

OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://118.178.234.94:3000';
OpenAPI.TOKEN = async () => {
  const token = localStorage.getItem('nove_admin_token');
  return token || '';
};

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Login attempt with credentials:', credentials);
    
    try {
      const response = await AuthService.authControllerLogin({
        type: credentials.type as any,
        username: credentials.username,
        password: credentials.password,
      });
      
      console.log('Login response:', response);
      
      return {
        user: response.user as User,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await AuthService.authControllerLogout();
  },

  async getCurrentUser(): Promise<User> {
    const response = await UserService.userControllerGetProfile();
    return response as User;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await AuthService.authControllerRefreshToken({
      refreshToken,
    });
    
    return {
      accessToken: response.accessToken || '',
      refreshToken: response.refreshToken || '',
    };
  },
};
