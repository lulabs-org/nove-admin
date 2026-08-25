import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePage } from './ProfilePage';

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  getMe: vi.fn(),
  setUser: vi.fn(),
  setAuthState: vi.fn(),
  user: {
    id: 'user-1',
    email: 'yangshiming@proflu.cn',
    countryCode: '+86',
    phone: '18184502522',
    emailVerified: true,
    phoneVerified: false,
    lastLoginAt: '2026-08-25T15:17:44.000Z',
    createdAt: '2026-01-03T23:41:54.000Z',
    username: 'yangshiming',
    name: '杨仕明',
    roles: ['SUPER_ADMIN'],
    currentOrgId: 'organization-1',
    permissions: ['organization:read', 'organization:create'],
    active: true,
    profile: null,
  },
}));

vi.mock('../../../shared/lib/api/orval/business/user', () => ({
  userControllerGetProfile: mocks.getProfile,
  userControllerUpdateProfile: mocks.updateProfile,
}));

vi.mock('../../auth/api/api', () => ({ getMe: mocks.getMe }));
vi.mock('../../auth/api/service', () => ({ authService: { setUser: mocks.setUser } }));
vi.mock('../../auth/model/authStore', () => ({
  useAuthStore: Object.assign(
    (selector: (state: { user: typeof mocks.user }) => unknown) => selector({ user: mocks.user }),
    { setState: mocks.setAuthState }
  ),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
    mocks.getProfile.mockResolvedValue({
      id: 'user-1',
      username: 'yangshiming',
      email: 'yangshiming@proflu.cn',
      countryCode: '+86',
      phone: '18184502522',
      emailVerified: true,
      phoneVerified: false,
      lastLoginAt: '2026-08-25T15:17:44.000Z',
      createdAt: '2026-01-03T23:41:54.000Z',
      profile: {
        name: '杨仕明',
        avatar: '',
        bio: 'Nove 系统管理员',
      },
    });
  });

  it('focuses on editable profile and account safety without permission details', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    expect(await screen.findByRole('heading', { name: '杨仕明' })).toBeInTheDocument();
    expect(screen.getByText('个人资料')).toBeInTheDocument();
    expect(screen.getByText('账号与安全')).toBeInTheDocument();
    expect(screen.queryByLabelText('用户昵称')).not.toBeInTheDocument();
    expect(screen.getAllByText('@yangshiming')).toHaveLength(2);
    expect(screen.queryByLabelText('显示名称')).not.toBeInTheDocument();
    expect(screen.getByText('已启用')).toBeInTheDocument();

    expect(screen.queryByText('权限概览')).not.toBeInTheDocument();
    expect(screen.queryByText('SUPER_ADMIN')).not.toBeInTheDocument();
    expect(screen.queryByText('organization:read')).not.toBeInTheDocument();
    expect(screen.queryByText('organization-1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /编辑资料/ }));
    expect(await screen.findByLabelText('用户昵称')).toHaveValue('杨仕明');
    expect(screen.getByLabelText('区号')).toHaveValue('+86');
    expect(screen.queryByLabelText('国家代码')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('yangshiming@proflu.cn')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
    expect(screen.queryByLabelText('用户昵称')).not.toBeInTheDocument();
  });
});
