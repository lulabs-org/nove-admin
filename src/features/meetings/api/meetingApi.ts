import {
  meetingControllerGetMeetingRecords,
  meetingControllerCreateMeetingRecord,
  meetingControllerGetMeetingRecordById,
  meetingControllerUpdateMeetingRecord,
  meetingControllerDeleteMeetingRecord,
  meetingControllerGetMeetingStats,
  meetingControllerGetTranscriptByRecordingId,
  // meetingControllerReprocessMeetingRecord, // 后端接口暂时禁用，见 PR #321
} from '../../../shared/lib/api/orval/business/meet';
import type {
  Meeting,
  MeetingListParams,
  MeetingListResponse,
  CreateMeetingDto,
  UpdateMeetingDto,
  MeetingStats,
  TranscriptSegment,
} from '../model/types';

export const meetingApi = {
  list: (params: MeetingListParams): Promise<MeetingListResponse> => {
    return meetingControllerGetMeetingRecords(params) as unknown as Promise<MeetingListResponse>;
  },

  getById: (id: string): Promise<Meeting> => {
    return meetingControllerGetMeetingRecordById(id) as unknown as Promise<Meeting>;
  },

  create: (data: CreateMeetingDto): Promise<Meeting> => {
    return meetingControllerCreateMeetingRecord(
      JSON.stringify(data)
    ) as unknown as Promise<Meeting>;
  },

  update: (id: string, data: UpdateMeetingDto): Promise<Meeting> => {
    return meetingControllerUpdateMeetingRecord(
      id,
      JSON.stringify(data)
    ) as unknown as Promise<Meeting>;
  },

  delete: (id: string): Promise<void> => {
    return meetingControllerDeleteMeetingRecord(id) as unknown as Promise<void>;
  },

  getStats: (): Promise<MeetingStats> => {
    return meetingControllerGetMeetingStats() as unknown as Promise<MeetingStats>;
  },

  getTranscript: async (recordingId: string): Promise<TranscriptSegment[]> => {
    const response = (await meetingControllerGetTranscriptByRecordingId(recordingId, {
      format: 'json',
    })) as { data?: TranscriptSegment[] };
    return response.data || [];
  },

  // 后端接口暂时禁用，见 PR #321
  // reprocess: (id: string): Promise<Meeting> => {
  //   return meetingControllerReprocessMeetingRecord(id) as unknown as Promise<Meeting>;
  // },
};
