export const TrackingReportType = {
  PERIODIC_MEETING_SUMMARY: 'PERIODIC_MEETING_SUMMARY',
  TRAINING_PLAN: 'TRAINING_PLAN',
  PROJECT_PROGRESS: 'PROJECT_PROGRESS',
  USER_PROFILE: 'USER_PROFILE',
} as const;

export type TrackingReportType = (typeof TrackingReportType)[keyof typeof TrackingReportType];

export const TrackingCadence = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
} as const;

export type TrackingCadence = (typeof TrackingCadence)[keyof typeof TrackingCadence];

export const TRACKING_REPORT_TYPE_LABELS: Record<TrackingReportType, string> = {
  [TrackingReportType.PERIODIC_MEETING_SUMMARY]: '会议总结',
  [TrackingReportType.TRAINING_PLAN]: '培训计划',
  [TrackingReportType.PROJECT_PROGRESS]: '项目进展',
  [TrackingReportType.USER_PROFILE]: '用户画像',
};

export const TRACKING_CADENCE_LABELS: Record<TrackingCadence, string> = {
  [TrackingCadence.DAILY]: '单日',
  [TrackingCadence.WEEKLY]: '一周',
  [TrackingCadence.MONTHLY]: '一月',
  [TrackingCadence.QUARTERLY]: '一季度',
};

export type TrackingReportSubjectKind = 'LOCAL_USER' | 'PLATFORM_USER' | 'PROJECT';

export interface TrackingReportLocalUser {
  id: string;
  username?: string | null;
  email?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  displayName?: string | null;
  avatar?: string | null;
}

export interface TrackingReportPlatformUser {
  id: string;
  platform: string;
  ptUserId?: string | null;
  ptUnionId: string;
  displayName?: string | null;
}

export interface TrackingReportProject {
  id: string;
  title: string;
  subtitle?: string | null;
  category?: string | null;
  image?: string | null;
}

export interface TrackingReportSubjectSummary {
  kind: TrackingReportSubjectKind;
  displayName: string;
  avatar?: string | null;
  isLinked: boolean;
}

export interface TrackingReportSubject extends TrackingReportSubjectSummary {
  nameSnapshot: string;
  localUser?: TrackingReportLocalUser | null;
  platformUser?: TrackingReportPlatformUser | null;
  project?: TrackingReportProject | null;
}

export interface TrackingReport {
  id: string;
  subject: TrackingReportSubject;
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

export type TrackingReportListItem = Omit<
  Pick<
    TrackingReport,
    | 'id'
    | 'subject'
    | 'trackingType'
    | 'cadence'
    | 'periodStart'
    | 'periodEnd'
    | 'isLatest'
    | 'version'
    | 'createdAt'
  >,
  'subject'
> & { subject: TrackingReportSubjectSummary };

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
  minuteSummaryIds?: string[];
  sourceReportIds?: string[];
}

export interface UpdateTrackingReportDto {
  subjectNameSnapshot?: string;
  timezone?: string;
  content?: string;
  structuredData?: Record<string, unknown>;
  minuteSummaryIds?: string[];
  sourceReportIds?: string[];
}

export interface TriggerSummaryDto {
  cadence: TrackingCadence;
  baseDate?: string;
  platformUserIds?: string[];
  subjectUserIds?: string[];
  trackingType?: TrackingReportType;
  force?: boolean;
}
