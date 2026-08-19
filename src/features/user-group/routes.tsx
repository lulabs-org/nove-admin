import { TeamOutlined } from '@ant-design/icons';
import type { RouteConfig } from '../../shared/types';
import { userRoutes } from './users/routes';
import { platformUserRoutes } from './platform-users/routes';

export const userGroupRoutes: RouteConfig[] = [
  {
    path: '/user-group',
    element: <></>,
    menuOnly: true,
    title: '用户管理',
    menu: true,
    permission: 'user:read',
    icon: <TeamOutlined />,
    children: [...userRoutes, ...platformUserRoutes],
  },
];
