/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 09:56:04
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 12:09:02
 * @FilePath: /nove-admin/src/features/auth/api.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import {
  authControllerLogin,
  authControllerLogout,
  authControllerGetMe,
} from '../../../shared/lib/api/orval/business/auth';
import type { LoginRequest, LoginResponse, User } from '../model/types';

type AuthApiUser = Omit<User, 'permissions'> & {
  perm?: string[];
};

export function normalizeAuthUser(user: AuthApiUser): User {
  return {
    ...user,
    permissions: user.perm ?? [],
  };
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await authControllerLogin(data);
  return {
    accessToken: response.accessToken,
    expiresIn: response.expiresIn,
    user: normalizeAuthUser(response.user as unknown as AuthApiUser),
  };
};

export const getMe = async (): Promise<User> => {
  const response = await authControllerGetMe();
  return normalizeAuthUser(response as unknown as AuthApiUser);
};

export const logout = async (): Promise<void> => {
  await authControllerLogout();
};
