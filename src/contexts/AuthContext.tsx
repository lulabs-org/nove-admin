import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/auth';
import { StorageService } from '../utils/storage';
import type { User, LoginRequest } from '../types/auth';

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Create authentication context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
    const storedUser = StorageService.getUser();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Verify token is still valid by fetching current user
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      StorageService.setUser(currentUser);
    } catch (error) {
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
    } catch (error) {
      // Error is already handled by axios interceptor
      throw error;
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
};
