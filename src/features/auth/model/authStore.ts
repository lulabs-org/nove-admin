/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 14:31:04
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-23 20:23:05
 * @FilePath: /nove-admin/src/features/auth/model/authStore.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login, getMe, logout as logoutApi } from '../api/api';
import { authService } from '../api/service';
import type { LoginRequest, User } from './types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
  initialize: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: true,

      initialize: async () => {
        const token = authService.getToken();

        if (!token) {
          set({ loading: false, isAuthenticated: false });
          return;
        }

        try {
          const userData = await getMe();
          authService.setUser(userData);
          set({ user: userData, isAuthenticated: true, loading: false });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          authService.clear();
          set({ isAuthenticated: false, loading: false });
        }
      },

      login: async (credentials: LoginRequest) => {
        const response = await login(credentials);
        authService.setToken(response.accessToken);

        try {
          const userData = await getMe();
          authService.setUser(userData);
          set({ user: userData, isAuthenticated: true });
        } catch (error) {
          console.error('Failed to fetch user data after login:', error);
          authService.clear();
          set({ isAuthenticated: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await logoutApi();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          authService.clear();
          set({ user: null, isAuthenticated: false });
        }
      },

      checkPermission: (permission: string) => {
        const { user } = get();
        if (!user || !user.permissions) return false;

        const hasExactPermission = user.permissions.includes(permission);
        if (hasExactPermission) return true;

        const parts = permission.split(':');
        if (parts.length === 2) {
          const wildcardPermission = `${parts[0]}:*`;
          return user.permissions.includes(wildcardPermission);
        }

        return false;
      },

      clearAuth: () => {
        authService.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
