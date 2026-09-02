export interface ProfitSharingRecord {
  id: string;
  orderId: string;
  amount: number;
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
