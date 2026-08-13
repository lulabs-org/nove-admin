export enum TrackingReportType {
  INDIVIDUAL_PERFORMANCE = 'INDIVIDUAL_PERFORMANCE',
  PROJECT_PROGRESS = 'PROJECT_PROGRESS',
  TEAM_SUMMARY = 'TEAM_SUMMARY',
}

export enum TrackingCadence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export const TRACKING_REPORT_TYPE_LABELS: Record<TrackingReportType, string> = {
  [TrackingReportType.INDIVIDUAL_PERFORMANCE]: '个人绩效',
  [TrackingReportType.PROJECT_PROGRESS]: '项目进展',
  [TrackingReportType.TEAM_SUMMARY]: '团队汇总',
};

export const TRACKING_CADENCE_LABELS: Record<TrackingCadence, string> = {
  [TrackingCadence.DAILY]: '日报',
  [TrackingCadence.WEEKLY]: '周报',
  [TrackingCadence.MONTHLY]: '月报',
  [TrackingCadence.QUARTERLY]: '季报',
};

export interface TrackingReport {
  id: string;
  subjectUserId?: string | null;
  platformUserId?: string | null;
  projectId?: string | null;
  subjectNameSnapshot: string;
  trackingType: TrackingReportType;
  cadence: TrackingCadence;
  periodStart: string;
  periodEnd: string;
  timezone: string;
  content: string;
  structuredData?: Record<string, unknown> | null;
  isLatest: boolean;
  version: number;
  versionGroupKey: string;
  previousReportId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type TrackingReportListItem = Omit<TrackingReport, 'content' | 'structuredData'>;

export interface TrackingReportListParams {
  subjectUserId?: string;
  platformUserId?: string;
  projectId?: string;
  trackingType?: TrackingReportType;
  cadence?: TrackingCadence;
  periodStart?: string;
  periodEnd?: string;
  isLatest?: boolean;
  page?: number;
  limit?: number;
}

export interface TrackingReportListResponse {
  data: TrackingReportListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTrackingReportDto {
  subjectUserId?: string;
  platformUserId?: string;
  projectId?: string;
  subjectNameSnapshot: string;
  trackingType: TrackingReportType;
  cadence: TrackingCadence;
  periodStart: string;
  periodEnd: string;
  timezone?: string;
  content: string;
  structuredData?: Record<string, unknown>;
  recordingSummaryIds?: string[];
  sourceReportIds?: string[];
}

export interface UpdateTrackingReportDto {
  subjectNameSnapshot?: string;
  timezone?: string;
  content?: string;
  structuredData?: Record<string, unknown>;
  recordingSummaryIds?: string[];
  sourceReportIds?: string[];
}

export interface TriggerSummaryDto {
  periodType: TrackingCadence;
  targetDate?: string;
  platformUserIds?: string[];
}
