import { TeamOutlined, UserOutlined, ApiOutlined } from '@ant-design/icons';
import type { RouteConfig } from '../../shared/types';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { UserManagement } from '../users/UserManagement';
import { PlatformUserManagement } from '../platform-users/PlatformUserManagement';

export const userGroupRoutes: RouteConfig[] = [
  {
    path: '/user-group',
    // menuOnly: 仅在侧边栏显示分组，不注册实际路由
    element: <></>,
    menuOnly: true,
    title: '用户管理',
    menu: true,
    permission: PERMISSIONS.USER.READ,
    icon: <TeamOutlined />,
    children: [
      {
        path: '/user-management',
        element: <UserManagement />,
        title: '本地用户',
        menu: true,
        permission: PERMISSIONS.USER.READ,
        icon: <UserOutlined />,
      },
      {
        path: '/platform-users',
        element: <PlatformUserManagement />,
        title: '平台用户',
        menu: true,
        permission: 'user:read',
        icon: <ApiOutlined />,
      },
    ],
  },
];
