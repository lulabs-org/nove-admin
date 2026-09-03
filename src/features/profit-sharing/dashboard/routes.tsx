import type { RouteConfig } from '../../../shared/types';
import { ProfitDashboard } from './ProfitDashboard';

export const dashboardRoutes: RouteConfig[] = [
  {
    path: '/profit-sharing/dashboard',
    title: '数据看板',
    menu: true,
    element: <ProfitDashboard />,
  },
];
