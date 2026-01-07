/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 09:57:05
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 09:57:07
 * @FilePath: /nove-admin/src/features/auth/AuthContext.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login, getMe, logout as logoutApi } from './api';
import { authService } from './service';
import type { LoginRequest, User } from './model/types';
import { AuthContext } from './AuthContext.types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const cachedUser = authService.getUser();

      if (!token) {
        setLoading(false);
        return;
      }

      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);
        authService.setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        authService.clear();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (credentials: LoginRequest) => {
    const response = await login(credentials);
    authService.setToken(response.accessToken);

    try {
      const userData = await getMe();
      setUser(userData);
      authService.setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user data after login:', error);
      authService.clear();
      setIsAuthenticated(false);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;

    const hasExactPermission = user.permissions.includes(permission);
    if (hasExactPermission) return true;

    const parts = permission.split(':');
    if (parts.length === 2) {
      const wildcardPermission = `${parts[0]}:*`;
      return user.permissions.includes(wildcardPermission);
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
