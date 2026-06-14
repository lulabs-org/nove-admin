import { afterEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../model/types';

const authApiMock = vi.hoisted(() => ({
  authControllerGetMe: vi.fn(),
  authControllerLogin: vi.fn(),
  authControllerLogout: vi.fn(),
}));

vi.mock('../../../shared/lib/api/orval/business/auth', () => authApiMock);

import { logout, normalizeAuthUser } from './api';

const baseUser: Omit<User, 'permissions'> = {
  id: 'user-id',
  email: 'yangshiming@proflu.cn',
  countryCode: '+86',
  phone: '181****2522',
  emailVerified: false,
  phoneVerified: false,
  createdAt: '2026-01-03T23:41:54.850Z',
  lastLoginAt: '2026-06-13T22:28:29.225Z',
  username: '杨仕明',
  name: '杨仕明',
  roles: ['SUPER_ADMIN'],
  active: true,
};

describe('auth api helpers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps backend perm field to permissions', () => {
    const user = normalizeAuthUser({
      ...baseUser,
      perm: ['user:read', 'api_key:read'],
    });

    expect(user.permissions).toEqual(['user:read', 'api_key:read']);
  });

  it('defaults permissions to an empty list when perm is missing', () => {
    const user = normalizeAuthUser({
      ...baseUser,
    });

    expect(user.permissions).toEqual([]);
  });

  it('marks logout requests as web clients', async () => {
    authApiMock.authControllerLogout.mockResolvedValue(undefined);

    await logout();

    expect(authApiMock.authControllerLogout).toHaveBeenCalledWith({
      clientType: 'web',
    });
  });
});
