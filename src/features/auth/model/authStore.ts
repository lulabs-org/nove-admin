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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: true,

      initialize: async () => {
        const token = authService.getToken();
        const cachedUser = authService.getUser();

        if (!token) {
          set({ loading: false });
          return;
        }

        if (cachedUser) {
          set({ user: cachedUser, isAuthenticated: true, loading: false });
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
