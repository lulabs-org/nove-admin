import type { RouteConfig } from '../../../shared/types/index';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { PermissionManagement } from './PermissionManagement';

export const permissionRoutes: RouteConfig[] = [
  {
    path: '/permissions',
    element: <PermissionManagement />,
    title: '权限资源',
    menu: true,
    permission: 'permission:read',
    icon: <SafetyCertificateOutlined />,
  },
];
