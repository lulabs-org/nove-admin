import type { CreateProfitShareRuleDto } from '../../../shared/lib/api/orval/business/schemas';

// You can map Orval schemas to local types to decouple from the auto-generator
export type RuleWritePayload = CreateProfitShareRuleDto;

export interface ProfitSharingAllocation {
  id: string;
  memberId?: string | null;
  roleId?: string | null;
  allocationRatio: number;
}

export interface ProfitSharingModule {
  id: string;
  name: string;
  shareRatio: number;
  isRefundable: boolean;
  amortizationType?: 'NONE' | 'MONTHLY' | 'END_OF_TERM';
  allocations?: ProfitSharingAllocation[];
}

export interface ProfitSharingRule {
  id: string;
  name: string;
  productId?: string | null;
  channelId?: number | null;
  validStartTime: string;
  validEndTime: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  modules: ProfitSharingModule[];
}
