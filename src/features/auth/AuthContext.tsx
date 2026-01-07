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

    setUser(response.user);
    authService.setUser(response.user);
    setIsAuthenticated(true);
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
    return user.permissions.includes(permission);
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
