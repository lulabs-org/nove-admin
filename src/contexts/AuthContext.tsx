/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-06 09:07:17
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-06 20:24:17
 * @FilePath: /nove-admin/src/contexts/AuthContext.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/auth';
import { StorageService } from '../utils/storage';
import type { LoginRequest, User } from '../types/auth';
import { AuthContext, type AuthContextType } from './AuthContext.types';

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Manages global authentication state and provides auth methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if user is authenticated on mount
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   * Validates stored token and retrieves user information
   */
  const checkAuth = async (): Promise<void> => {
    const token = StorageService.getToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Verify token is still valid by fetching current user
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      StorageService.setUser(currentUser);
    } catch {
      // Token is invalid or expired
      StorageService.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with credentials
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      
      // Store token and user information
      StorageService.setToken(response.token);
      StorageService.setUser(response.user);
      
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = (): void => {
    try {
      // Call logout API (fire and forget)
      authApi.logout().catch(() => {
        // Ignore errors on logout
      });
    } finally {
      // Clear local state regardless of API call result
      StorageService.clear();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
