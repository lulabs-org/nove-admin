import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TrackingReportSubject } from '../model/types';
import { trackingReportApi } from '../api/trackingReportApi';
import { ReportSubjectSummary, SubjectIdentityDetails } from './ReportSubject';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

const localSubject: TrackingReportSubject = {
  kind: 'LOCAL_USER',
  displayName: '杨仕明',
  avatar: null,
  isLinked: true,
  nameSnapshot: '会议用户384027',
  localUser: {
    id: 'local-1',
    username: 'yangshiming',
    email: 'yangshiming@example.com',
    countryCode: '+86',
    phone: '13800138000',
  },
  platformUser: {
    id: 'platform-1',
    platform: 'TENCENT_MEETING',
    ptUserId: 'meeting-user-1',
    ptUnionId: 'union-1',
    displayName: '会议用户384027',
  },
};

describe('ReportSubject', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the linked local user as the primary subject', () => {
    render(<ReportSubjectSummary subject={localSubject} />);

    expect(screen.getByText('杨仕明')).toBeInTheDocument();
    expect(screen.getByText('本地用户')).toBeInTheDocument();
    expect(screen.queryByText('yangshiming@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('腾讯会议')).not.toBeInTheDocument();
  });

  it('marks an unlinked platform identity clearly', () => {
    render(
      <ReportSubjectSummary
        subject={{
          kind: 'PLATFORM_USER',
          displayName: 'Cecilia',
          isLinked: false,
        }}
      />
    );

    expect(screen.getByText('Cecilia')).toBeInTheDocument();
    expect(screen.getByText('平台用户')).toBeInTheDocument();
    expect(screen.queryByText('腾讯会议')).not.toBeInTheDocument();
  });

  it('renders project reports with the project as the subject', () => {
    render(
      <ReportSubjectSummary
        subject={{
          kind: 'PROJECT',
          displayName: 'AI 课程项目',
          isLinked: true,
        }}
      />
    );

    expect(screen.getByText('AI 课程项目')).toBeInTheDocument();
    expect(screen.getByText('项目')).toBeInTheDocument();
    expect(screen.queryByText('第一阶段')).not.toBeInTheDocument();
  });

  it('keeps all technical identities available for copying', () => {
    render(<SubjectIdentityDetails subject={localSubject} />);

    expect(screen.getByText('local-1')).toBeInTheDocument();
    expect(screen.getByText('yangshiming')).toBeInTheDocument();
    expect(screen.getByText('yangshiming@example.com')).toBeInTheDocument();
    expect(screen.getByText('+86 13800138000')).toBeInTheDocument();
    expect(screen.getByText('platform-1')).toBeInTheDocument();
    expect(screen.getByText('meeting-user-1')).toBeInTheDocument();
    expect(screen.getByText('union-1')).toBeInTheDocument();
    expect(screen.getAllByText('会议用户384027')).toHaveLength(2);
  });

  it('loads identity details only after the user opens them', async () => {
    const getSubject = vi.spyOn(trackingReportApi, 'getSubject').mockResolvedValue(localSubject);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReportSubjectSummary
          identityReportId="report-1"
          subject={{
            kind: 'LOCAL_USER',
            displayName: '杨仕明',
            avatar: null,
            isLinked: true,
          }}
        />
      </QueryClientProvider>
    );

    expect(getSubject).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '身份详情' }));

    await waitFor(() => expect(getSubject).toHaveBeenCalledWith('report-1'));
    expect(await screen.findByText('yangshiming@example.com')).toBeInTheDocument();
  });

  it('offers a retry when identity details cannot be loaded', async () => {
    const getSubject = vi
      .spyOn(trackingReportApi, 'getSubject')
      .mockRejectedValue(new Error('request failed'));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReportSubjectSummary
          identityReportId="report-2"
          subject={{
            kind: 'PLATFORM_USER',
            displayName: 'Cecilia',
            avatar: null,
            isLinked: false,
          }}
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '身份详情' }));

    expect(await screen.findByText('身份信息加载失败')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '重新加载' }));
    await waitFor(() => expect(getSubject).toHaveBeenCalledTimes(2));
  });
});
