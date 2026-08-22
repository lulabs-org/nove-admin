import type { RouteConfig } from '../../../shared/types';
import { SecurityPage } from './SecurityPage';
import { PERMISSIONS } from '../../../shared/utils/permissions';

export const securityRoutes: RouteConfig[] = [
  {
    path: '/settings/security',
    element: <SecurityPage />,
    title: '安全设置',
    menu: false,
    permission: PERMISSIONS.SYSTEM.CONFIG_READ,
  },
];
