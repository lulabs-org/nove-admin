import type { RouteConfig } from '../../../shared/types';
import { PERMISSIONS } from '../../../shared/utils/permissions';
import { SystemConfigManagement } from './SystemConfigManagement';

export const systemConfigRoutes: RouteConfig[] = [
  {
    path: '/settings/system-config',
    element: <SystemConfigManagement />,
    title: '服务配置',
    menu: true,
    permission: PERMISSIONS.SYSTEM.CONFIG_READ,
  },
];
