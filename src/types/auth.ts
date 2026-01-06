/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-06 09:05:17
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 04:34:03
 * @FilePath: /nove-admin/src/types/auth.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved. 
 */
export interface UserProfile {
  name: string;
  bio: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export interface User {
  id: string;
  username?: string | null;
  email: string;
  countryCode?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  profile?: UserProfile | null;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  type: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
