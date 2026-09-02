import { mutator } from '../../../../shared/lib/api/mutator';
import type { ProfitSharingDashboardStats, ProfitSharingRecord } from '../types';

export const recordApi = {
  list(): Promise<ProfitSharingRecord[]> {
    return mutator({ url: '/profit-sharing/records', method: 'GET' });
  },
  getDashboardStats(): Promise<ProfitSharingDashboardStats> {
    return mutator({ url: '/profit-sharing/records/dashboard-stats', method: 'GET' });
  },
};
