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

export interface MeetingRecording {
  id: string;
  externalId?: string | null;
  source?: string;
  status?: string;
  startAt?: string | null;
  endAt?: string | null;
}

export interface MeetingParticipantUser {
  id: string;
  platform: string;
  ptUserId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  countryCode: string | null;
  phone: string | null;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  ptUserId: string | null;
  firstJoinTime: string | null;
  lastLeaveTime: string | null;
  totalDurationSeconds: number | null;
  user: MeetingParticipantUser | null;
}

export interface MeetingParticipantListResponse {
  data: MeetingParticipant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MeetingSummary {
  id: string;
  title?: string | null;
  content: string;
  aiMinutes?: unknown;
  keyPoints?: unknown;
  actionItems?: unknown;
  decisions?: unknown;
  speakerInsights?: unknown;
  goldenQuotes?: unknown;
  keywords?: string[];
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSummaryListResponse {
  data: MeetingSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MeetingHost {
  id: string;
  displayName?: string | null;
}

export interface TranscriptSegment {
  speakerName?: string;
  startTime?: string;
  endTime?: string;
  text?: string;
}

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
  host?: MeetingHost | null;
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
  recordings?: MeetingRecording[];
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

export type MeetingListItem = Omit<Meeting, 'metadata'>;

export interface MeetingListResponse {
  data: MeetingListItem[];
  total: number;
  page: number;
  limit: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateMeetingDto {
  platform: MeetingControllerGetMeetingRecordsPlatform;
  platformMeetingId: string;
  title: string;
  meetingCode?: string;
  type: MeetingControllerGetMeetingRecordsType;
  hostUserId?: string;
  actualStartAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  hasRecording?: boolean;
  recordingStatus?: MeetingControllerGetMeetingRecordsStatus;
  processingStatus?: MeetingControllerGetMeetingRecordsStatus;
}

export interface UpdateMeetingDto {
  title?: string;
  meetingCode?: string;
  type?: MeetingControllerGetMeetingRecordsType;
  hostUserId?: string;
  actualStartAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  participantCount?: number;
  recordingStatus?: MeetingControllerGetMeetingRecordsStatus;
  processingStatus?: MeetingControllerGetMeetingRecordsStatus;
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
