import { TeamOutlined } from '@ant-design/icons';
import type { RouteConfig } from '../../shared/types';
import { PERMISSIONS } from '../../shared/utils/permissions';
import { UserManagement } from './UserManagement';

export const userRoutes: RouteConfig[] = [
  {
    path: '/user-management',
    element: <UserManagement />,
    title: '用户管理',
    menu: true,
    permission: PERMISSIONS.USER.READ,
    icon: <TeamOutlined />,
  },
];
