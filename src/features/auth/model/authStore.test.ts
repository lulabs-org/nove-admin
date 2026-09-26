import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from './types';

const apiMocks = vi.hoisted(() => ({
  login: vi.fn(),
  getMe: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../api/api', () => ({
  login: apiMocks.login,
  getMe: apiMocks.getMe,
  logout: apiMocks.logout,
}));

import { authService } from '../api/service';
import { useAuthStore } from './authStore';

function axiosError(options: { code?: string; status?: number }) {
  return {
    isAxiosError: true,
    code: options.code,
    response: options.status === undefined ? undefined : { status: options.status },
  };
}

const mockUser: User = {
  id: 'user-1',
  email: 'test@proflu.cn',
  username: 'testuser',
  name: '测试用户',
  roles: ['ADMIN'],
  permissions: ['user:read', 'user:write'],
  emailVerified: true,
  phoneVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  active: true,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('sets isAuthenticated=false and loading=false when no token is present', async () => {
      useAuthStore.setState({ loading: true });

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(apiMocks.getMe).not.toHaveBeenCalled();
    });

    it('fetches current user and sets authenticated when token is present', async () => {
      authService.setToken('valid-token');
      apiMocks.getMe.mockResolvedValueOnce(mockUser);
      useAuthStore.setState({ loading: true });

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('clears token and marks unauthenticated if getMe fails on initialize', async () => {
      authService.setToken('expired-token');
      apiMocks.getMe.mockRejectedValueOnce(new Error('Unauthorized'));
      useAuthStore.setState({ loading: true });

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(authService.getToken()).toBeNull();
    });
  });

  describe('login', () => {
    it('sets token and fetches user on successful login', async () => {
      apiMocks.login.mockResolvedValueOnce({ accessToken: 'new-token' });
      apiMocks.getMe.mockResolvedValueOnce(mockUser);

      await useAuthStore.getState().login({
        type: 'email_password',
        email: 'test@proflu.cn',
        password: 'Password123',
      });

      expect(authService.getToken()).toBe('new-token');
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('clears auth and re-throws error if getMe fails after login', async () => {
      apiMocks.login.mockResolvedValueOnce({ accessToken: 'temp-token' });
      apiMocks.getMe.mockRejectedValueOnce(new Error('Profile fetch failed'));

      await expect(
        useAuthStore.getState().login({
          type: 'email_password',
          email: 'test@proflu.cn',
          password: 'Password123',
        })
      ).rejects.toThrow('Profile fetch failed');

      expect(authService.getToken()).toBeNull();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('calls logout API and clears store & token on success', async () => {
      authService.setToken('active-token');
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });
      apiMocks.logout.mockResolvedValueOnce(undefined);

      await useAuthStore.getState().logout();

      expect(apiMocks.logout).toHaveBeenCalled();
      expect(authService.getToken()).toBeNull();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    // 口径：只对「网络故障」保留登录态；4xx/5xx/3xx/非 axios 等
    // （服务端已应答、或属确定性错误）仍完成本地登出。
    // 判定口径见 shared/lib/api/networkFailure.ts。
    it.each([
      ['a network failure', axiosError({ code: 'ERR_NETWORK' }), true],
      ['a timeout', axiosError({ code: 'ECONNABORTED' }), true],
      ['a gateway 502', axiosError({ status: 502 }), true],
      ['a gateway 504', axiosError({ status: 504 }), true],
      ['a server 500', axiosError({ status: 500 }), false],
      ['a client 403', axiosError({ status: 403 }), false],
      ['a redirect 302', axiosError({ status: 302 }), false],
      ['a response-less error without a transport code', axiosError({}), false],
      ['a non-axios failure', new Error('crypto.randomUUID is not a function'), false],
    ])('re-throws only for network failures (%s)', async (_label, error, preservesSession) => {
      authService.setToken('active-token');
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });
      apiMocks.logout.mockRejectedValueOnce(error);

      if (preservesSession) {
        await expect(useAuthStore.getState().logout()).rejects.toBe(error);

        expect(authService.getToken()).toBe('active-token');
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
      } else {
        await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();

        expect(authService.getToken()).toBeNull();
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
      }
    });

    it('still re-throws network-shaped failures after the network layer cleared the credentials', async () => {
      // 已知取舍：401 → 刷新失败路径上网层已 removeToken + clearAuth，
      // 但错误形状仍属网络故障，所以这里仍会抛错、不再收尾本地状态。
      // （刻意不设 token，模拟凭据已被清空。）
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });
      apiMocks.logout.mockRejectedValueOnce(axiosError({ code: 'ERR_NETWORK' }));

      await expect(useAuthStore.getState().logout()).rejects.toMatchObject({ code: 'ERR_NETWORK' });

      expect(authService.getToken()).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('updates current user in store', () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });
      const updatedUser = { ...mockUser, name: '已更新用户' };

      useAuthStore.getState().setUser(updatedUser);

      expect(useAuthStore.getState().user).toEqual(updatedUser);
    });

    it('allows setting user to null', () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });

      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('clears token and resets store state', () => {
      authService.setToken('sample-token');
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });

      useAuthStore.getState().clearAuth();

      expect(authService.getToken()).toBeNull();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('responds to auth-unauthorized window event', () => {
      authService.setToken('expired-token');
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });

      window.dispatchEvent(new Event('auth-unauthorized'));

      expect(authService.getToken()).toBeNull();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('checkPermission', () => {
    it('delegates to canAccessPermission using the store user', () => {
      useAuthStore.setState({ user: mockUser });

      expect(useAuthStore.getState().checkPermission('user:read')).toBe(true);
      expect(useAuthStore.getState().checkPermission('admin:secret')).toBe(false);
    });
  });
});
