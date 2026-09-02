import { mutator } from '../../../../shared/lib/api/mutator';
import type { ProfitSharingRule, RuleWritePayload } from '../types';

export const ruleApi = {
  list(): Promise<ProfitSharingRule[]> {
    return mutator({ url: '/profit-sharing/rules', method: 'GET' });
  },

  create(data: RuleWritePayload): Promise<void> {
    return mutator({ url: '/profit-sharing/rules', method: 'POST', data });
  },

  getById(id: string): Promise<ProfitSharingRule> {
    return mutator({ url: `/profit-sharing/rules/${id}`, method: 'GET' });
  },

  update(id: string, data: RuleWritePayload): Promise<void> {
    return mutator({ url: `/profit-sharing/rules/${id}`, method: 'PUT', data });
  },

  calculate(
    id: string
  ): Promise<{ success: boolean; processedOrders: number; totalFound: number }> {
    return mutator({ url: `/profit-sharing/rules/${id}/calculate`, method: 'POST' });
  },
};
