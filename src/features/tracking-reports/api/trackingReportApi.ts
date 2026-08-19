import { mutator } from '../../../shared/lib/api/mutator';
import type {
  TrackingReport,
  TrackingReportListParams,
  TrackingReportListResponse,
  CreateTrackingReportDto,
  UpdateTrackingReportDto,
  TriggerSummaryDto,
  TrackingReportSubject,
} from '../model/types';

const BASE = '/tracking-reports';

export const trackingReportApi = {
  list: (params: TrackingReportListParams): Promise<TrackingReportListResponse> =>
    mutator<TrackingReportListResponse>({ url: BASE, method: 'GET', params }),

  getById: (id: string): Promise<TrackingReport> =>
    mutator<TrackingReport>({ url: `${BASE}/${id}`, method: 'GET' }),

  getSubject: (id: string): Promise<TrackingReportSubject> =>
    mutator<TrackingReportSubject>({ url: `${BASE}/${id}/subject`, method: 'GET' }),

  create: (data: CreateTrackingReportDto): Promise<TrackingReport> =>
    mutator<TrackingReport>({ url: BASE, method: 'POST', data }),

  update: (id: string, data: UpdateTrackingReportDto): Promise<TrackingReport> =>
    mutator<TrackingReport>({ url: `${BASE}/${id}`, method: 'PUT', data }),

  delete: (id: string): Promise<void> => mutator<void>({ url: `${BASE}/${id}`, method: 'DELETE' }),

  generate: (data: TriggerSummaryDto): Promise<unknown> =>
    mutator<unknown>({ url: `${BASE}/generate`, method: 'POST', data }),
};
