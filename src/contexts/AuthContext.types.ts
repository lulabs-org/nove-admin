import { createContext } from 'react';
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
