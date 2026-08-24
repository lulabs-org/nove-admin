import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Meeting } from '../model/types';
import { MeetingDetail } from './MeetingDetail';

const meetingApiMock = vi.hoisted(() => ({
  getById: vi.fn(),
  getParticipants: vi.fn(),
  getSummary: vi.fn(),
  getTranscript: vi.fn(),
  getSpeakerSummaries: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../api/meetingApi', () => ({ meetingApi: meetingApiMock }));
vi.mock('../../../app/guards/Perm', () => ({
  Perm: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('../components/MeetingFormModal', () => ({ MeetingFormModal: () => null }));

const meeting: Meeting = {
  id: 'meeting-1',
  platform: 'TENCENT_MEETING',
  meetingId: 'external-meeting-1',
  subMeetingId: 'sub-meeting-1',
  title: '渐进加载会议',
  type: 'SCHEDULED',
  tags: [],
  host: null,
  hasRecording: true,
  recordingStatus: 'COMPLETED',
  processingStatus: 'COMPLETED',
  minutes: [{ id: 'recording-1', errorMessage: null }],
  createdAt: '2026-08-19T00:00:00.000Z',
  updatedAt: '2026-08-19T00:00:00.000Z',
};

describe('MeetingDetail', () => {
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
    meetingApiMock.getById.mockResolvedValue(meeting);
    meetingApiMock.getParticipants.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    });
    meetingApiMock.getSummary.mockResolvedValue(null);
    meetingApiMock.getTranscript.mockResolvedValue([]);
    meetingApiMock.getSpeakerSummaries.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    });
  });

  it('shows the base detail before secondary data and lazy-loads the transcript', async () => {
    render(
      <MemoryRouter initialEntries={['/meetings/meeting-1']}>
        <Routes>
          <Route path="/meetings/:id" element={<MeetingDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: '渐进加载会议' })).toBeInTheDocument();
    await waitFor(() => {
      expect(meetingApiMock.getSummary).toHaveBeenCalledWith('recording-1');
    });
    expect(meetingApiMock.getTranscript).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '查看转写' }));

    await waitFor(() => {
      expect(meetingApiMock.getTranscript).toHaveBeenCalledWith('recording-1');
    });
  });

  it('loads participant summaries only when the participant tab is opened', async () => {
    meetingApiMock.getParticipants.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    });

    render(
      <MemoryRouter initialEntries={['/meetings/meeting-1']}>
        <Routes>
          <Route path="/meetings/:id" element={<MeetingDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: '渐进加载会议' })).toBeInTheDocument();
    expect(meetingApiMock.getSpeakerSummaries).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('tab', { name: /参会成员/ }));

    await waitFor(() => {
      expect(meetingApiMock.getSpeakerSummaries).toHaveBeenCalledWith('recording-1');
    });
  });

  it('renders the current participant contract and links speaker summaries by platform user', async () => {
    meetingApiMock.getParticipants.mockResolvedValue({
      data: [
        {
          id: 'participant-1',
          meetingId: 'meeting-1',
          firstJoinTime: '2026-08-19T01:00:00.000Z',
          lastLeaveTime: '2026-08-19T02:00:00.000Z',
          totalDurationSeconds: 3600,
          platformUser: {
            id: 'platform-user-1',
            platform: 'TENCENT_MEETING',
            displayName: '平台姓名',
            avatarUrl: null,
          },
          user: {
            id: 'user-1',
            username: 'zhangsan',
            email: 'zhangsan@example.com',
            countryCode: null,
            phone: null,
            profile: { displayName: '张三', avatar: null },
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    });
    meetingApiMock.getSpeakerSummaries.mockResolvedValue({
      data: [
        {
          id: 'summary-1',
          minuteId: 'recording-1',
          platformUserId: 'platform-user-1',
          partSummary: '完成了产品复盘汇报。',
          keywords: ['产品复盘'],
          createdAt: '2026-08-19T03:00:00.000Z',
          updatedAt: '2026-08-19T03:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    });

    render(
      <MemoryRouter initialEntries={['/meetings/meeting-1']}>
        <Routes>
          <Route path="/meetings/:id" element={<MeetingDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: '渐进加载会议' });
    fireEvent.click(screen.getByRole('tab', { name: /参会成员/ }));

    expect(await screen.findByText('张三')).toBeInTheDocument();
    expect(screen.getByText('zhangsan@example.com')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: '查看总结' }));
    expect(await screen.findByText('完成了产品复盘汇报。')).toBeInTheDocument();
  });
});
