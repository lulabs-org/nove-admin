import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectManagement } from './ProjectManagement';

const mocks = vi.hoisted(() => ({
  projectList: vi.fn(),
}));

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    checkPermission: () => true,
  }),
}));
vi.mock('../api/projectApi', () => ({
  projectApi: {
    list: mocks.projectList,
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProjectManagement', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows an organization empty state without requesting projects', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <ProjectManagement />
      </QueryClientProvider>
    );

    expect(screen.getByText('缺少当前组织')).toBeInTheDocument();
    expect(mocks.projectList).not.toHaveBeenCalled();
  });
});
