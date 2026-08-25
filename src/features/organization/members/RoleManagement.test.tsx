import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { RoleManagement } from './RoleManagement';

const apiMocks = vi.hoisted(() => ({
  listRoles: vi.fn(),
  roleOptions: vi.fn(),
  permissionTree: vi.fn(),
}));

vi.mock('../../../app/guards/Perm', () => ({
  Perm: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({ user: { currentOrgId: 'org-1' } }),
}));

vi.mock('./api/roleManagementApi', () => ({
  roleManagementApi: {
    list: apiMocks.listRoles,
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bindMember: vi.fn(),
  },
}));

vi.mock('./api/orgMemberApi', () => ({
  orgMemberApi: { roleOptions: apiMocks.roleOptions },
}));

vi.mock('../../governance/permissions/api/permissionManagementApi', () => ({
  permissionManagementApi: { permissionTree: apiMocks.permissionTree },
}));

describe('RoleManagement', () => {
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
    apiMocks.listRoles.mockResolvedValue({
      data: [
        {
          id: 'role-1',
          name: '超级管理员',
          code: 'SUPER_ADMIN',
          type: 'SYSTEM',
          level: 1,
          active: true,
          permissionIds: [],
          createdAt: '2026-08-25T00:00:00.000Z',
          updatedAt: '2026-08-25T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    });
    apiMocks.roleOptions.mockResolvedValue({
      data: [
        {
          id: 'member-1',
          userId: 'user-1',
          displayName: '杨仕明',
          email: 'yangshiming@example.com',
          avatar: null,
          departmentNames: ['班主任'],
          roleIds: ['role-1'],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    apiMocks.permissionTree.mockResolvedValue([]);
  });

  it('applies ellipsis only to the member name and not the avatar text', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RoleManagement />
      </QueryClientProvider>
    );

    expect(await screen.findByText('杨仕明')).toHaveClass('org-role-member-name-text');
    expect(screen.getByText('仕明')).not.toHaveClass('org-role-member-name-text');
  });
});
