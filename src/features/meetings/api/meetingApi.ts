import axios from 'axios';

import {
  meetingControllerGetMeetingRecords,
  meetingControllerGetMeetingRecordById,
  meetingControllerDeleteMeetingRecord,
  meetingControllerGetMeetingStats,
  // meetingControllerReprocessMeetingRecord, // 后端接口暂时禁用，见 PR #321
} from '../../../shared/lib/api/orval/business/meet';
import { minuteControllerGetTranscript } from '../../../shared/lib/api/orval/business/minute';
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
  MinuteParticipantSummaryListResponse,
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

  getTranscript: async (minuteId: string): Promise<TranscriptSegment[]> => {
    try {
      const response = (await minuteControllerGetTranscript(minuteId, {
        format: 'json',
      })) as { data?: TranscriptSegment[] };
      return response.data || [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
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

  getParticipantSummaries: (minuteId: string): Promise<MinuteParticipantSummaryListResponse> => {
    return mutator<MinuteParticipantSummaryListResponse>({
      url: `/minutes/${minuteId}/participant-summaries`,
      method: 'GET',
      params: { page: 1, limit: 100 },
    });
  },

  // 后端接口暂时禁用，见 PR #321
  // reprocess: (id: string): Promise<Meeting> => {
  //   return meetingControllerReprocessMeetingRecord(id) as unknown as Promise<Meeting>;
  // },
};
