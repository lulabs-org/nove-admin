import type { RouteConfig } from '../../../shared/types';
import { PayslipList } from './PayslipList';

export const payslipsRoutes: RouteConfig[] = [
  {
    path: '/profit-sharing/payslips',
    title: '工资条',
    menu: true,
    element: <PayslipList />,
  },
];
