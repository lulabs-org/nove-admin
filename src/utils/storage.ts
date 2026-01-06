import type { User } from '../types/auth';

const TOKEN_KEY = 'nove_admin_token';
const REFRESH_TOKEN_KEY = 'nove_admin_refresh_token';
const USER_KEY = 'nove_admin_user';

export const StorageService = {
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  },
};
