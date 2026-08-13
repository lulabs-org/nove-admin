import {
  meetingControllerGetMeetingRecords,
  meetingControllerGetMeetingRecordById,
  meetingControllerDeleteMeetingRecord,
  meetingControllerGetMeetingStats,
  // meetingControllerReprocessMeetingRecord, // 后端接口暂时禁用，见 PR #321
} from '../../../shared/lib/api/orval/business/meet';
import { meetingRecordingControllerGetTranscript } from '../../../shared/lib/api/orval/business/meet-recording';
import { mutator } from '../../../shared/lib/api/mutator';
import type {
  Meeting,
  MeetingListParams,
  MeetingListResponse,
  CreateMeetingDto,
  UpdateMeetingDto,
  MeetingStats,
  TranscriptSegment,
  MeetingParticipantListResponse,
  MeetingSummaryListResponse,
} from '../model/types';

export const meetingApi = {
  list: (params: MeetingListParams): Promise<MeetingListResponse> => {
    return meetingControllerGetMeetingRecords(params) as unknown as Promise<MeetingListResponse>;
  },

  getById: (id: string): Promise<Meeting> => {
    return meetingControllerGetMeetingRecordById(id) as unknown as Promise<Meeting>;
  },

  create: (data: CreateMeetingDto): Promise<Meeting> => {
    return mutator<Meeting>({ url: '/meetings', method: 'POST', data });
  },

  update: (id: string, data: UpdateMeetingDto): Promise<Meeting> => {
    return mutator<Meeting>({ url: `/meetings/${id}`, method: 'PATCH', data });
  },

  delete: (id: string): Promise<void> => {
    return meetingControllerDeleteMeetingRecord(id) as unknown as Promise<void>;
  },

  getStats: (): Promise<MeetingStats> => {
    return meetingControllerGetMeetingStats() as unknown as Promise<MeetingStats>;
  },

  getTranscript: async (recordingId: string): Promise<TranscriptSegment[]> => {
    const response = (await meetingRecordingControllerGetTranscript(recordingId, {
      format: 'json',
    })) as { data?: TranscriptSegment[] };
    return response.data || [];
  },

  getParticipants: (
    meetingId: string,
    params: { page?: number; limit?: number; search?: string } = {}
  ): Promise<MeetingParticipantListResponse> => {
    return mutator<MeetingParticipantListResponse>({
      url: `/meetings/${meetingId}/participants`,
      method: 'GET',
      params,
    });
  },

  getSummaries: (meetingId: string): Promise<MeetingSummaryListResponse> => {
    return mutator<MeetingSummaryListResponse>({
      url: `/meetings/${meetingId}/summaries`,
      method: 'GET',
      params: { page: 1, limit: 1, isLatest: true },
    });
  },

  // 后端接口暂时禁用，见 PR #321
  // reprocess: (id: string): Promise<Meeting> => {
  //   return meetingControllerReprocessMeetingRecord(id) as unknown as Promise<Meeting>;
  // },
};
