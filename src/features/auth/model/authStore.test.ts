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

    // 判断器 canRetryLogout() 只看「本地还有没有 access token」：
    // 只要还能重试，就保留登录态，避免「客户端已登出、服务端仍存活幽灵令牌」。
    it.each([
      ['a network failure', axiosError({ code: 'ERR_NETWORK' })],
      ['a timeout', axiosError({ code: 'ECONNABORTED' })],
      ['a request that never got a response', axiosError({})],
      ['a gateway 502', axiosError({ status: 502 })],
      ['a gateway 503', axiosError({ status: 503 })],
      ['a server 500', axiosError({ status: 500 })],
      ['a client 403', axiosError({ status: 403 })],
      ['a redirect 302', axiosError({ status: 302 })],
      ['a non-axios failure', new Error('crypto.randomUUID is not a function')],
    ])(
      'keeps the local session and re-throws when %s happens while a token remains',
      async (_label, error) => {
        authService.setToken('active-token');
        useAuthStore.setState({ isAuthenticated: true, user: mockUser });
        apiMocks.logout.mockRejectedValueOnce(error);

        await expect(useAuthStore.getState().logout()).rejects.toBe(error);

        expect(authService.getToken()).toBe('active-token');
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
      }
    );

    it('completes local logout when the credentials are already gone (refresh failed)', async () => {
      // 401 → 刷新失败路径：网络层已 removeToken + clearAuth，
      // 本地已无凭据，重试不可能，因此不必保留登录态。
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });
      apiMocks.logout.mockRejectedValueOnce(axiosError({ code: 'ERR_NETWORK' }));

      await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();

      expect(authService.getToken()).toBeNull();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
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
