import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Meeting } from '../model/types';
import { MeetingDetail } from './MeetingDetail';

const meetingApiMock = vi.hoisted(() => ({
  getById: vi.fn(),
  getParticipants: vi.fn(),
  getSummaries: vi.fn(),
  getTranscript: vi.fn(),
  getParticipantSummaries: vi.fn(),
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
  recordings: [{ id: 'recording-1', status: 'COMPLETED' }],
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
    meetingApiMock.getById.mockResolvedValue(meeting);
    meetingApiMock.getParticipants.mockReturnValue(new Promise(() => undefined));
    meetingApiMock.getSummaries.mockReturnValue(new Promise(() => undefined));
    meetingApiMock.getTranscript.mockResolvedValue([]);
    meetingApiMock.getParticipantSummaries.mockResolvedValue({
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
    expect(meetingApiMock.getParticipantSummaries).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('tab', { name: /参会成员/ }));

    await waitFor(() => {
      expect(meetingApiMock.getParticipantSummaries).toHaveBeenCalledWith(
        'meeting-1',
        'recording-1'
      );
    });
  });
});
