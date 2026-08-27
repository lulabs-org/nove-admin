import { beforeEach, describe, expect, it, vi } from 'vitest';
import { meetingApi } from './meetingApi';

const apiMocks = vi.hoisted(() => ({
  mutator: vi.fn(),
  getTranscript: vi.fn(),
}));

vi.mock('../../../shared/lib/api/mutator', () => ({ mutator: apiMocks.mutator }));
vi.mock('../../../shared/lib/api/orval/business/minute', () => ({
  minuteControllerGetTranscript: apiMocks.getTranscript,
}));

describe('meetingApi recording resources', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads structured transcript segments with local user details', async () => {
    const segment = {
      id: 'segment-1',
      speakerName: '平台姓名',
      startTime: '00:00:01',
      endTime: '00:00:02',
      text: '发言内容',
      platformUser: { id: 'platform-user-1', displayName: '平台姓名' },
      user: { id: 'user-1', displayName: '本地姓名', fullName: '本地姓名' },
    };
    apiMocks.getTranscript.mockResolvedValue({
      transcriptId: 'transcript-1',
      data: [segment],
    });

    await expect(meetingApi.getTranscript('minute-1')).resolves.toEqual([segment]);
    expect(apiMocks.getTranscript).toHaveBeenCalledWith('minute-1', {
      includeLocalUser: true,
    });
  });

  it('loads a single minute summary from the current backend route', async () => {
    const summary = {
      id: 'summary-1',
      content: '会议纪要',
      createdAt: '2026-08-24T00:00:00.000Z',
      updatedAt: '2026-08-24T00:00:00.000Z',
    };
    apiMocks.mutator.mockResolvedValue(summary);

    await expect(meetingApi.getSummary('minute-1')).resolves.toEqual(summary);
    expect(apiMocks.mutator).toHaveBeenCalledWith({
      url: '/minutes/minute-1/summary',
      method: 'GET',
    });
  });

  it('treats a missing minute summary as empty data', async () => {
    apiMocks.mutator.mockRejectedValue({ isAxiosError: true, response: { status: 404 } });

    await expect(meetingApi.getSummary('minute-1')).resolves.toBeNull();
  });

  it('loads speaker summaries from the renamed backend route', async () => {
    apiMocks.mutator.mockResolvedValue({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });

    await meetingApi.getSpeakerSummaries('minute-1');
    expect(apiMocks.mutator).toHaveBeenCalledWith({
      url: '/minutes/minute-1/speaker-summaries',
      method: 'GET',
      params: { page: 1, limit: 100 },
    });
  });
});
