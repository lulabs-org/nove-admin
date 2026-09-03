export interface ProfitSharingRecord {
  id: string;
  orderId: string;
  memberId: string;
  memberName?: string;
  memberRole?: string;
  order?: {
    orderNumber: string;
    amount: number;
  };
  module?: {
    name: string;
  };
  rule?: {
    name: string;
  };
  baseAmount: number;
  profitAmount: number;
  settlementTime?: string;
  status: string;
  createdAt: string;
}

export interface ProfitSharingModuleStat {
  name: string;
  percent: number;
  amount: number;
}

export interface ProfitSharingMemberRanking {
  name: string;
  role: string;
  amount: number;
}

export interface ProfitSharingDashboardStats {
  totalOrders: number;
  totalSettled: number;
  totalPending: number;
  totalClawback: number;
  moduleStats: ProfitSharingModuleStat[];
  memberRankings: ProfitSharingMemberRanking[];
}
