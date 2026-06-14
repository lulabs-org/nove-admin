/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-09 21:30:47
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-09 22:12:39
 * @FilePath: /nove-admin/src/features/meetings/model/types.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type {
  MeetingControllerGetMeetingRecordsPlatform,
  MeetingControllerGetMeetingRecordsStatus,
  MeetingControllerGetMeetingRecordsType,
} from '../../../shared/lib/api/orval/business/schemas';

export interface Meeting {
  id: string;
  platform: MeetingControllerGetMeetingRecordsPlatform;
  meetingId: string;
  subMeetingId?: string | null;
  externalId?: string | null;
  title: string;
  description?: string | null;
  meetingCode?: string | null;
  type: MeetingControllerGetMeetingRecordsType;
  language?: string | null;
  tags?: string[];
  hostPlatformUserId?: string | null;
  participantCount?: number | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  durationSeconds?: number | null;
  timezone?: string | null;
  hasRecording: boolean;
  recordingStatus: MeetingControllerGetMeetingRecordsStatus;
  processingStatus: MeetingControllerGetMeetingRecordsStatus;
  metadata?: unknown;
  recordingUrl?: string;
  transcriptUrl?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MeetingListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: MeetingControllerGetMeetingRecordsStatus;
  platform?: MeetingControllerGetMeetingRecordsPlatform;
  type?: MeetingControllerGetMeetingRecordsType;
  startDate?: string;
  endDate?: string;
}

export interface MeetingListResponse {
  data: Meeting[];
  total: number;
  page: number;
  limit: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateMeetingDto {
  title: string;
  description?: string;
  meetingId?: string;
  meetingType?: MeetingControllerGetMeetingRecordsPlatform;
  startTime: string;
  endTime: string;
  host?: string;
}

export interface UpdateMeetingDto {
  title?: string;
  description?: string;
  status?: MeetingControllerGetMeetingRecordsStatus;
  summary?: string;
}

export interface MeetingStats {
  totalMeetings: number;
  completedMeetings: number;
  ongoingMeetings: number;
  scheduledMeetings: number;
  cancelledMeetings: number;
  totalDuration: number;
  averageDuration: number;
  totalParticipants: number;
}
