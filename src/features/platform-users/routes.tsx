import type { RouteConfig } from '../../shared/types/index';
import { PlatformUserManagement } from './PlatformUserManagement';
import { ApiOutlined } from '@ant-design/icons';

export const platformUserRoutes: RouteConfig[] = [
  {
    path: '/platform-users',
    element: <PlatformUserManagement />,
    title: '平台用户',
    menu: true,
    permission: 'user:read',
    icon: <ApiOutlined />,
  },
];
