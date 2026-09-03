import { mutator } from '../../../../shared/lib/api/mutator';
import type { TableQueryParams, TableQueryResult } from '../../../../shared/hooks/useTableQuery';
import type { ProfitSharingDashboardStats, ProfitSharingRecord } from '../types';

export const recordApi = {
  list(params: TableQueryParams): Promise<TableQueryResult<ProfitSharingRecord>> {
    return mutator({ url: '/profit-sharing/records', method: 'GET', params });
  },
  getDashboardStats(month?: string): Promise<ProfitSharingDashboardStats> {
    return mutator({
      url: '/profit-sharing/records/dashboard-stats',
      method: 'GET',
      params: month ? { month } : undefined,
    });
  },
  settle(id: string): Promise<void> {
    return mutator({ url: `/profit-sharing/records/${id}/settle`, method: 'POST' });
  },
  undoSettle(id: string): Promise<void> {
    return mutator({ url: `/profit-sharing/records/${id}/undo-settle`, method: 'POST' });
  },
  cancel(id: string): Promise<void> {
    return mutator({ url: `/profit-sharing/records/${id}/cancel`, method: 'POST' });
  },
  restore(id: string): Promise<void> {
    return mutator({ url: `/profit-sharing/records/${id}/restore`, method: 'POST' });
  },
};
