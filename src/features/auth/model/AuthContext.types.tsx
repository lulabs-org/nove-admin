/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 10:31:33
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 12:54:45
 * @FilePath: /nove-admin/src/features/auth/model/AuthContext.types.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { createContext } from 'react';
import type { LoginRequest, User } from './types';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
