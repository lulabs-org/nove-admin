import type { User } from '../types/auth';

const TOKEN_KEY = 'nove_admin_token';
const USER_KEY = 'nove_admin_user';

/**
 * Storage service for managing authentication data in local storage
 */
export const StorageService = {
  /**
   * Store authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Retrieve authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Remove authentication token
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Store user information
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Retrieve user information
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Remove user information
   */
  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Clear all authentication data
   */
  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};
