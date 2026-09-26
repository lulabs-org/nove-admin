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
import { isNetworkFailure } from '../../../shared/lib/api/networkFailure';
import type { LoginRequest, User } from './types';
import { canAccessPermission } from './permissions';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
  initialize: () => Promise<void>;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
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
          set({ user: userData, isAuthenticated: true, loading: false });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          authService.removeToken();
          set({ isAuthenticated: false, loading: false });
        }
      },

      login: async (credentials: LoginRequest) => {
        const response = await login(credentials);
        authService.setToken(response.accessToken);

        try {
          const userData = await getMe();
          set({ user: userData, isAuthenticated: true });
        } catch (error) {
          console.error('Failed to fetch user data after login:', error);
          authService.removeToken();
          set({ isAuthenticated: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await logoutApi();
        } catch (error) {
          console.error('Logout error:', error);

          // 只有网络故障才向上抛：交给调用方提示「请检查网络后重试」，并保留
          // 本地登录态以便重试；其余失败（4xx/5xx/3xx/非 axios 等，服务端已
          // 应答或属确定性错误）仍完成本地登出，不打扰用户。
          // 判定口径见 shared/lib/api/networkFailure.ts。
          if (isNetworkFailure(error)) {
            throw error;
          }
        }

        authService.removeToken();
        set({ user: null, isAuthenticated: false });
      },

      checkPermission: (permission: string) => {
        return canAccessPermission(get().user, permission);
      },

      clearAuth: () => {
        authService.removeToken();
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user: User | null) => {
        set({ user });
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

if (typeof window !== 'undefined') {
  window.addEventListener('auth-unauthorized', () => {
    useAuthStore.getState().clearAuth();
  });
}
