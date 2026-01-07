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
import { authControllerLogin, authControllerLogout } from '../../shared/api/orval/business/auth';
import { userControllerGetProfile } from '../../shared/api/orval/business/user';
import type { LoginRequest, LoginResponse, User } from './model/types';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await authControllerLogin(data);
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user as unknown as User,
  };
};

export const getMe = async (): Promise<User> => {
  const response = await userControllerGetProfile();
  return {
    ...response,
    roles: ['admin'],
    permissions: [
      'users:view',
      'users:list',
      'users:create',
      'users:edit',
      // 'users:delete',
      'users:audit',
      'roles:view',
      'roles:create',
      'roles:edit',
      'roles:delete',
      'dashboard:view',
      'settings:view',
      'settings:edit',
    ],
  } as User;
};

export const logout = async (): Promise<void> => {
  await authControllerLogout();
};
