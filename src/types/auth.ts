/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-06 09:05:17
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 03:17:10
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
  email: string;
  countryCode: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
  profile: UserProfile;
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
